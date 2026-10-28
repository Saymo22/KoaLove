<?php

namespace Tests\Feature;

use App\Adapters\GoogleOidcIdentityProvider;
use Illuminate\Http\Client\Factory;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use RuntimeException;
use Tests\TestCase;

class GoogleOidcProviderTest extends TestCase
{
    private static $key;

    private function encode(string $value): string
    {
        return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
    }

    private function token(array $changes = [], string $kid = 'test-key'): string
    {
        self::$key ??= openssl_pkey_new(['private_key_bits' => 2048, 'private_key_type' => OPENSSL_KEYTYPE_RSA]);
        $header = $this->encode(json_encode(['alg' => 'RS256', 'kid' => $kid]));
        $claims = $this->encode(json_encode(array_replace(['iss' => 'https://accounts.google.com', 'aud' => 'test-client',
            'iat' => now()->timestamp, 'exp' => now()->addHour()->timestamp, 'sub' => 'synthetic-sub',
            'nonce' => 'test-nonce', 'email_verified' => true, 'email' => 'synthetic@example.test'], $changes)));
        openssl_sign($header.'.'.$claims, $signature, self::$key, OPENSSL_ALGO_SHA256);

        return $header.'.'.$claims.'.'.$this->encode($signature);
    }

    private function fakeGoogle(string $token): void
    {
        $rsa = openssl_pkey_get_details(self::$key)['rsa'];
        Cache::flush();
        Http::swap(new Factory);
        config(['services.google.client_id' => 'test-client', 'services.google.client_secret' => 'test-secret']);
        Http::preventStrayRequests();
        Http::fake([
            'https://oauth2.googleapis.com/token' => Http::response(['id_token' => $token]),
            'https://accounts.google.com/.well-known/risc-configuration' => Http::response([
                'issuer' => 'https://accounts.google.com', 'jwks_uri' => 'https://www.googleapis.com/oauth2/v3/certs']),
            'https://www.googleapis.com/oauth2/v3/certs' => Http::response(['keys' => [[
                'kid' => 'test-key', 'alg' => 'RS256', 'kty' => 'RSA', 'use' => 'sig',
                'n' => $this->encode($rsa['n']), 'e' => $this->encode($rsa['e']),
            ]]]),
        ]);
    }

    public function test_signed_oidc_token_uses_oidc_keys_and_preserves_email_authority(): void
    {
        $this->fakeGoogle($this->token());
        $identity = app(GoogleOidcIdentityProvider::class)->identityFromCode('code', 'verifier', 'test-nonce');
        $this->assertSame('synthetic-sub', $identity['sub']);
        $this->assertFalse($identity['email_authoritative']);
        Http::assertNotSent(fn ($request) => str_contains($request->url(), 'risc-configuration'));
        foreach ([['email' => 'synthetic@gmail.com'], ['hd' => 'example.test']] as $changes) {
            $this->fakeGoogle($this->token($changes));
            $this->assertTrue(app(GoogleOidcIdentityProvider::class)->identityFromCode('code', 'verifier', 'test-nonce')['email_authoritative']);
        }
    }

    public function test_risc_discovery_accepts_the_current_google_issuer(): void
    {
        $token = $this->token(['iss' => 'https://accounts.google.com/']);
        $this->fakeGoogle($token);
        $this->assertSame('synthetic-sub', app(GoogleOidcIdentityProvider::class)->verifiedClaims($token, true)['sub']);
    }

    public function test_invalid_claims_and_tampered_signature_are_rejected(): void
    {
        foreach ([['nonce' => 'wrong'], ['aud' => 'other'], ['exp' => now()->subMinute()->timestamp],
            ['iat' => now()->addMinutes(2)->timestamp], ['email_verified' => false], ['iss' => 'https://attacker.test'],
            ['sub' => ''], ['aud' => ['test-client', 'other'], 'azp' => 'other']] as $changes) {
            $this->fakeGoogle($this->token($changes));
            try {
                app(GoogleOidcIdentityProvider::class)->identityFromCode('code', 'verifier', 'test-nonce');
                $this->fail('Invalid claims accepted');
            } catch (RuntimeException $error) {
                $this->assertSame('Google ID token claims failed validation.', $error->getMessage());
            }
        }
        $token = $this->token();
        $parts = explode('.', $token);
        $parts[1] = $this->encode(json_encode(['sub' => 'forged']));
        $this->fakeGoogle(implode('.', $parts));
        $this->expectException(RuntimeException::class);
        app(GoogleOidcIdentityProvider::class)->identityFromCode('code', 'verifier', 'test-nonce');
    }

    public function test_unknown_key_ids_do_not_force_unbounded_google_refreshes(): void
    {
        $token = $this->token([], 'unknown');
        $this->fakeGoogle($token);
        for ($i = 0; $i < 4; $i++) {
            try {
                app(GoogleOidcIdentityProvider::class)->verifiedClaims($token);
            } catch (RuntimeException) { /* Untrusted key must never authenticate. */
            }
        }
        Http::assertSentCount(2);
    }
}
