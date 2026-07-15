<?php

use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard and receive dashboard data', function () {
    $user = User::factory()->create();

    // Create wallets
    $wallet1 = Wallet::factory()->create([
        'user_id' => $user->id,
        'current_balance' => 1500000,
    ]);
    $wallet2 = Wallet::factory()->create([
        'user_id' => $user->id,
        'current_balance' => 500000,
    ]);

    // Create categories
    $categoryIncome = Category::factory()->create([
        'user_id' => $user->id,
        'type' => 'income',
    ]);
    $categoryExpense = Category::factory()->create([
        'user_id' => $user->id,
        'type' => 'expense',
    ]);

    // Create transactions for the current month
    Transaction::factory()->create([
        'user_id' => $user->id,
        'wallet_id' => $wallet1->id,
        'category_id' => $categoryIncome->id,
        'type' => 'income',
        'amount' => 2000000,
        'date' => now()->format('Y-m-d'),
    ]);

    Transaction::factory()->create([
        'user_id' => $user->id,
        'wallet_id' => $wallet1->id,
        'category_id' => $categoryExpense->id,
        'type' => 'expense',
        'amount' => 500000,
        'date' => now()->format('Y-m-d'),
    ]);

    $this->actingAs($user);

    $response = $this->get(route('dashboard'));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Dashboard/Index')
        ->has('stats')
        ->where('stats.total_balance', 2000000)
        ->where('stats.monthly_income', 2000000)
        ->where('stats.monthly_expense', 500000)
        ->where('stats.net_flow', 1500000)
        ->has('chartData')
        ->has('recentTransactions')
        ->has('wallets')
        ->has('categories')
    );
});
