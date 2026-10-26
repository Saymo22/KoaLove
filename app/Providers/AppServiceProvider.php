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
        Gate::policy(Purchase::class, PurchasePolicy::class);
        foreach (['pages' => 1200, 'login' => 5, 'register' => 3, 'recovery' => 3, 'api' => 240, 'write' => 90, 'create' => 10, 'admin' => 120] as $name => $limit) {
            RateLimiter::for($name, fn ($request) => Limit::perMinute($limit)->by($name.':'.$request->ip()));
        }
        ResetPassword::createUrlUsing(fn ($user, $token) => url('/recuperar-senha.html').'#token='.rawurlencode($token).'&email='.rawurlencode($user->email));
    }
}
