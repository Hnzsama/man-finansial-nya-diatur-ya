<?php

use App\Models\User;
use App\Models\Wallet;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('guests are redirected from transfer posts', function () {
    $this->post(route('transfers.store'), [])->assertRedirect(route('login'));
});

test('users can transfer balance between two wallets', function () {
    $user = User::factory()->create();
    $walletFrom = Wallet::factory()->create(['user_id' => $user->id, 'current_balance' => 500000]);
    $walletTo = Wallet::factory()->create(['user_id' => $user->id, 'current_balance' => 200000]);

    $this->actingAs($user)
        ->post(route('transfers.store'), [
            'from_wallet_id' => $walletFrom->id,
            'to_wallet_id' => $walletTo->id,
            'amount' => 150000,
            'date' => '2026-07-16',
            'notes' => 'Salary portion move',
        ])
        ->assertRedirect();

    // Verify balance changes
    $this->assertEquals(350000, $walletFrom->fresh()->current_balance);
    $this->assertEquals(350000, $walletTo->fresh()->current_balance);

    // Verify double-entry transactions are logged
    $this->assertDatabaseHas('transactions', [
        'user_id' => $user->id,
        'wallet_id' => $walletFrom->id,
        'type' => 'expense',
        'amount' => 150000,
        'notes' => 'Transfer to '.$walletTo->name.' (Salary portion move)',
    ]);

    $this->assertDatabaseHas('transactions', [
        'user_id' => $user->id,
        'wallet_id' => $walletTo->id,
        'type' => 'income',
        'amount' => 150000,
        'notes' => 'Transfer from '.$walletFrom->name.' (Salary portion move)',
    ]);

    // Verify Transfer audit entry exists
    $this->assertDatabaseHas('transfers', [
        'user_id' => $user->id,
        'from_wallet_id' => $walletFrom->id,
        'to_wallet_id' => $walletTo->id,
        'amount' => 150000,
        'notes' => 'Salary portion move',
    ]);
});

test('users cannot transfer to same wallet', function () {
    $user = User::factory()->create();
    $wallet = Wallet::factory()->create(['user_id' => $user->id]);

    $this->actingAs($user)
        ->post(route('transfers.store'), [
            'from_wallet_id' => $wallet->id,
            'to_wallet_id' => $wallet->id,
            'amount' => 10000,
            'date' => '2026-07-16',
        ])
        ->assertSessionHasErrors(['to_wallet_id']);
});
