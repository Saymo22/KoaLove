<?php

namespace Tests\Feature;

use App\Adapters\GoogleOidcIdentityProvider;
use App\Contracts\IdentityProvider;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
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
        ]);
        $this->app->instance(IdentityProvider::class, $provider);

        $this->get('/auth/google/redirect')->assertRedirect('https://accounts.google.test/authorize');
        $flow = $this->app['session.store']->get('google_oidc');
        $this->get('/auth/google/callback?state='.$flow['state'].'&code=one-time-code')
            ->assertRedirect('/minha-conta.html');

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
}
