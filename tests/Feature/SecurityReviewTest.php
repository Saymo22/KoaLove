<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Database\Events\QueryExecuted;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

class SecurityReviewTest extends TestCase
{
    use RefreshDatabase;

    public function test_rotating_ips_cannot_bypass_the_account_login_limit(): void
    {
        $user = User::factory()->create(['email' => 'account@example.test']);
        for ($i = 1; $i <= 5; $i++) {
            $this->withServerVariables(['REMOTE_ADDR' => '192.0.2.'.$i])
                ->postJson('/api/auth/login', ['email' => $user->email, 'password' => 'incorrect'])->assertUnauthorized();
        }
        $this->withServerVariables(['REMOTE_ADDR' => '192.0.2.6'])
            ->postJson('/api/auth/login', ['email' => 'ACCOUNT@example.test', 'password' => 'incorrect'])
            ->assertStatus(429)->assertHeader('Retry-After');
        $this->withServerVariables(['REMOTE_ADDR' => '192.0.2.7'])
            ->postJson('/api/auth/login', ['email' => 'another@example.test', 'password' => 'incorrect'])->assertUnauthorized();
    }

    public function test_recovery_link_does_not_trust_the_incoming_host(): void
    {
        Notification::fake();
        config(['app.url' => 'https://site.example.test']);
        $user = User::factory()->create(['email' => 'recovery@example.test']);
        $this->withServerVariables(['HTTP_HOST' => 'attacker.example.test', 'SERVER_NAME' => 'attacker.example.test'])
            ->postJson('/api/auth/forgot-password', ['email' => $user->email])->assertOk();
        URL::setRequest(Request::create('https://attacker.example.test/api/auth/forgot-password'));
        Notification::assertSentTo($user, ResetPassword::class, function ($notification) use ($user) {
            $this->assertStringStartsWith('https://site.example.test/recuperar-senha.html#token=', $notification->toMail($user)->actionUrl);

            return true;
        });
    }

    public function test_reset_normalizes_email_and_consumes_the_token(): void
    {
        $user = User::factory()->create(['email' => 'recovery@example.test']);
        $token = Password::createToken($user);
        $data = ['email' => ' RECOVERY@example.test ', 'token' => $token, 'password' => 'new-secure-password'];
        $this->postJson('/api/auth/reset-password', $data)->assertOk();
        $this->postJson('/api/auth/reset-password', $data)->assertBadRequest();
    }

    public function test_recovery_for_unknown_and_deactivated_accounts_has_the_same_response(): void
    {
        Notification::fake();
        $user = User::factory()->create(['email' => 'inactive@example.test']);
        $user->forceFill(['deletion_requested_at' => now()])->save();
        $unknown = $this->postJson('/api/auth/forgot-password', ['email' => 'unknown@example.test'])->assertOk()->json();
        $inactive = $this->postJson('/api/auth/forgot-password', ['email' => $user->email])->assertOk()->json();
        $this->assertSame($unknown, $inactive);
        Notification::assertNothingSent();
    }

    public function test_rotating_ips_cannot_spam_recovery_for_one_account(): void
    {
        Notification::fake();
        for ($i = 1; $i <= 3; $i++) {
            $this->withServerVariables(['REMOTE_ADDR' => '192.0.2.'.$i])
                ->postJson('/api/auth/forgot-password', ['email' => 'unknown@example.test'])->assertOk();
        }
        $this->withServerVariables(['REMOTE_ADDR' => '192.0.2.4'])
            ->postJson('/api/auth/forgot-password', ['email' => 'UNKNOWN@example.test'])->assertStatus(429);
        Notification::assertNothingSent();
    }

    public function test_reset_does_not_reactivate_a_deleted_account(): void
    {
        $user = User::factory()->create(['email' => 'deleted@example.test', 'password' => 'original-password']);
        $token = Password::createToken($user);
        $user->forceFill(['deletion_requested_at' => now()])->save();
        $this->postJson('/api/auth/reset-password', ['email' => $user->email, 'token' => $token, 'password' => 'new-password'])->assertBadRequest();
        $this->assertTrue(Hash::check('original-password', $user->fresh()->password));
        $this->assertNotNull($user->fresh()->deletion_requested_at);
    }

    public function test_html_forms_are_restricted_to_the_same_origin(): void
    {
        $response = $this->followingRedirects()->get('/home.html')->assertOk();
        $this->assertStringContainsString("form-action 'self'", $response->headers->get('Content-Security-Policy'));
    }

    public function test_failed_token_consumption_rolls_back_password_change_and_session_revocation(): void
    {
        $user = User::factory()->create(['email' => 'atomic@example.test', 'password' => 'original-password']);
        $token = Password::createToken($user);
        DB::table('sessions')->insert(['id' => 'preserved-session', 'user_id' => $user->id, 'payload' => '', 'last_activity' => time()]);
        DB::listen(function (QueryExecuted $query) {
            if (str_starts_with(strtolower($query->sql), 'delete from "password_reset_tokens"')) {
                throw new \RuntimeException('Synthetic token persistence failure.');
            }
        });
        $this->postJson('/api/auth/reset-password', ['email' => $user->email, 'token' => $token, 'password' => 'new-password'])->assertStatus(500);
        $this->assertTrue(Hash::check('original-password', $user->fresh()->password));
        $this->assertDatabaseHas('password_reset_tokens', ['email' => $user->email]);
        $this->assertDatabaseHas('sessions', ['id' => 'preserved-session']);
    }

    public function test_account_deletion_requires_the_current_password_and_limits_attempts(): void
    {
        $user = User::factory()->create(['password' => 'original-password']);
        $this->actingAs($user);
        for ($i = 1; $i <= 5; $i++) {
            $this->withServerVariables(['REMOTE_ADDR' => '192.0.2.'.$i])
                ->postJson('/api/privacy/delete', ['password' => 'incorrect'])->assertUnprocessable();
        }
        $this->withServerVariables(['REMOTE_ADDR' => '192.0.2.6'])
            ->postJson('/api/privacy/delete', ['password' => 'incorrect'])->assertStatus(429);
        $this->assertNull($user->fresh()->deletion_requested_at);
    }

    public function test_error_logs_do_not_include_exception_secrets_or_dynamic_paths(): void
    {
        Log::spy();
        Route::get('/api/security-review-error/{token}', function () {
            throw new \RuntimeException('private-value-from-query-or-provider');
        });
        $this->getJson('/api/security-review-error/synthetic-private-token')->assertStatus(500)
            ->assertDontSee('private-value-from-query-or-provider')->assertDontSee('synthetic-private-token');
        Log::shouldHaveReceived('error')->once()->withArgs(function ($message, $context) {
            $serialized = json_encode([$message, $context]);
            $this->assertStringNotContainsString('private-value-from-query-or-provider', $serialized);
            $this->assertStringNotContainsString('synthetic-private-token', $serialized);
            $this->assertSame('api/security-review-error/{token}', $context['route']);
            $this->assertSame(\RuntimeException::class, $context['exception_type']);

            return true;
        });
    }

    public function test_new_bcrypt_passwords_cannot_be_truncated_or_contain_null_bytes(): void
    {
        config(['hashing.driver' => 'bcrypt']);
        $user = User::factory()->create(['email' => 'password-limit@example.test', 'password' => 'original-password']);
        $token = Password::createToken($user);
        foreach ([str_repeat('a', 73), str_repeat('á', 37), "valid-password\0suffix"] as $i => $password) {
            $this->travel(1)->minutes();
            $this->postJson('/api/auth/register', ['name' => 'Teste', 'email' => 'password-'.$i.'@example.test', 'password' => $password])
                ->assertUnprocessable()->assertJsonValidationErrors('password', 'error.meta.fields');
            $this->postJson('/api/auth/reset-password', ['email' => $user->email, 'token' => $token, 'password' => $password])
                ->assertUnprocessable()->assertJsonValidationErrors('password', 'error.meta.fields');
        }
        $this->assertDatabaseCount('users', 1);
        $this->assertTrue(Hash::check('original-password', $user->fresh()->password));
        $this->assertDatabaseHas('password_reset_tokens', ['email' => $user->email]);
    }
}
