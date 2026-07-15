<?php

use App\Models\Debt;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('guests are redirected to login', function () {
    $this->get(route('debts.index'))->assertRedirect(route('login'));
});

test('authenticated users can view debt dashboard list', function () {
    $user = User::factory()->create();

    // Create an active payable
    Debt::create([
        'user_id' => $user->id,
        'type' => 'payable',
        'counterparty_name' => 'Bank ABC',
        'amount' => 1000000,
        'remaining_amount' => 800000,
        'due_date' => now()->addMonth()->format('Y-m-d'),
        'status' => 'active',
    ]);

    // Create an active receivable
    Debt::create([
        'user_id' => $user->id,
        'type' => 'receivable',
        'counterparty_name' => 'Teman Baik',
        'amount' => 500000,
        'remaining_amount' => 500000,
        'due_date' => now()->subDay()->format('Y-m-d'), // overdue
        'status' => 'active',
    ]);

    $this->actingAs($user)
        ->get(route('debts.index'))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Debts/Index')
            ->has('debts', 2)
            ->where('stats.total_payable', 800000)
            ->where('stats.total_receivable', 500000)
            ->where('stats.total_paid_off', 200000)
            ->where('stats.overdue_debts', 1)
        );
});

test('users can create payable debt without linking a wallet', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('debts.store'), [
            'type' => 'payable',
            'counterparty_name' => 'Paman Sam',
            'amount' => 2000000,
            'due_date' => now()->addDays(15)->format('Y-m-d'),
            'notes' => 'Pinjaman kekeluargaan',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('debts', [
        'user_id' => $user->id,
        'type' => 'payable',
        'counterparty_name' => 'Paman Sam',
        'amount' => 2000000,
        'remaining_amount' => 2000000,
    ]);

    // No transaction created
    $this->assertEquals(0, Transaction::count());
});

test('users can create receivable debt and link to wallet', function () {
    $user = User::factory()->create();
    $wallet = Wallet::factory()->create([
        'user_id' => $user->id,
        'current_balance' => 1500000,
    ]);

    $this->actingAs($user)
        ->post(route('debts.store'), [
            'type' => 'receivable',
            'counterparty_name' => 'Budi Santoso',
            'amount' => 500000,
            'due_date' => now()->addDays(5)->format('Y-m-d'),
            'notes' => 'Pinjaman budi',
            'wallet_id' => $wallet->id,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('debts', [
        'user_id' => $user->id,
        'type' => 'receivable',
        'counterparty_name' => 'Budi Santoso',
    ]);

    $debt = Debt::where('counterparty_name', 'Budi Santoso')->first();

    // Linked expense transaction created
    $this->assertDatabaseHas('transactions', [
        'user_id' => $user->id,
        'wallet_id' => $wallet->id,
        'debt_id' => $debt->id,
        'type' => 'expense',
        'amount' => 500000,
    ]);

    // Wallet balance adjusted (lending money decreases wallet balance)
    $this->assertEquals(1000000, $wallet->fresh()->current_balance);
});

test('users can record an installment payment towards a debt', function () {
    $user = User::factory()->create();
    $wallet = Wallet::factory()->create([
        'user_id' => $user->id,
        'current_balance' => 1000000,
    ]);

    $debt = Debt::create([
        'user_id' => $user->id,
        'type' => 'payable',
        'counterparty_name' => 'Bank ABC',
        'amount' => 1000000,
        'remaining_amount' => 800000,
        'status' => 'active',
    ]);

    $this->actingAs($user)
        ->post(route('debts.payment', $debt->id), [
            'amount' => 300000,
            'wallet_id' => $wallet->id,
            'date' => now()->format('Y-m-d'),
            'notes' => 'Cicilan pertama',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('debts', [
        'id' => $debt->id,
        'remaining_amount' => 500000,
        'status' => 'active',
    ]);

    // Wallet balance decreased (paying payable decreases wallet balance)
    $this->assertEquals(700000, $wallet->fresh()->current_balance);

    // repays transaction created
    $this->assertDatabaseHas('transactions', [
        'wallet_id' => $wallet->id,
        'debt_id' => $debt->id,
        'type' => 'expense',
        'amount' => 300000,
    ]);
});

test('debt is marked as paid off when remaining reaches zero', function () {
    $user = User::factory()->create();
    $wallet = Wallet::factory()->create([
        'user_id' => $user->id,
        'current_balance' => 1000000,
    ]);

    $debt = Debt::create([
        'user_id' => $user->id,
        'type' => 'payable',
        'counterparty_name' => 'Bank ABC',
        'amount' => 500000,
        'remaining_amount' => 200000,
        'status' => 'active',
    ]);

    $this->actingAs($user)
        ->post(route('debts.payment', $debt->id), [
            'amount' => 200000,
            'wallet_id' => $wallet->id,
            'date' => now()->format('Y-m-d'),
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect();

    $this->assertDatabaseHas('debts', [
        'id' => $debt->id,
        'remaining_amount' => 0,
        'status' => 'paid_off',
    ]);
});

test('deleting a debt rolls back wallet transactions', function () {
    $user = User::factory()->create();
    $wallet = Wallet::factory()->create([
        'user_id' => $user->id,
        'current_balance' => 800000, // Starts at 800k
    ]);

    // Create debt
    $debt = Debt::create([
        'user_id' => $user->id,
        'type' => 'payable',
        'counterparty_name' => 'Bank ABC',
        'amount' => 500000,
        'remaining_amount' => 500000,
        'status' => 'active',
    ]);

    // Create transaction representing initial borrow (receives 500k)
    $t1 = Transaction::create([
        'user_id' => $user->id,
        'wallet_id' => $wallet->id,
        'debt_id' => $debt->id,
        'type' => 'income',
        'amount' => 500000,
        'date' => now()->format('Y-m-d'),
    ]);

    // Create transaction representing repayment (pays 200k)
    $t2 = Transaction::create([
        'user_id' => $user->id,
        'wallet_id' => $wallet->id,
        'debt_id' => $debt->id,
        'type' => 'expense',
        'amount' => 200000,
        'date' => now()->format('Y-m-d'),
    ]);

    // Wallet balance is modified. On deletion:
    // Reversing income t1 (subtracts 500k)
    // Reversing expense t2 (adds 200k)
    // Net wallet change: -300k. Expected wallet balance: 800k - 300k = 500k.

    $this->actingAs($user)
        ->delete(route('debts.destroy', $debt->id))
        ->assertRedirect();

    $this->assertSoftDeleted($debt);
    $this->assertSoftDeleted($t1);
    $this->assertSoftDeleted($t2);
    $this->assertEquals(500000, $wallet->fresh()->current_balance);
});
