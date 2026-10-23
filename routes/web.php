<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\MediaController;
use App\Http\Controllers\PrivacyController;
use App\Http\Controllers\PurchaseController;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/home.html');
foreach (json_decode(file_get_contents(resource_path('assets.json')), true) as $page) {
    Route::view($page['url'], $page['view'])->middleware('throttle:pages');
}
Route::get('/reset-password/{token}', fn () => redirect('/recuperar-senha.html'))->name('password.reset');
Route::prefix('api')->middleware('throttle:api')->group(function () {
    Route::get('config', fn () => response()->json(['ok' => true, 'data' => ['themes' => config('gift.themes'), 'price_cents' => config('gift.price_cents'), 'currency' => 'BRL', 'coupons' => config('gift.coupons'), 'simulation' => config('gift.simulated_payments') && ! app()->isProduction()]]));
    Route::post('auth/register', [AuthController::class, 'register'])->middleware('throttle:register');
    Route::post('auth/login', [AuthController::class, 'login'])->middleware('throttle:login');
    Route::post('auth/forgot-password', [AuthController::class, 'forgot'])->middleware('throttle:recovery');
    Route::post('auth/reset-password', [AuthController::class, 'reset'])->middleware('throttle:recovery');
    Route::get('shared/{token}', [PurchaseController::class, 'shared'])->where('token', '[a-f0-9]{64}');
    Route::get('shared/{token}/media/{asset}', [MediaController::class, 'shared'])->where('token', '[a-f0-9]{64}');
    Route::middleware('api.auth')->group(function () {
        Route::get('auth/me', [AuthController::class, 'me']);
        Route::post('auth/logout', [AuthController::class, 'logout']);
        Route::get('purchases', [PurchaseController::class, 'index']);
        Route::get('purchases/{purchase}', [PurchaseController::class, 'show'])->withTrashed();
        Route::get('purchases/{purchase}/media/{asset}', [MediaController::class, 'own']);
        Route::post('purchases', [PurchaseController::class, 'store'])->middleware('throttle:create');
        Route::middleware('throttle:write')->group(function () {
            Route::post('purchases/{purchase}/update', [PurchaseController::class, 'update']);
            Route::post('purchases/{purchase}/migrate', [PurchaseController::class, 'update'])->name('purchases.migrate');
            Route::post('purchases/{purchase}/delete', [PurchaseController::class, 'destroy']);
            Route::post('purchases/{purchase}/pay', [PurchaseController::class, 'pay']);
            Route::post('purchases/{purchase}/media/{asset}', [MediaController::class, 'upload']);
            Route::get('privacy/export', [PrivacyController::class, 'export']);
            Route::post('privacy/delete', [PrivacyController::class, 'destroy']);
        });
        Route::prefix('admin')->middleware(['admin', 'throttle:admin'])->group(function () {
            Route::get('summary', [AdminController::class, 'summary']);
            Route::get('clients', [AdminController::class, 'clients']);
            Route::get('clients/{user}', [AdminController::class, 'detail']);
            Route::get('purchases', [AdminController::class, 'purchases']);
            Route::get('refunds', [AdminController::class, 'refunds']);
            Route::post('refunds/{refund}/decision', [AdminController::class, 'decision']);
            Route::get('tickets', [AdminController::class, 'tickets']);
            Route::post('tickets/{ticket}/reply', [AdminController::class, 'reply']);
        });
    });
});
