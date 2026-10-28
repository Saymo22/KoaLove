<?php

namespace Tests\Feature;

use App\Adapters\GoogleOidcIdentityProvider;
use App\Contracts\IdentityProvider;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Password;
use Mockery;
use Tests\TestCase;

class GoogleAuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_google_callback_links_an_existing_account_only_after_state_validation(): void
    {
        config(['services.google.client_id' => 'client-id', 'services.google.client_secret' => 'client-secret']);
        $user = User::factory()->create(['email' => 'person@example.test']);
        $provider = Mockery::mock(IdentityProvider::class);
        $provider->shouldReceive('authorizationUrl')->once()->andReturn('https://accounts.google.test/authorize');
        $provider->shouldReceive('identityFromCode')->once()->andReturn([
            'sub' => 'google-sub-1',
            'email' => 'person@example.test',
            'name' => 'Pessoa Google',
            'picture' => 'https://lh3.googleusercontent.com/avatar.png',
            'email_authoritative' => true,
        ]);
        $this->app->instance(IdentityProvider::class, $provider);

        $this->get('/auth/google/redirect')->assertRedirect('https://accounts.google.test/authorize');
        $flow = $this->app['session.store']->get('google_oidc');
        $this->get('/auth/google/callback?state='.$flow['state'].'&code=one-time-code')
            ->assertRedirect('/minha-conta');

        $this->assertAuthenticatedAs($user->fresh());
        $this->assertSame('google-sub-1', $user->fresh()->google_sub);
        $this->assertNotNull($user->fresh()->email_verified_at);
        $this->assertSame('https://lh3.googleusercontent.com/avatar.png', $user->fresh()->google_avatar_url);
    }

    public function test_invalid_google_state_does_not_call_provider_or_create_an_account(): void
    {
        config(['services.google.client_id' => 'client-id', 'services.google.client_secret' => 'client-secret']);
        $provider = Mockery::mock(IdentityProvider::class);
        $provider->shouldReceive('authorizationUrl')->once()->andReturn('https://accounts.google.test/authorize');
        $provider->shouldNotReceive('identityFromCode');
        $this->app->instance(IdentityProvider::class, $provider);

        $this->get('/auth/google/redirect');
        $this->get('/auth/google/callback?state=attacker-state&code=one-time-code')
            ->assertRedirect('/login.html?google=failed');
        $this->assertDatabaseCount('users', 0);
    }

    public function test_risc_account_disabled_event_revokes_sessions_and_is_idempotent(): void
    {
        $user = User::factory()->create(['google_sub' => 'google-sub-2']);
        DB::table('sessions')->insert([
            'id' => 'google-session', 'user_id' => $user->id, 'payload' => '', 'last_activity' => time(),
        ]);
        $provider = Mockery::mock(GoogleOidcIdentityProvider::class);
        $provider->shouldReceive('verifiedClaims')->twice()->andReturn([
            'iss' => 'https://accounts.google.com/',
            'aud' => 'google-client-id',
            'jti' => 'event-123',
            'iat' => now()->timestamp,
            'events' => [
                'https://schemas.openid.net/secevent/risc/event-type/account-disabled' => [
                    'subject' => [
                        'subject_type' => 'iss-sub',
                        'iss' => 'https://accounts.google.com/',
                        'sub' => 'google-sub-2',
                    ],
                    'reason' => 'hijacking',
                ],
            ],
        ]);
        $this->app->instance(GoogleOidcIdentityProvider::class, $provider);
        config(['services.google.client_ids' => 'google-client-id']);
        $server = ['CONTENT_TYPE' => 'application/secevent+jwt'];

        $this->call('POST', '/api/webhooks/google/security-events', [], [], [], $server, 'signed-event')
            ->assertAccepted();
        $this->assertDatabaseMissing('sessions', ['id' => 'google-session']);
        $this->assertNotNull($user->fresh()->google_signin_disabled_at);
        $this->assertDatabaseHas('google_security_events', ['event_id' => 'event-123']);
        $this->call('POST', '/api/webhooks/google/security-events', [], [], [], $server, 'signed-event')
            ->assertAccepted();
        $this->assertDatabaseCount('google_security_events', 1);
    }

    private function googleFlow(array $identity, string $next = '/minha-conta.html'): array
    {
        config(['services.google.client_id' => 'test-client', 'services.google.client_secret' => 'test-secret']);
        $provider = Mockery::mock(IdentityProvider::class);
        $provider->shouldReceive('authorizationUrl')->andReturn('https://accounts.google.test/authorize');
        $provider->shouldReceive('identityFromCode')->andReturn($identity);
        $this->app->instance(IdentityProvider::class, $provider);
        $this->get('/auth/google/redirect?'.http_build_query(['next' => $next]));

        return $this->app['session.store']->get('google_oidc');
    }

    public function test_third_party_verified_email_cannot_take_over_a_local_account(): void
    {
        $user = User::factory()->create(['email' => 'synthetic@example.test']);
        $flow = $this->googleFlow(['sub' => 'external-sub', 'email' => $user->email,
            'name' => 'Synthetic', 'picture' => null, 'email_authoritative' => false]);
        $this->get('/auth/google/callback?state='.$flow['state'].'&code=code')->assertRedirect('/login.html?google=failed');
        $this->assertGuest();
        $this->assertNull($user->fresh()->google_sub);
    }

    public function test_google_callback_keeps_the_draft_return_query_and_state_is_single_use(): void
    {
        $flow = $this->googleFlow(['sub' => 'new-sub', 'email' => 'synthetic@example.test',
            'name' => 'Synthetic', 'picture' => null, 'email_authoritative' => false], '/criar.html?resume=synthetic-draft-123');
        $this->get('/auth/google/callback?state='.$flow['state'].'&code=code')->assertRedirect('/criar.html?resume=synthetic-draft-123');
        $this->assertAuthenticated();
        $this->assertSame(0, session('google_session_version'));
        $this->get('/auth/google/callback?state='.$flow['state'].'&code=code')->assertRedirect('/login.html?google=failed');
        $this->assertDatabaseCount('users', 1);
    }

    private function securityEvent(string $type, string $id, int $issued): void
    {
        $provider = Mockery::mock(GoogleOidcIdentityProvider::class);
        $provider->shouldReceive('verifiedClaims')->once()->andReturn(['iss' => 'https://accounts.google.com/',
            'aud' => 'test-client', 'iat' => $issued, 'jti' => $id, 'events' => [$type => ['subject' => [
                'subject_type' => 'iss-sub', 'iss' => 'https://accounts.google.com/', 'sub' => 'event-sub',
            ]]]]);
        $this->app->instance(GoogleOidcIdentityProvider::class, $provider);
        config(['services.google.client_ids' => ' other-client, test-client ']);
    }

    private function sendSecurityEvent()
    {
        return $this->call('POST', '/api/webhooks/google/security-events', [], [], [],
            ['CONTENT_TYPE' => 'application/secevent+jwt'], 'synthetic-signed-event');
    }

    public function test_old_security_events_cannot_reenable_a_disabled_account_or_be_replayed_after_retention(): void
    {
        $user = User::factory()->create(['google_sub' => 'event-sub']);
        $prefix = 'https://schemas.openid.net/secevent/risc/event-type/';
        $this->securityEvent($prefix.'account-disabled', 'new-disable', now()->subMinute()->timestamp);
        $this->sendSecurityEvent()->assertAccepted()->assertJsonPath('data.accepted', true);
        $this->securityEvent($prefix.'account-enabled', 'old-enable', now()->subMinutes(2)->timestamp);
        $this->sendSecurityEvent()->assertAccepted();
        $this->assertNotNull($user->fresh()->google_signin_disabled_at);
        $this->securityEvent($prefix.'account-enabled', 'expired-enable', now()->subDays(31)->timestamp);
        $this->sendSecurityEvent()->assertStatus(400)->assertJsonPath('error.code', 'INVALID_SECURITY_EVENT');
        $this->assertDatabaseMissing('google_security_events', ['event_id' => 'expired-enable']);
    }

    public function test_disabled_google_accounts_cannot_reuse_password_reset_tokens(): void
    {
        $user = User::factory()->create(['google_sub' => 'event-sub']);
        $token = Password::createToken($user);
        $this->securityEvent('https://schemas.openid.net/secevent/risc/event-type/account-disabled', 'disable-reset', now()->timestamp);
        $this->sendSecurityEvent()->assertAccepted();
        $this->assertDatabaseMissing('password_reset_tokens', ['email' => $user->email]);
        $this->postJson('/api/auth/reset-password', ['email' => $user->email, 'token' => $token, 'password' => 'SyntheticPass-789!'])->assertStatus(400);
    }

    public function test_revoked_google_session_cannot_return_after_the_security_event(): void
    {
        $user = User::factory()->create(['google_sub' => 'event-sub']);
        $this->actingAs($user)->withSession(['google_session_version' => 0]);
        $this->securityEvent('https://schemas.openid.net/secevent/risc/event-type/sessions-revoked', 'revoke', now()->timestamp);
        $this->sendSecurityEvent()->assertAccepted();
        $this->actingAs($user->fresh())->withSession(['google_session_version' => 0])->getJson('/api/auth/me')->assertUnauthorized();
    }

    public function test_google_start_is_not_globally_limited_by_the_missing_email_field(): void
    {
        config(['services.google.client_id' => 'test-client', 'services.google.client_secret' => 'test-secret']);
        $provider = Mockery::mock(IdentityProvider::class);
        $provider->shouldReceive('authorizationUrl')->times(6)->andReturn('https://accounts.google.test/authorize');
        $this->app->instance(IdentityProvider::class, $provider);
        for ($i = 1; $i <= 6; $i++) {
            $this->withServerVariables(['REMOTE_ADDR' => '192.0.2.'.$i])->get('/auth/google/redirect')->assertRedirect();
        }
    }

    public function test_oversized_risc_body_is_rejected_before_signature_work_without_content_length(): void
    {
        $provider = Mockery::mock(GoogleOidcIdentityProvider::class);
        $provider->shouldNotReceive('verifiedClaims');
        $this->app->instance(GoogleOidcIdentityProvider::class, $provider);
        $this->call('POST', '/api/webhooks/google/security-events', [], [], [],
            ['CONTENT_TYPE' => 'application/secevent+jwt'], str_repeat('x', 12001))->assertStatus(413)->assertJsonStructure(['ok', 'error' => ['code', 'message']]);
    }

    public function test_future_risc_event_and_external_return_url_are_rejected(): void
    {
        $this->securityEvent('https://schemas.openid.net/secevent/risc/event-type/account-disabled', 'future', now()->addMinutes(2)->timestamp);
        $this->sendSecurityEvent()->assertStatus(400);
        $this->assertDatabaseCount('google_security_events', 0);
        $this->googleFlow(['sub' => 'unused'], '//external.example.test/path');
        $this->assertSame('/minha-conta', session('google_login_next'));
    }
}
