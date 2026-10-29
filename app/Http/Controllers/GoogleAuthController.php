<?php

namespace App\Http\Controllers;

use App\Contracts\IdentityProvider;
use App\Models\User;
use App\Support\PageUrls;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Throwable;

class GoogleAuthController extends Controller
{
    public function redirect(Request $request, IdentityProvider $provider)
    {
        abort_unless(config('services.google.client_id') && config('services.google.client_secret') && config('services.google.redirect'), 503);
        $state = Str::random(64);
        $nonce = Str::random(64);
        $verifier = Str::random(96);
        $request->session()->put('google_oidc', [
            'state' => $state,
            'nonce' => $nonce,
            'verifier' => $verifier,
            'expires' => now()->addMinutes(10)->timestamp,
        ]);
        $next = $request->query('next');
        if (is_string($next)) {
            $parts = explode('?', $next, 2);
            $path = PageUrls::canonicalPath($parts[0]);
            if ($path) {
                $next = $path.(isset($parts[1]) ? '?'.$parts[1] : '');
            }
        }
        if (is_string($next) && strlen($next) <= 1000 && preg_match('/\A\/(?:criar-presente|minha-conta|pagamento|resultado)(?:\?[^\s#\\\\]*)?\z/', $next)) {
            $request->session()->put('google_login_next', $next);
        } else {
            $request->session()->put('google_login_next', '/minha-conta');
        }
        $challenge = rtrim(strtr(base64_encode(hash('sha256', $verifier, true)), '+/', '-_'), '=');

        return redirect()->away($provider->authorizationUrl($state, $nonce, $challenge));
    }

    public function callback(Request $request, IdentityProvider $provider)
    {
        $flow = $request->session()->pull('google_oidc');
        if (! is_array($flow) || ! is_string($flow['state'] ?? null) || ! is_string($flow['nonce'] ?? null)
            || ! is_string($flow['verifier'] ?? null) || ($flow['expires'] ?? 0) < now()->timestamp
            || ! is_string($request->query('state')) || ! hash_equals($flow['state'], $request->query('state'))
            || ! is_string($request->query('code'))) {
            Log::notice('Google sign-in callback rejected.', ['route' => 'auth/google/callback']);

            return redirect('/entrar?google=failed');
        }

        try {
            $identity = $provider->identityFromCode($request->query('code'), $flow['verifier'], $flow['nonce']);
            $user = DB::transaction(function () use ($identity) {
                $user = User::where('google_sub', $identity['sub'])->lockForUpdate()->first();
                if (! $user) {
                    $user = User::where('email', $identity['email'])->lockForUpdate()->first();
                }
                if ($user?->deletion_requested_at || $user?->google_signin_disabled_at) {
                    throw new \RuntimeException('Google sign-in is unavailable for this account.');
                }
                if ($user && $user->google_sub && ! hash_equals($user->google_sub, $identity['sub'])) {
                    throw new \RuntimeException('Google identity is already linked.');
                }
                if ($user && ! $user->google_sub && ($identity['email_authoritative'] ?? false) !== true) {
                    throw new \RuntimeException('Existing accounts require an authoritative Google email.');
                }
                if (! $user) {
                    $user = User::create([
                        'name' => $identity['name'] !== '' ? $identity['name'] : 'Usuário Google',
                        'email' => $identity['email'],
                        'password' => Str::random(64),
                    ]);
                }
                $user->forceFill([
                    'google_sub' => $identity['sub'],
                    'google_avatar_url' => $identity['picture'],
                    'email_verified_at' => $user->email_verified_at ?? now(),
                ])->save();

                return $user;
            });
        } catch (Throwable) {
            Log::notice('Google sign-in attempt rejected.', ['route' => 'auth/google/callback']);

            return redirect('/entrar?google=failed');
        }

        Auth::login($user);
        $request->session()->regenerate();
        $request->session()->put('google_session_version', (int) $user->google_session_version);

        return redirect()->to($request->session()->pull('google_login_next', '/minha-conta'));
    }
}
