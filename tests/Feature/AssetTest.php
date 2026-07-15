<?php

use App\Models\Asset;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('guests are redirected from assets index', function () {
    $this->get(route('assets.index'))->assertRedirect(route('login'));
});

test('users can see their assets list and statistics', function () {
    $user = User::factory()->create();
    Asset::factory()->create([
        'user_id' => $user->id,
        'type' => 'stock',
        'current_value' => 50000000,
    ]);
    Asset::factory()->create([
        'user_id' => $user->id,
        'type' => 'gold',
        'current_value' => 15000000,
    ]);

    // Another user's asset
    $otherUser = User::factory()->create();
    Asset::factory()->create([
        'user_id' => $otherUser->id,
        'type' => 'savings',
        'current_value' => 1000000,
    ]);

    $response = $this->actingAs($user)
        ->get(route('assets.index'))
        ->assertOk();

    $response->assertInertia(fn ($page) => $page
        ->component('Assets/Index')
        ->has('assets', 2)
        ->where('stats.total_value', 65000000)
        ->where('stats.counts.stock', 1)
        ->where('stats.counts.gold', 1)
        ->where('stats.counts.savings', 0)
    );
});

test('users can create a new asset', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('assets.store'), [
            'name' => 'Bitcoin Bag',
            'type' => 'crypto',
            'current_value' => 12500000,
            'notes' => 'Cold wallet storage',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('assets', [
        'user_id' => $user->id,
        'name' => 'Bitcoin Bag',
        'type' => 'crypto',
        'current_value' => 12500000.00,
        'notes' => 'Cold wallet storage',
    ]);
});

test('users can update an existing asset', function () {
    $user = User::factory()->create();
    $asset = Asset::factory()->create([
        'user_id' => $user->id,
        'name' => 'Gold bar',
        'type' => 'gold',
        'current_value' => 10000000,
    ]);

    $this->actingAs($user)
        ->put(route('assets.update', $asset->id), [
            'name' => 'Gold bar (10g)',
            'type' => 'gold',
            'current_value' => 11000000,
            'notes' => 'Price updated',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('assets', [
        'id' => $asset->id,
        'name' => 'Gold bar (10g)',
        'current_value' => 11000000.00,
        'notes' => 'Price updated',
    ]);
});

test('users cannot update another users asset', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $asset = Asset::factory()->create([
        'user_id' => $otherUser->id,
        'name' => 'Gold bar',
    ]);

    $this->actingAs($user)
        ->put(route('assets.update', $asset->id), [
            'name' => 'Attempt',
            'type' => 'gold',
            'current_value' => 5000,
        ])
        ->assertForbidden();
});

test('users can delete their asset', function () {
    $user = User::factory()->create();
    $asset = Asset::factory()->create([
        'user_id' => $user->id,
        'name' => 'Bonds',
    ]);

    $this->actingAs($user)
        ->delete(route('assets.destroy', $asset->id))
        ->assertRedirect();

    $this->assertSoftDeleted('assets', [
        'id' => $asset->id,
    ]);
});
