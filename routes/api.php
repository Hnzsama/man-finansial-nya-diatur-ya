<?php

use App\Http\Controllers\Api\AssetApiController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CalendarApiController;
use App\Http\Controllers\Api\CategoryApiController;
use App\Http\Controllers\Api\DashboardApiController;
use App\Http\Controllers\Api\DebtApiController;
use App\Http\Controllers\Api\GoalApiController;
use App\Http\Controllers\Api\SubscriptionApiController;
use App\Http\Controllers\Api\TransactionApiController;
use App\Http\Controllers\Api\WalletApiController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/login', [AuthController::class, 'login']);

// Authenticated routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Dashboard summary
    Route::get('/dashboard', DashboardApiController::class);

    // Calendar API
    Route::get('/calendar', [CalendarApiController::class, 'index']);

    // Resources (prefixed with api. for route names)
    Route::name('api.')->group(function () {
        Route::apiResource('wallets', WalletApiController::class);
        Route::apiResource('categories', CategoryApiController::class);
        Route::apiResource('transactions', TransactionApiController::class);
        Route::apiResource('goals', GoalApiController::class);
        Route::apiResource('debts', DebtApiController::class);
        Route::apiResource('assets', AssetApiController::class);
        Route::apiResource('subscriptions', SubscriptionApiController::class);
    });
});
