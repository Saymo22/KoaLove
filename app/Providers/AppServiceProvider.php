<?php

namespace App\Providers;

use App\Adapters\SimulatedPaymentGateway;
use App\Contracts\PaymentGateway;
use App\Models\Purchase;
use App\Policies\PurchasePolicy;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(PaymentGateway::class, SimulatedPaymentGateway::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::policy(Purchase::class, PurchasePolicy::class);
        foreach (['pages' => 1200, 'login' => 5, 'register' => 3, 'recovery' => 3, 'api' => 240, 'write' => 90, 'create' => 10, 'admin' => 120] as $name => $limit) {
            RateLimiter::for($name, fn ($request) => Limit::perMinute($limit)->by($name.':'.$request->ip()));
        }
        ResetPassword::createUrlUsing(fn ($user, $token) => url('/recuperar-senha.html').'#token='.rawurlencode($token).'&email='.rawurlencode($user->email));
    }
}
