<?php

namespace App\Providers;

use App\Adapters\MercadoPagoGateway;
use App\Adapters\SimulatedPaymentGateway;
use App\Contracts\CheckoutGateway;
use App\Contracts\PaymentGateway;
use App\Models\Purchase;
use App\Policies\PurchasePolicy;
use Aws\CommandInterface;
use Aws\Middleware;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(PaymentGateway::class, SimulatedPaymentGateway::class);
        $this->app->bind(CheckoutGateway::class, MercadoPagoGateway::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Storage::extend('supabase', function ($app, $config) {
            $disk = $app['filesystem']->createS3Driver($config);
            // Supabase uses private buckets and does not implement S3 object ACLs.
            $disk->getClient()->getHandlerList()->appendInit(Middleware::mapCommand(function (CommandInterface $command) {
                unset($command['ACL']);

                return $command;
            }), 'supabase_without_acl');

            return $disk;
        });
        if (getenv('VERCEL')) {
            URL::forceScheme('https');
            URL::forceRootUrl(config('app.url'));
        }
        // Os bundles do Vite são servidos pelo próprio deployment. URLs relativas
        // à origem mantêm a CSP `script-src 'self'` válida no domínio canônico, em
        // aliases (`*.vercel.app`) e em domínios personalizados, mesmo quando
        // APP_URL aponta para outro endereço da mesma aplicação. A aplicação é
        // publicada na raiz do domínio (public/), não em subpasta.
        Vite::createAssetPathsUsing(fn (string $path): string => '/'.ltrim($path, '/'));
        Gate::policy(Purchase::class, PurchasePolicy::class);
        foreach (['pages' => 1200, 'register' => 3, 'api' => 240, 'write' => 90, 'create' => 10, 'admin' => 120] as $name => $limit) {
            RateLimiter::for($name, fn ($request) => Limit::perMinute($limit)->by($name.':'.$request->ip()));
        }
        $accountKey = function ($request): string {
            $email = $request->input('email');

            return hash_hmac('sha256', is_string($email) ? strtolower(trim($email)) : '', config('app.key'));
        };
        RateLimiter::for('login', fn ($request) => [
            Limit::perMinute(5)->by('login-ip:'.$request->ip()),
            Limit::perMinute(5)->by('login-account:'.$accountKey($request)),
        ]);
        RateLimiter::for('recovery', fn ($request) => [
            Limit::perMinute(3)->by('recovery-ip:'.$request->ip()),
            $request->is('api/auth/forgot-password')
                ? Limit::perHour(3)->by('forgot-account:'.$accountKey($request))
                : Limit::perMinute(5)->by('reset-account:'.$accountKey($request)),
        ]);
        RateLimiter::for('sensitive', fn ($request) => [
            Limit::perMinute(5)->by('sensitive-ip:'.$request->ip()),
            Limit::perMinute(5)->by('sensitive-account:'.$request->user()->id),
        ]);
        RateLimiter::for('support', fn ($request) => [
            Limit::perMinute(10)->by('support-account:'.($request->user()?->id ?? 'guest:'.$request->ip())),
            Limit::perMinute(30)->by('support-ip:'.$request->ip()),
        ]);
        ResetPassword::createUrlUsing(fn ($user, $token) => rtrim(config('app.url'), '/').'/recuperar-senha.html#token='.rawurlencode($token).'&email='.rawurlencode($user->email));
    }
}
