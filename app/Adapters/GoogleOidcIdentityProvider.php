<?php

namespace App\Adapters;

use App\Contracts\IdentityProvider;
use App\Exceptions\GoogleKeyDiscoveryUnavailable;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class GoogleOidcIdentityProvider implements IdentityProvider
{
    private const AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';

    private const TOKEN_URL = 'https://oauth2.googleapis.com/token';

    private const JWKS_URL = 'https://www.googleapis.com/oauth2/v3/certs';

    private const RISC_CONFIGURATION_URL = 'https://accounts.google.com/.well-known/risc-configuration';

    public function authorizationUrl(string $state, string $nonce, string $codeChallenge): string
    {
        return self::AUTH_URL.'?'.http_build_query([
            'client_id' => config('services.google.client_id'),
            'redirect_uri' => config('services.google.redirect'),
            'response_type' => 'code',
            'scope' => 'openid email profile',
            'state' => $state,
            'nonce' => $nonce,
            'code_challenge' => $codeChallenge,
            'code_challenge_method' => 'S256',
        ], '', '&', PHP_QUERY_RFC3986);
    }

    public function identityFromCode(string $code, string $codeVerifier, string $nonce): array
    {
        $response = Http::asForm()->acceptJson()->timeout(8)->post(self::TOKEN_URL, [
            'code' => $code,
            'client_id' => config('services.google.client_id'),
            'client_secret' => config('services.google.client_secret'),
            'redirect_uri' => config('services.google.redirect'),
            'grant_type' => 'authorization_code',
            'code_verifier' => $codeVerifier,
        ]);
        if (! $response->successful() || ! is_string($response->json('id_token'))) {
            throw new RuntimeException('Google token exchange failed.');
        }

        $claims = $this->verifiedClaims($response->json('id_token'));
        $issuer = $claims['iss'] ?? null;
        $audience = $claims['aud'] ?? null;
        $issuedAt = filter_var($claims['iat'] ?? null, FILTER_VALIDATE_INT);
        $expires = filter_var($claims['exp'] ?? null, FILTER_VALIDATE_INT);
        $clientId = (string) config('services.google.client_id');
        $audienceMatches = is_string($audience) ? hash_equals($clientId, $audience)
            : (is_array($audience) && in_array($clientId, $audience, true));
        $authorizedPartyMatches = ! is_array($audience) || count($audience) === 1
            ? (! isset($claims['azp']) || (is_string($claims['azp']) && hash_equals($clientId, $claims['azp'])))
            : (is_string($claims['azp'] ?? null) && hash_equals($clientId, $claims['azp']));
        if (! in_array($issuer, ['https://accounts.google.com', 'accounts.google.com'], true)
            || ! $audienceMatches
            || ! $authorizedPartyMatches
            || ! is_int($issuedAt) || $issuedAt > now()->timestamp + 60
            || ! is_int($expires) || $expires <= now()->timestamp
            || ! is_string($claims['nonce'] ?? null) || ! hash_equals($nonce, $claims['nonce'])
            || ($claims['email_verified'] ?? false) !== true
            || ! is_string($claims['sub'] ?? null) || $claims['sub'] === '' || strlen($claims['sub']) > 255
            || ! is_string($claims['email'] ?? null) || strlen($claims['email']) > 254
            || ! filter_var($claims['email'], FILTER_VALIDATE_EMAIL)) {
            throw new RuntimeException('Google ID token claims failed validation.');
        }

        $picture = $claims['picture'] ?? null;
        if (! is_string($picture) || strlen($picture) > 2048 || ! $this->isGoogleAvatar($picture)) {
            $picture = null;
        }

        return [
            'sub' => $claims['sub'],
            'email' => mb_strtolower(trim($claims['email'])),
            'name' => is_string($claims['name'] ?? null) ? mb_substr(trim($claims['name']), 0, 60) : '',
            'picture' => $picture,
            'email_authoritative' => str_ends_with(mb_strtolower($claims['email']), '@gmail.com')
                || (is_string($claims['hd'] ?? null) && $claims['hd'] !== ''),
        ];
    }

    /** @return array<string, mixed> */
    public function verifiedClaims(string $jwt, bool $securityEvent = false): array
    {
        $parts = explode('.', $jwt);
        if (count($parts) !== 3 || strlen($jwt) > 12000) {
            throw new RuntimeException('Malformed Google JWT.');
        }
        [$encodedHeader, $encodedClaims, $encodedSignature] = $parts;
        $header = $this->decodeObject($encodedHeader);
        $claims = $this->decodeObject($encodedClaims);
        if (($header['alg'] ?? null) !== 'RS256' || ! is_string($header['kid'] ?? null)) {
            throw new RuntimeException('Unsupported Google JWT.');
        }
        $key = $this->googleKey($header['kid'], $securityEvent);
        $signature = $this->decodeBase64Url($encodedSignature);
        if (openssl_verify($encodedHeader.'.'.$encodedClaims, $signature, $key, OPENSSL_ALGO_SHA256) !== 1) {
            throw new RuntimeException('Google JWT signature failed validation.');
        }

        return $claims;
    }

    private function googleKey(string $kid, bool $securityEvent): string
    {
        $jwksUri = $securityEvent ? Cache::remember('google-risc-jwks-uri', now()->addDay(), function () {
            try {
                $response = Http::acceptJson()->timeout(5)->get(self::RISC_CONFIGURATION_URL);
            } catch (\Throwable $error) {
                throw new GoogleKeyDiscoveryUnavailable('Google signing key discovery failed.', 0, $error);
            }
            $configuration = $response->json();
            $uri = is_array($configuration) ? ($configuration['jwks_uri'] ?? null) : null;
            if (! $response->successful() || ! is_array($configuration)
                || ! in_array($configuration['issuer'] ?? null, ['https://accounts.google.com', 'https://accounts.google.com/'], true)
                || $uri !== self::JWKS_URL) {
                throw new GoogleKeyDiscoveryUnavailable('Google signing key discovery failed.');
            }

            return $uri;
        }) : self::JWKS_URL;
        $keys = Cache::remember('google-oidc-jwks', now()->addHour(), function () use ($jwksUri) {
            try {
                $response = Http::acceptJson()->timeout(5)->get($jwksUri);
            } catch (\Throwable $error) {
                throw new GoogleKeyDiscoveryUnavailable('Google signing keys unavailable.', 0, $error);
            }
            if (! $response->successful() || ! is_array($response->json('keys'))) {
                throw new GoogleKeyDiscoveryUnavailable('Google signing keys unavailable.');
            }

            return $response->json('keys');
        });
        $key = collect($keys)->first(fn ($key) => ($key['kid'] ?? null) === $kid && ($key['kty'] ?? null) === 'RSA'
            && ($key['alg'] ?? 'RS256') === 'RS256' && ($key['use'] ?? 'sig') === 'sig'
            && (! isset($key['key_ops']) || in_array('verify', $key['key_ops'], true)));
        if (! $key && Cache::add('google-jwks-refresh', true, 30)) {
            Cache::forget('google-oidc-jwks');
            $keys = Cache::remember('google-oidc-jwks', now()->addHour(), function () use ($jwksUri) {
                try {
                    $response = Http::acceptJson()->timeout(5)->get($jwksUri);
                } catch (\Throwable $error) {
                    throw new GoogleKeyDiscoveryUnavailable('Google signing keys unavailable.', 0, $error);
                }
                if (! $response->successful() || ! is_array($response->json('keys'))) {
                    throw new GoogleKeyDiscoveryUnavailable('Google signing keys unavailable.');
                }

                return $response->json('keys');
            });
            $key = collect($keys)->first(fn ($key) => ($key['kid'] ?? null) === $kid && ($key['kty'] ?? null) === 'RSA'
                && ($key['alg'] ?? 'RS256') === 'RS256' && ($key['use'] ?? 'sig') === 'sig'
                && (! isset($key['key_ops']) || in_array('verify', $key['key_ops'], true)));
        }
        if (! is_array($key) || ! is_string($key['n'] ?? null) || ! is_string($key['e'] ?? null)) {
            throw new RuntimeException('Google signing key not found.');
        }

        $modulus = $this->decodeBase64Url($key['n']);
        $exponent = $this->decodeBase64Url($key['e']);
        $rsaKey = "\x30".$this->derLength(strlen($this->derInteger($modulus).$this->derInteger($exponent)))
            .$this->derInteger($modulus).$this->derInteger($exponent);
        $algorithm = "\x30\x0d\x06\x09\x2a\x86\x48\x86\xf7\x0d\x01\x01\x01\x05\x00";
        $bitString = "\x03".$this->derLength(strlen($rsaKey) + 1)."\x00".$rsaKey;
        $rsa = "\x30".$this->derLength(strlen($algorithm.$bitString)).$algorithm.$bitString;
        $pem = "-----BEGIN PUBLIC KEY-----\n".chunk_split(base64_encode($rsa), 64, "\n")."-----END PUBLIC KEY-----\n";
        if (! openssl_pkey_get_public($pem)) {
            throw new RuntimeException('Invalid Google signing key.');
        }

        return $pem;
    }

    private function isGoogleAvatar(string $url): bool
    {
        $parts = parse_url($url);
        $host = strtolower((string) ($parts['host'] ?? ''));

        return ($parts['scheme'] ?? null) === 'https'
            && ! isset($parts['user']) && ! isset($parts['pass'])
            && (str_ends_with($host, '.googleusercontent.com') || $host === 'googleusercontent.com');
    }

    /** @return array<string, mixed> */
    private function decodeObject(string $value): array
    {
        $decoded = json_decode($this->decodeBase64Url($value), true);
        if (! is_array($decoded)) {
            throw new RuntimeException('Malformed Google JWT JSON.');
        }

        return $decoded;
    }

    private function decodeBase64Url(string $value): string
    {
        if ($value === '' || ! preg_match('/\A[A-Za-z0-9_-]+\z/', $value)) {
            throw new RuntimeException('Malformed base64url value.');
        }
        $decoded = base64_decode(strtr($value, '-_', '+/').str_repeat('=', (4 - strlen($value) % 4) % 4), true);
        if ($decoded === false) {
            throw new RuntimeException('Malformed base64url value.');
        }

        return $decoded;
    }

    private function derInteger(string $value): string
    {
        if (ord($value[0]) > 0x7F) {
            $value = "\x00".$value;
        }

        return "\x02".$this->derLength(strlen($value)).$value;
    }

    private function derLength(int $length): string
    {
        if ($length < 128) {
            return chr($length);
        }
        $bytes = ltrim(pack('N', $length), "\x00");

        return chr(0x80 | strlen($bytes)).$bytes;
    }
}
