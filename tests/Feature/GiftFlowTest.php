<?php

namespace Tests\Feature;

use App\Models\Purchase;
use App\Models\Refund;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class GiftFlowTest extends TestCase
{
    use RefreshDatabase;

    private function payload(string $theme = 'namoro'): array
    {
        return ['tema' => $theme, 'para' => 'Bia', 'titulo' => 'Nossa história', 'themeData' => [$theme => ['texts' => ['Uma memória'], 'collections' => ['quiz' => [['correct' => 2, 'opts' => ['A', 'B', 'C']]]]]], 'client_request_id' => 'request-1234567890'];
    }

    private function draft(?User $user = null): array
    {
        $user ??= User::factory()->create();
        $this->actingAs($user);

        return $this->postJson('/api/purchases', $this->payload())->assertCreated()->json('data.purchase');
    }

    private function upload(array $p, string $asset = 'asset-1234567890ab'): void
    {
        $image = imagecreatetruecolor(2, 2);
        ob_start();
        imagepng($image);
        $bytes = ob_get_clean();
        imagedestroy($image);
        $this->call('POST', "/api/purchases/{$p['id']}/media/$asset", [], [], [], ['CONTENT_TYPE' => 'image/png', 'HTTP_ACCEPT' => 'application/json'], $bytes)->assertOk();
    }

    private function ready(array $p): array
    {
        $this->upload($p);
        $data = [...$this->payload(), 'media' => ['photos' => ['asset-1234567890ab'], 'videos' => [], 'music' => null]];

        return $this->postJson("/api/purchases/{$p['id']}/update", $data)->assertOk()->json('data.purchase');
    }

    public function test_authentication_validation_session_and_no_hash_disclosure(): void
    {
        $this->postJson('/api/auth/register', ['name' => 'Ana', 'email' => 'ANA@example.test', 'password' => 'strong-pass'])->assertCreated()->assertJsonMissingPath('data.user.password');
        $this->getJson('/api/auth/me')->assertOk()->assertJsonPath('data.user.email', 'ana@example.test');
        $this->postJson('/api/auth/logout', ['confirm' => true])->assertOk();
        $this->getJson('/api/auth/me')->assertUnauthorized();
        $this->postJson('/api/auth/register', ['name' => 'Ana', 'email' => 'Ana@example.test', 'password' => 'strong-pass'])->assertUnprocessable();
        $this->postJson('/api/auth/login', ['email' => 'none@example.test', 'password' => 'bad'])->assertUnauthorized();
        $this->postJson('/api/auth/login', ['email' => 'ana@example.test', 'password' => 'strong-pass'])->assertOk();
        $this->assertTrue(Hash::check('strong-pass', User::first()->password));
    }

    public function test_guests_users_and_admins_are_separated(): void
    {
        $this->getJson('/api/purchases')->assertUnauthorized();
        $p = $this->draft();
        $this->getJson('/api/admin/summary')->assertForbidden();
        $this->actingAs(User::factory()->create());
        $this->getJson('/api/purchases/'.$p['id'])->assertForbidden();
        $this->postJson('/api/purchases/'.$p['id'].'/delete', ['confirm' => true])->assertForbidden();
        $this->getJson('/api/shared/'.$p['share_token'])->assertNotFound();
    }

    public function test_every_theme_round_trips_without_losing_exclusive_fields(): void
    {
        $this->actingAs(User::factory()->create());
        foreach (array_keys(config('gift.themes')) as $theme) {
            $this->travel(1)->minutes();
            $data = $this->payload($theme);
            $data['client_request_id'] = 'request-'.$theme.'-1234567890';
            $this->postJson('/api/purchases', $data)->assertCreated()->assertJsonPath('data.purchase.themeData', $data['themeData']);
        }
        $this->assertDatabaseCount('purchases', 13);
    }

    public function test_create_retries_are_idempotent_and_prices_cannot_be_overridden(): void
    {
        $p = $this->draft();
        $this->postJson('/api/purchases', [...$this->payload(), 'price_cents' => 1, 'status' => 'paid', 'user_id' => 999])->assertCreated()->assertJsonPath('data.purchase.id', $p['id'])->assertJsonPath('data.purchase.price_cents', 1990)->assertJsonPath('data.purchase.status', 'pending');
        $this->assertDatabaseCount('purchases', 1);
    }

    public function test_upload_finalize_payment_shared_projection_and_range(): void
    {
        config(['gift.simulated_payments' => true]);
        Storage::fake('local');
        $p = $this->draft();
        $this->postJson('/api/purchases/'.$p['id'].'/pay', ['metodo' => 'pix'])->assertConflict();
        $this->ready($p);
        $this->postJson('/api/purchases/'.$p['id'].'/pay', ['metodo' => 'pix'])->assertOk()->assertJsonPath('data.purchase.status', 'paid');
        $this->postJson('/api/purchases/'.$p['id'].'/pay', ['metodo' => 'pix'])->assertOk();
        $this->getJson('/api/shared/'.$p['share_token'])->assertOk()->assertJsonMissingPath('data.purchase.user_id')->assertJsonMissingPath('data.purchase.share_token')->assertJsonMissingPath('data.purchase.amount_paid_cents');
        $response = $this->withHeaders(['Range' => 'bytes=0-7'])->get('/api/shared/'.$p['share_token'].'/media/asset-1234567890ab');
        $response->assertStatus(206)->assertHeader('Content-Type', 'image/png');
        $this->postJson('/api/purchases/'.$p['id'].'/update', $this->payload())->assertConflict();
    }

    public function test_malicious_media_and_missing_manifest_fail_without_publishing(): void
    {
        Storage::fake('local');
        $p = $this->draft();
        $this->call('POST', '/api/purchases/'.$p['id'].'/media/asset-1234567890ab', [], [], [], ['CONTENT_TYPE' => 'image/png', 'HTTP_ACCEPT' => 'application/json'], '<script>bad</script>')->assertStatus(415);
        $this->assertDatabaseCount('media_assets', 0);
        $this->assertSame([], Storage::disk('local')->allFiles());
        $this->postJson('/api/purchases/'.$p['id'].'/update', [...$this->payload(), 'media' => ['photos' => ['not-uploaded'], 'videos' => []]])->assertUnprocessable();
        $this->getJson('/api/shared/'.$p['share_token'])->assertNotFound();
    }

    public function test_body_limits_and_nested_validation(): void
    {
        $this->actingAs(User::factory()->create());
        $this->call('POST', '/api/purchases', [], [], [], ['CONTENT_TYPE' => 'application/json'], 'null')->assertBadRequest();
        $this->call('POST', '/api/purchases', [], [], [], ['CONTENT_TYPE' => 'application/json'], '{')->assertBadRequest();
        $this->postJson('/api/purchases', [...$this->payload(), 'themeData' => ['__proto__' => []]])->assertUnprocessable();
        $this->postJson('/api/purchases', [...$this->payload(), 'tema' => 'unknown'])->assertUnprocessable();
        $this->postJson('/api/purchases', [...$this->payload(), 'carta' => str_repeat('a', 2100000)])->assertStatus(413);
    }

    public function test_simulation_is_disabled_by_default(): void
    {
        Storage::fake('local');
        config(['gift.simulated_payments' => false]);
        $p = $this->ready($this->draft());
        $this->postJson('/api/purchases/'.$p['id'].'/pay', ['metodo' => 'pix'])->assertStatus(503);
        $this->assertDatabaseHas('purchases', ['id' => $p['id'], 'status' => 'pending']);
    }

    public function test_password_reset_is_one_time_and_invalidates_sessions(): void
    {
        Notification::fake();
        $user = User::factory()->create(['email' => 'ana@example.test']);
        $this->postJson('/api/auth/forgot-password', ['email' => $user->email])->assertOk();
        $token = Password::createToken($user);
        DB::table('sessions')->insert(['id' => 'old-session', 'user_id' => $user->id, 'payload' => '', 'last_activity' => time()]);
        $data = ['email' => $user->email, 'token' => $token, 'password' => 'new-password'];
        $this->postJson('/api/auth/reset-password', $data)->assertOk();
        $this->assertDatabaseMissing('sessions', ['id' => 'old-session']);
        $this->postJson('/api/auth/reset-password', $data)->assertBadRequest();
        $this->assertTrue(Hash::check('new-password', $user->fresh()->password));
    }

    public function test_refund_decision_is_atomic_and_cannot_be_reversed(): void
    {
        $p = $this->draft();
        $purchase = Purchase::find($p['id']);
        $purchase->update(['status' => 'paid']);
        Refund::create(['id' => 'r_test', 'purchase_id' => $p['id'], 'user_id' => $purchase->user_id, 'status' => 'pending']);
        $admin = User::factory()->create();
        $admin->forceFill(['role' => 'admin'])->save();
        $this->actingAs($admin);
        $this->postJson('/api/admin/refunds/r_test/decision', ['status' => 'approved'])->assertOk();
        $this->assertDatabaseHas('purchases', ['id' => $p['id'], 'status' => 'refunded']);
        $this->postJson('/api/admin/refunds/r_test/decision', ['status' => 'approved'])->assertOk();
        $this->postJson('/api/admin/refunds/r_test/decision', ['status' => 'rejected'])->assertConflict();
    }

    public function test_export_deletion_retention_and_audit_redaction(): void
    {
        Storage::fake('local');
        $user = User::factory()->create(['password' => 'strong-pass']);
        $p = $this->draft($user);
        $this->getJson('/api/privacy/export')->assertOk()->assertJsonMissingPath('account.password')->assertJsonMissingPath('purchases.0.share_token');
        $this->postJson('/api/privacy/delete', ['password' => 'wrong'])->assertUnprocessable();
        $this->postJson('/api/privacy/delete', ['password' => 'strong-pass'])->assertOk();
        $this->getJson('/api/auth/me')->assertUnauthorized();
        $this->postJson('/api/auth/login', ['email' => $user->email, 'password' => 'strong-pass'])->assertUnauthorized();
        $this->assertStringNotContainsString($user->email, DB::table('audit_events')->get()->toJson());
        $this->travel(31)->days();
        $this->artisan('privacy:prune')->assertSuccessful();
        $this->assertDatabaseMissing('users', ['id' => $user->id]);
        $this->assertDatabaseCount('purchases', 0);
        $this->assertDatabaseCount('audit_events', 0);
    }

    public function test_rate_limit_has_retry_after_and_security_headers(): void
    {
        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/auth/login', ['email' => 'x@example.test', 'password' => 'bad'])->assertUnauthorized();
        }
        $this->postJson('/api/auth/login', ['email' => 'x@example.test', 'password' => 'bad'])->assertStatus(429)->assertHeader('Retry-After')->assertHeader('X-Content-Type-Options', 'nosniff');
    }

    public function test_all_blade_pages_render_and_private_files_are_not_public(): void
    {
        foreach (json_decode(file_get_contents(resource_path('assets.json')), true) as $page) {
            $this->get($page['url'])->assertOk();
        }
        foreach (['/server/data/users.json', '/.env', '/storage/app/private/test', '/server/index.js'] as $url) {
            $this->assertContains($this->get($url)->status(), [403, 404]);
        }
    }
}
