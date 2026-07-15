<?php

use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('updating a transaction creates history logs and updates wallet balance', function () {
    $user = User::factory()->create();
    $wallet = Wallet::factory()->create(['user_id' => $user->id, 'current_balance' => 100000]);
    $newWallet = Wallet::factory()->create(['user_id' => $user->id, 'current_balance' => 200000]);
    $category = Category::factory()->create(['user_id' => $user->id, 'type' => 'expense']);

    $transaction = Transaction::factory()->create([
        'user_id' => $user->id,
        'wallet_id' => $wallet->id,
        'category_id' => $category->id,
        'type' => 'expense',
        'amount' => 30000,
        'date' => '2026-07-01',
        'notes' => 'Old note',
    ]);

    // Initial wallet balance adjusted by factory + transaction creation balance logic
    // Factory started with 100k, transaction store subtracted 30k -> balance is 70k
    $wallet->update(['current_balance' => 70000]);

    $this->actingAs($user)
        ->put(route('transactions.update', $transaction->id), [
            'wallet_id' => $newWallet->id,
            'category_id' => $category->id,
            'type' => 'expense',
            'amount' => 50000,
            'date' => '2026-07-02',
            'notes' => 'New note',
        ])
        ->assertRedirect();

    // Verify old wallet balance is reverted (70k + 30k = 100k)
    $this->assertEquals(100000, $wallet->fresh()->current_balance);

    // Verify new wallet balance is deducted (200k - 50k = 150k)
    $this->assertEquals(150000, $newWallet->fresh()->current_balance);

    // Verify transaction fields are updated
    $transaction = $transaction->fresh();
    $this->assertEquals($newWallet->id, $transaction->wallet_id);
    $this->assertEquals(50000, $transaction->amount);
    $this->assertEquals('New note', $transaction->notes);

    // Verify history logs are written
    $this->assertDatabaseHas('transaction_histories', [
        'transaction_id' => $transaction->id,
        'user_id' => $user->id,
        'field_changed' => 'amount',
        'old_value' => '30000.00',
        'new_value' => '50000',
    ]);

    $this->assertDatabaseHas('transaction_histories', [
        'transaction_id' => $transaction->id,
        'user_id' => $user->id,
        'field_changed' => 'notes',
        'old_value' => 'Old note',
        'new_value' => 'New note',
    ]);

    $this->assertDatabaseHas('transaction_histories', [
        'transaction_id' => $transaction->id,
        'user_id' => $user->id,
        'field_changed' => 'wallet_id',
        'old_value' => (string) $wallet->id,
        'new_value' => (string) $newWallet->id,
    ]);
});
