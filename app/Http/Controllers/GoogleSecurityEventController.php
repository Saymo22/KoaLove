<?php

namespace App\Http\Controllers;

use App\Adapters\GoogleOidcIdentityProvider;
use App\Exceptions\GoogleKeyDiscoveryUnavailable;
use App\Models\User;
use App\Services\AdminConfiguration;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use RuntimeException;
use Throwable;

class GoogleSecurityEventController extends ApiController
{
    private const SESSIONS_REVOKED = 'https://schemas.openid.net/secevent/risc/event-type/sessions-revoked';

    private const TOKENS_REVOKED = 'https://schemas.openid.net/secevent/oauth/event-type/tokens-revoked';

    private const ACCOUNT_DISABLED = 'https://schemas.openid.net/secevent/risc/event-type/account-disabled';

    private const ACCOUNT_ENABLED = 'https://schemas.openid.net/secevent/risc/event-type/account-enabled';

    private const CREDENTIAL_CHANGE = 'https://schemas.openid.net/secevent/risc/event-type/account-credential-change-required';

    public function __invoke(Request $request, GoogleOidcIdentityProvider $provider)
    {
        $stream = $request->getContent(true);
        $token = stream_get_contents($stream, 12001);
        if (is_resource($stream)) {
            fclose($stream);
        }
        abort_if(strlen($token) > 12000, 413, 'Solicitação muito grande.');
        $token = trim($token);
        try {
            $claims = $provider->verifiedClaims($token, true);
            $audiences = array_filter(array_map('trim', explode(',', (string) config('services.google.client_ids'))));
            $aud = $claims['aud'] ?? null;
            $audiencesMatch = is_string($aud) ? in_array($aud, $audiences, true)
                : (is_array($aud) && count(array_filter($aud, 'is_string')) === count($aud) && count(array_intersect($audiences, $aud)) > 0);
            $issued = $claims['iat'] ?? null;
            if (($claims['iss'] ?? null) !== 'https://accounts.google.com/' || ! $audiencesMatch
                || ! is_string($claims['jti'] ?? null) || $claims['jti'] === '' || strlen($claims['jti']) > 255
                || ! is_int($issued) || $issued > now()->timestamp + 60 || $issued <= now()->subDays(30)->timestamp
                || (isset($claims['exp']) && (! is_int($claims['exp']) || $claims['exp'] <= now()->timestamp))
                || ! is_array($claims['events'] ?? null)) {
                throw new RuntimeException('Invalid Google security event claims.');
            }
        } catch (GoogleKeyDiscoveryUnavailable) {
            Log::warning('Google signing key discovery temporarily unavailable.', ['route' => 'api/webhooks/google/security-events']);

            return $this->rejected(503);
        } catch (Throwable) {
            Log::warning('Google security event rejected.', ['route' => 'api/webhooks/google/security-events']);

            return $this->rejected(400);
        }

        try {
            DB::transaction(function () use ($claims) {
                $inserted = DB::table('google_security_events')->insertOrIgnore([
                    'event_id' => $claims['jti'],
                    'received_at' => now(),
                ]);
                if (! $inserted) {
                    return;
                }
                foreach ($claims['events'] as $eventType => $event) {
                    $subject = $event['subject'] ?? null;
                    $sub = is_array($subject) && ($subject['subject_type'] ?? null) === 'iss-sub'
                        && ($subject['iss'] ?? null) === 'https://accounts.google.com/'
                        ? ($subject['sub'] ?? null) : null;
                    if (! is_string($sub) || strlen($sub) > 255) {
                        continue;
                    }
                    $user = User::where('google_sub', $sub)->lockForUpdate()->first();
                    if (! $user) {
                        continue;
                    }
                    $eventAt = Carbon::createFromTimestamp($claims['iat']);
                    if (in_array($eventType, [self::ACCOUNT_DISABLED, self::ACCOUNT_ENABLED], true)
                        && $user->google_security_event_at && $eventAt->lte($user->google_security_event_at)) {
                        continue;
                    }
                    if (in_array($eventType, [self::SESSIONS_REVOKED, self::TOKENS_REVOKED], true)) {
                        DB::table('sessions')->where('user_id', $user->id)->delete();
                        $user->forceFill(['google_session_version' => $user->google_session_version + 1])->save();
                        $this->alertOperator($eventType);
                    } elseif ($eventType === self::ACCOUNT_DISABLED) {
                        DB::table('sessions')->where('user_id', $user->id)->delete();
                        DB::table('password_reset_tokens')->where('email', $user->email)->delete();
                        $user->forceFill(['google_signin_disabled_at' => now(), 'google_security_event_at' => $eventAt,
                            'google_session_version' => $user->google_session_version + 1, 'remember_token' => null])->save();
                        $this->alertOperator($eventType);
                    } elseif ($eventType === self::ACCOUNT_ENABLED) {
                        $user->forceFill(['google_signin_disabled_at' => null, 'google_security_event_at' => $eventAt])->save();
                    } elseif ($eventType === self::CREDENTIAL_CHANGE) {
                        $this->alertOperator($eventType);
                    }
                }
            });
        } catch (Throwable) {
            Log::error('Google security event processing failed.', ['route' => 'api/webhooks/google/security-events']);

            return $this->rejected(503);
        }

        return $this->ok(['accepted' => true], 202);
    }

    private function rejected(int $status)
    {
        return response()->json(['ok' => false, 'error' => ['code' => $status === 503 ? 'PROVIDER_UNAVAILABLE' : 'INVALID_SECURITY_EVENT',
            'message' => $status === 503 ? 'Validação temporariamente indisponível.' : 'Evento de segurança inválido.']], $status);
    }

    private function alertOperator(string $eventType): void
    {
        Log::warning('Google reported an account security event.', ['event_type' => $eventType]);
        $settings = app(AdminConfiguration::class)->all();
        $mailUnavailable = app()->isProduction() && in_array(config('mail.default'), ['log', 'array'], true);
        if (! $mailUnavailable && ($settings['emailNotif'] ?? false) && filter_var($settings['supportEmail'] ?? null, FILTER_VALIDATE_EMAIL)) {
            try {
                Mail::raw('O Google enviou um alerta de segurança para uma conta conectada ao KoaLove. O acesso Google foi bloqueado ou as sessões foram revogadas conforme o tipo do evento. Revise o incidente no procedimento interno de segurança.', function ($message) use ($settings) {
                    $message->to($settings['supportEmail'])->subject('Alerta de segurança de conta Google — KoaLove');
                });
            } catch (Throwable) {
                Log::error('Google security alert email delivery failed.');
            }
        }
    }
}
