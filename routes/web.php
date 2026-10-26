<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CloudUploadController;
use App\Http\Controllers\MediaController;
use App\Http\Controllers\PaymentWebhookController;
use App\Http\Controllers\PricingController;
use App\Http\Controllers\PrivacyController;
use App\Http\Controllers\PurchaseController;
use App\Http\Controllers\SupportController;
use App\Services\MediaStorage;
use App\Services\PaymentSettings;
use App\Services\Pricing;
use App\Services\Seo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/home.html');
Route::post('/api/webhooks/mercadopago', PaymentWebhookController::class)->middleware('throttle:api');
Route::get('/robots.txt', fn (Seo $seo) => response($seo->robots(), 200, ['Content-Type' => 'text/plain; charset=UTF-8']))->middleware('throttle:pages');
Route::get('/sitemap.xml', fn (Seo $seo) => response()->view('sitemap', ['urls' => config('seo.indexing_enabled') ? array_map(fn ($path) => $seo->baseUrl().$path, array_keys($seo->publicPages())) : []], 200, ['Content-Type' => 'application/xml; charset=UTF-8']))->middleware('throttle:pages');
foreach (json_decode(file_get_contents(resource_path('assets.json')), true) as $page) {
    Route::view($page['url'], $page['view'])->middleware('throttle:pages');
}
Route::get('/reset-password/{token}', fn () => redirect('/recuperar-senha.html'))->name('password.reset');
Route::prefix('api')->middleware('throttle:api')->group(function () {
    Route::get('config', fn (MediaStorage $storage, Pricing $pricing) => response()->json(['ok' => true, 'data' => [...$pricing->catalog(), 'themes' => config('gift.themes'), 'currency' => 'BRL', 'coupons' => (object) [], 'media_upload' => $storage->status()['mode'], 'media_storage' => $storage->status(), 'payments' => app(PaymentSettings::class)->status(), 'simulation' => config('gift.simulated_payments') && ! app()->isProduction()]]));
    Route::get('internal/prune', function (Request $request) {
        $secret = config('gift.cron_secret');
        abort_unless(is_string($secret) && strlen($secret) >= 32 && hash_equals($secret, (string) $request->bearerToken()), 404);
        abort_unless(Artisan::call('privacy:prune') === 0, 503);

        return response()->json(['ok' => true]);
    });
    Route::post('auth/register', [AuthController::class, 'register'])->middleware('throttle:register');
    Route::post('auth/login', [AuthController::class, 'login'])->middleware('throttle:login');
    Route::post('auth/forgot-password', [AuthController::class, 'forgot'])->middleware('throttle:recovery');
    Route::post('auth/reset-password', [AuthController::class, 'reset'])->middleware('throttle:recovery');
    Route::get('shared/{token}', [PurchaseController::class, 'shared'])->where('token', '[a-f0-9]{64}');
    Route::get('shared/{token}/media/{asset}', [MediaController::class, 'shared'])->where('token', '[a-f0-9]{64}');
    Route::middleware('api.auth')->group(function () {
        Route::get('auth/me', [AuthController::class, 'me']);
        Route::get('support', [SupportController::class, 'show']);
        Route::post('support/start', [SupportController::class, 'start'])->middleware('throttle:support');
        Route::post('support/messages', [SupportController::class, 'message'])->middleware('throttle:support');
        Route::post('auth/logout', [AuthController::class, 'logout']);
        Route::get('purchases', [PurchaseController::class, 'index']);
        Route::get('purchases/{purchase}', [PurchaseController::class, 'show'])->withTrashed();
        Route::get('purchases/{purchase}/media/{asset}', [MediaController::class, 'own']);
        Route::post('purchases', [PurchaseController::class, 'store'])->middleware('throttle:create');
        Route::middleware('throttle:write')->group(function () {
            Route::post('purchases/{purchase}/quote', [PricingController::class, 'quote']);
            Route::post('purchases/{purchase}/refund', [PurchaseController::class, 'requestRefund']);
            Route::post('purchases/{purchase}/update', [PurchaseController::class, 'update']);
            Route::post('purchases/{purchase}/migrate', [PurchaseController::class, 'update'])->name('purchases.migrate');
            Route::post('purchases/{purchase}/delete', [PurchaseController::class, 'destroy']);
            Route::post('purchases/{purchase}/pay', [PurchaseController::class, 'pay']);
            Route::post('purchases/{purchase}/media/{asset}', [MediaController::class, 'upload']);
            Route::post('purchases/{purchase}/media/{asset}/upload-url', [CloudUploadController::class, 'reserve']);
            Route::post('purchases/{purchase}/media/{asset}/complete-upload', [CloudUploadController::class, 'complete']);
            Route::get('privacy/export', [PrivacyController::class, 'export']);
            Route::post('privacy/delete', [PrivacyController::class, 'destroy'])->middleware('throttle:sensitive');
        });
        Route::prefix('admin')->middleware(['admin', 'throttle:admin'])->group(function () {
            Route::get('pricing', [PricingController::class, 'index']);
            Route::post('plans', [PricingController::class, 'plan']);
            Route::post('plans/{plan}', [PricingController::class, 'plan'])->whereUuid('plan');
            Route::post('pricing/{kind}/{id?}', [PricingController::class, 'offer'])->where('kind', 'promotions|coupons')->whereUuid('id');
            Route::get('summary', [AdminController::class, 'summary']);
            Route::get('clients', [AdminController::class, 'clients']);
            Route::get('clients/{user}', [AdminController::class, 'detail']);
            Route::get('purchases', [AdminController::class, 'purchases']);
            Route::post('purchases/{purchase}/confirm-pix', [AdminController::class, 'confirmPix']);
            Route::get('refunds', [AdminController::class, 'refunds']);
            Route::post('refunds/{refund}/decision', [AdminController::class, 'decision']);
            Route::get('tickets', [AdminController::class, 'tickets']);
            Route::post('tickets/{ticket}/reply', [AdminController::class, 'reply']);
        });
    });
});
