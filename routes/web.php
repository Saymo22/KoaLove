<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AdminWorkspaceController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CloudUploadController;
use App\Http\Controllers\GoogleAuthController;
use App\Http\Controllers\GoogleSecurityEventController;
use App\Http\Controllers\MediaController;
use App\Http\Controllers\MediaSelectionController;
use App\Http\Controllers\PaymentWebhookController;
use App\Http\Controllers\PricingController;
use App\Http\Controllers\PrivacyController;
use App\Http\Controllers\PurchaseController;
use App\Http\Controllers\SupportController;
use App\Http\Middleware\AdminRuntime;
use App\Services\AdminConfiguration;
use App\Services\MediaStorage;
use App\Services\PaymentSettings;
use App\Services\Pricing;
use App\Services\Seo;
use App\Support\PlanLimits;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Route;

Route::post('/api/webhooks/mercadopago', PaymentWebhookController::class)->middleware('throttle:api');
Route::post('/api/webhooks/google/security-events', GoogleSecurityEventController::class)->middleware('throttle:api');
Route::get('/auth/google/redirect', [GoogleAuthController::class, 'redirect'])->middleware('throttle:google-login');
Route::get('/auth/google/callback', [GoogleAuthController::class, 'callback'])->middleware('throttle:google-login');
Route::get('/robots.txt', fn (Seo $seo) => response($seo->robots(), 200, ['Content-Type' => 'text/plain; charset=UTF-8']))->middleware('throttle:pages');
Route::get('/sitemap.xml', fn (Seo $seo) => response()->view('sitemap', ['urls' => config('seo.indexing_enabled') ? array_map(fn ($path) => $seo->baseUrl().$path, array_keys($seo->publicPages())) : []], 200, ['Content-Type' => 'application/xml; charset=UTF-8']))->middleware('throttle:pages');
foreach (json_decode(file_get_contents(resource_path('assets.json')), true) as $key => $page) {
    $name = $key === 'home' ? 'pages.home' : 'pages.'.str_replace('/', '.', $key);
    Route::view($page['url'], $page['view'])->name($name)->middleware('throttle:pages');
    foreach ($page['legacy_urls'] ?? [] as $legacy) {
        Route::get($legacy, function (Request $request) use ($page) {
            $query = $request->server('QUERY_STRING');
            $target = $page['url'].(is_string($query) && $query !== '' ? '?'.$query : '');

            // Relative Location preserves preview/alias origins and browser fragments.
            // Do not cache links containing share tokens or payment identifiers.
            return response('', 301, ['Location' => $target, 'Cache-Control' => 'private, no-store']);
        })->middleware('throttle:pages');
    }
}
Route::get('/reset-password/{token}', fn () => redirect('/recuperar-senha'))->name('password.reset');
Route::prefix('api')->middleware(['throttle:api', AdminRuntime::class])->group(function () {
    Route::get('config', fn (MediaStorage $storage, Pricing $pricing) => response()->json(['ok' => true, 'data' => [...$pricing->catalog(), 'site' => array_intersect_key(app(AdminConfiguration::class)->all(), array_flip(['storeName', 'supportEmail', 'whatsapp'])), 'themes' => app(AdminConfiguration::class)->themes(), 'theme_metadata' => config('gift.themes'), 'currency' => 'BRL', 'coupons' => (object) [], 'plan_limits' => PlanLimits::caps(), 'media_upload' => $storage->status()['mode'], 'media_storage' => $storage->status(), 'payments' => app(PaymentSettings::class)->status(), 'google_login' => filled(config('services.google.client_id')) && filled(config('services.google.client_secret')), 'simulation' => config('gift.simulated_payments') && ! app()->isProduction()]]));
    Route::get('internal/prune', function (Request $request) {
        $secret = config('gift.cron_secret');
        abort_unless(is_string($secret) && strlen($secret) >= 32 && hash_equals($secret, (string) $request->bearerToken()), 404);
        abort_unless(Artisan::call('privacy:prune') === 0, 503);
        abort_unless(Artisan::call('admin:alerts') === 0, 503);

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
            Route::post('purchases/{purchase}/media/selection', [MediaSelectionController::class, 'store']);
            Route::post('purchases/{purchase}/media/{asset}', [MediaController::class, 'upload']);
            Route::post('purchases/{purchase}/media/{asset}/upload-url', [CloudUploadController::class, 'reserve']);
            Route::post('purchases/{purchase}/media/{asset}/complete-upload', [CloudUploadController::class, 'complete']);
            Route::get('privacy/export', [PrivacyController::class, 'export']);
            Route::post('privacy/delete', [PrivacyController::class, 'destroy'])->middleware('throttle:sensitive');
        });
        Route::prefix('admin')->middleware(['admin', 'throttle:admin'])->group(function () {
            Route::get('workspace', [AdminWorkspaceController::class, 'workspace']);
            Route::post('settings', [AdminWorkspaceController::class, 'settings']);
            Route::post('clients/{user}/{operation}', [AdminWorkspaceController::class, 'client'])->where('operation', 'note|delete');
            Route::post('tickets/{ticket}/manage', [AdminWorkspaceController::class, 'ticket']);
            Route::post('themes/{theme}', [AdminWorkspaceController::class, 'theme']);
            Route::post('purchases/{purchase}/reject-pix', [AdminWorkspaceController::class, 'rejectPix']);
            Route::post('catalog/{kind}/{id}/delete', [AdminWorkspaceController::class, 'removeOffer'])->where('kind', 'plans|promotions|coupons')->whereUuid('id');
            Route::post('activities/clear', [AdminWorkspaceController::class, 'clearActivities']);
            Route::post('administrators/invitations/{invitation}/revoke', [AdminWorkspaceController::class, 'revokeInvitation']);
            Route::post('administrators/invite', [AdminWorkspaceController::class, 'invite']);
            Route::post('administrators/{user}/remove', [AdminWorkspaceController::class, 'removeAdmin']);
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

Route::get('/admin/invitations/{invitation}', [AdminWorkspaceController::class, 'acceptInvitation'])->name('admin.invitation')->middleware('throttle:pages');

Route::post('/admin/invitations/{invitation}/accept', [AdminWorkspaceController::class, 'accept'])->middleware(['api.auth', 'throttle:admin']);
