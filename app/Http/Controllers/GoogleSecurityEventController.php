<?php

namespace App\Http\Controllers;

use App\Adapters\GoogleOidcIdentityProvider;
use App\Exceptions\GoogleKeyDiscoveryUnavailable;
use App\Models\User;
use App\Services\AdminConfiguration;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use RuntimeException;
use Throwable;

class GoogleSecurityEventController extends Controller
{
    private const SESSIONS_REVOKED = 'https://schemas.openid.net/secevent/risc/event-type/sessions-revoked';

    private const TOKENS_REVOKED = 'https://schemas.openid.net/secevent/oauth/event-type/tokens-revoked';

    private const ACCOUNT_DISABLED = 'https://schemas.openid.net/secevent/risc/event-type/account-disabled';

    private const ACCOUNT_ENABLED = 'https://schemas.openid.net/secevent/risc/event-type/account-enabled';

    private const CREDENTIAL_CHANGE = 'https://schemas.openid.net/secevent/risc/event-type/account-credential-change-required';

    public function __invoke(Request $request, GoogleOidcIdentityProvider $provider)
    {
        $token = trim($request->getContent());
        if (strlen($token) > 12000) {
            return response()->json(['ok' => false], 413);
        }
        try {
            $claims = $provider->verifiedClaims($token);
            $audiences = array_filter(explode(',', (string) config('services.google.client_ids')));
            $aud = $claims['aud'] ?? null;
            $audiencesMatch = is_string($aud) ? in_array($aud, $audiences, true)
                : (is_array($aud) && count(array_intersect($audiences, $aud)) > 0);
            if (($claims['iss'] ?? null) !== 'https://accounts.google.com/' || ! $audiencesMatch
                || ! is_string($claims['jti'] ?? null) || strlen($claims['jti']) > 255
                || ! is_array($claims['events'] ?? null)) {
                throw new RuntimeException('Invalid Google security event claims.');
            }
        } catch (GoogleKeyDiscoveryUnavailable) {
            Log::warning('Google signing key discovery temporarily unavailable.', ['route' => 'api/webhooks/google/security-events']);

            return response()->json(['ok' => false], 503);
        } catch (Throwable) {
            Log::warning('Google security event rejected.', ['route' => 'api/webhooks/google/security-events']);

            return response()->json(['ok' => false], 400);
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
                    if (in_array($eventType, [self::SESSIONS_REVOKED, self::TOKENS_REVOKED], true)) {
                        DB::table('sessions')->where('user_id', $user->id)->delete();
                        $this->alertOperator($eventType);
                    } elseif ($eventType === self::ACCOUNT_DISABLED) {
                        DB::table('sessions')->where('user_id', $user->id)->delete();
                        $user->forceFill(['google_signin_disabled_at' => now()])->save();
                        $this->alertOperator($eventType);
                    } elseif ($eventType === self::ACCOUNT_ENABLED) {
                        $user->forceFill(['google_signin_disabled_at' => null])->save();
                    } elseif ($eventType === self::CREDENTIAL_CHANGE) {
                        $this->alertOperator($eventType);
                    }
                }
            });
        } catch (Throwable) {
            Log::error('Google security event processing failed.', ['route' => 'api/webhooks/google/security-events']);

            return response()->json(['ok' => false], 503);
        }

        return response()->json(['ok' => true], 202);
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
