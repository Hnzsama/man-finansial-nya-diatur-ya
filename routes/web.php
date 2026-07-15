<?php

use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\AssetController;
use App\Http\Controllers\CalendarController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DebtController;
use App\Http\Controllers\ExportImportController;
use App\Http\Controllers\GoalController;
use App\Http\Controllers\ReceiptController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\TransferController;
use App\Http\Controllers\WalletController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::resource('wallets', WalletController::class);
    Route::resource('categories', CategoryController::class)->except(['show']);
    Route::resource('transactions', TransactionController::class);
    Route::resource('transfers', TransferController::class)->only(['store']);
    Route::redirect('budgets', 'categories');
    Route::resource('goals', GoalController::class);
    Route::resource('assets', AssetController::class);
    Route::resource('debts', DebtController::class);
    Route::post('debts/{debt}/payment', [DebtController::class, 'recordPayment'])->name('debts.payment');

    Route::resource('subscriptions', SubscriptionController::class)->except(['show']);
    Route::post('subscriptions/{subscription}/process', [SubscriptionController::class, 'processPayment'])->name('subscriptions.process');
    Route::get('calendar', [CalendarController::class, 'index'])->name('calendar.index');
    Route::get('exports-imports', [ExportImportController::class, 'index'])->name('exports.index');
    Route::post('exports-imports/import', [ExportImportController::class, 'store'])->name('exports.store');
    Route::get('activity-logs', [ActivityLogController::class, 'index'])->name('activity-logs.index');
    Route::get('receipts', [ReceiptController::class, 'index'])->name('receipts.index');
    Route::get('reports', [ReportController::class, 'index'])->name('reports.index');
});

require __DIR__.'/settings.php';
