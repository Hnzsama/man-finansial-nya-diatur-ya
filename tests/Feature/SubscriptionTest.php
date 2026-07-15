<?php

use App\Models\Category;
use App\Models\Subscription;
use App\Models\User;
use App\Models\Wallet;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('guests are redirected to login', function () {
    $this->get(route('subscriptions.index'))->assertRedirect(route('login'));
});

test('authenticated users can view their subscriptions and stats', function () {
    $user = User::factory()->create();
    $wallet = Wallet::factory()->create(['user_id' => $user->id, 'current_balance' => 1000000]);
    $category = Category::factory()->create(['user_id' => $user->id, 'type' => 'expense']);

    // Active monthly sub
    $sub1 = Subscription::factory()->create([
        'user_id' => $user->id,
        'wallet_id' => $wallet->id,
        'category_id' => $category->id,
        'name' => 'Netflix',
        'amount' => 100000,
        'frequency' => 'monthly',
        'next_billing_date' => Carbon::today()->addDays(5)->format('Y-m-d'),
        'is_active' => true,
    ]);

    // Active weekly sub
    $sub2 = Subscription::factory()->create([
        'user_id' => $user->id,
        'wallet_id' => $wallet->id,
        'category_id' => $category->id,
        'name' => 'Spotify',
        'amount' => 20000,
        'frequency' => 'weekly',
        'next_billing_date' => Carbon::today()->addDays(2)->format('Y-m-d'),
        'is_active' => true,
    ]);

    // Inactive sub
    $sub3 = Subscription::factory()->create([
        'user_id' => $user->id,
        'wallet_id' => $wallet->id,
        'category_id' => $category->id,
        'name' => 'AWS',
        'amount' => 500000,
        'frequency' => 'monthly',
        'next_billing_date' => Carbon::today()->addDays(10)->format('Y-m-d'),
        'is_active' => false,
    ]);

    // Other user sub
    $otherSub = Subscription::factory()->create([
        'user_id' => User::factory()->create()->id,
    ]);

    $this->actingAs($user)
        ->get(route('subscriptions.index'))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Subscriptions/Index')
            ->has('subscriptions', 3)
            ->where('stats.active_subscriptions', 2)
            ->where('stats.inactive_subscriptions', 1)
            ->where('stats.due_this_week', 2)
            // 100000 + (20000 * 4.33) = 186600
            ->where('stats.total_monthly_cost', 186600)
        );
});

test('users can create a subscription', function () {
    $user = User::factory()->create();
    $wallet = Wallet::factory()->create(['user_id' => $user->id]);
    $category = Category::factory()->create(['user_id' => $user->id]);

    $this->actingAs($user)
        ->post(route('subscriptions.store'), [
            'name' => 'Netflix Premium',
            'amount' => 186000,
            'frequency' => 'monthly',
            'next_billing_date' => Carbon::today()->addMonth()->format('Y-m-d'),
            'wallet_id' => $wallet->id,
            'category_id' => $category->id,
            'is_active' => true,
            'notes' => 'Shared with family',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('subscriptions', [
        'user_id' => $user->id,
        'name' => 'Netflix Premium',
        'amount' => 186000,
        'frequency' => 'monthly',
        'wallet_id' => $wallet->id,
    ]);
});

test('users can update their own subscription', function () {
    $user = User::factory()->create();
    $wallet = Wallet::factory()->create(['user_id' => $user->id]);
    $sub = Subscription::factory()->create([
        'user_id' => $user->id,
        'wallet_id' => $wallet->id,
        'name' => 'Old Name',
        'amount' => 100000,
    ]);

    $this->actingAs($user)
        ->patch(route('subscriptions.update', $sub->id), [
            'name' => 'New Name',
            'amount' => 120000,
            'frequency' => 'monthly',
            'next_billing_date' => Carbon::today()->addMonth()->format('Y-m-d'),
            'wallet_id' => $wallet->id,
            'is_active' => true,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('subscriptions', [
        'id' => $sub->id,
        'name' => 'New Name',
        'amount' => 120000,
    ]);
});

test('users can delete their own subscription', function () {
    $user = User::factory()->create();
    $sub = Subscription::factory()->create(['user_id' => $user->id]);

    $this->actingAs($user)
        ->delete(route('subscriptions.destroy', $sub->id))
        ->assertRedirect();

    $this->assertSoftDeleted($sub);
});

test('users can process subscription payment early manually', function () {
    $user = User::factory()->create();
    $wallet = Wallet::factory()->create(['user_id' => $user->id, 'current_balance' => 500000]);
    $sub = Subscription::factory()->create([
        'user_id' => $user->id,
        'wallet_id' => $wallet->id,
        'name' => 'Internet',
        'amount' => 300000,
        'frequency' => 'monthly',
        'next_billing_date' => Carbon::today()->format('Y-m-d'),
        'is_active' => true,
    ]);

    $this->actingAs($user)
        ->post(route('subscriptions.process', $sub->id))
        ->assertRedirect();

    // Balance should be deducted: 500000 - 300000 = 200000
    $this->assertEquals(200000, $wallet->fresh()->current_balance);

    // Transaction should be logged
    $this->assertDatabaseHas('transactions', [
        'user_id' => $user->id,
        'wallet_id' => $wallet->id,
        'type' => 'expense',
        'amount' => 300000,
        'notes' => 'Payment for subscription: Internet',
    ]);

    // Next billing date should be advanced to next month
    $this->assertEquals(
        Carbon::today()->addMonth()->format('Y-m-d'),
        $sub->fresh()->next_billing_date->format('Y-m-d')
    );
});

test('artisan console command processes due subscriptions', function () {
    $user = User::factory()->create();
    $wallet = Wallet::factory()->create(['user_id' => $user->id, 'current_balance' => 500000]);

    // Due subscription
    $dueSub = Subscription::factory()->create([
        'user_id' => $user->id,
        'wallet_id' => $wallet->id,
        'name' => 'Electricity',
        'amount' => 150000,
        'frequency' => 'monthly',
        'next_billing_date' => Carbon::yesterday()->format('Y-m-d'),
        'is_active' => true,
    ]);

    // Not due subscription
    $futureSub = Subscription::factory()->create([
        'user_id' => $user->id,
        'wallet_id' => $wallet->id,
        'name' => 'Netflix',
        'amount' => 100000,
        'frequency' => 'monthly',
        'next_billing_date' => Carbon::tomorrow()->format('Y-m-d'),
        'is_active' => true,
    ]);

    // Inactive sub
    $inactiveSub = Subscription::factory()->create([
        'user_id' => $user->id,
        'wallet_id' => $wallet->id,
        'name' => 'Gym',
        'amount' => 200000,
        'frequency' => 'monthly',
        'next_billing_date' => Carbon::yesterday()->format('Y-m-d'),
        'is_active' => false,
    ]);

    // Run the artisan command
    $this->artisan('subscriptions:process')
        ->expectsOutput('Successfully processed subscription: Electricity (amount: 150000.00)')
        ->expectsOutput('Subscription processing completed. Processed: 1, Failed: 0.')
        ->assertExitCode(0);

    // Wallet balance should be reduced only by the due sub amount (150000)
    $this->assertEquals(350000, $wallet->fresh()->current_balance);

    // Transaction should exist for dueSub
    $this->assertDatabaseHas('transactions', [
        'user_id' => $user->id,
        'wallet_id' => $wallet->id,
        'amount' => 150000,
        'notes' => 'Payment for subscription: Electricity (Automatic recurring payment)',
    ]);

    // Next billing date for dueSub should be advanced
    $this->assertEquals(
        Carbon::yesterday()->addMonth()->format('Y-m-d'),
        $dueSub->fresh()->next_billing_date->format('Y-m-d')
    );

    // Others should remain unchanged
    $this->assertEquals(Carbon::tomorrow()->format('Y-m-d'), $futureSub->fresh()->next_billing_date->format('Y-m-d'));
    $this->assertEquals(Carbon::yesterday()->format('Y-m-d'), $inactiveSub->fresh()->next_billing_date->format('Y-m-d'));
});
