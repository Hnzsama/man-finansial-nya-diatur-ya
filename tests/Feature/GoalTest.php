<?php

use App\Models\Goal;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('guests are redirected to login', function () {
    $this->get(route('goals.index'))->assertRedirect(route('login'));
});

test('authenticated users can view their goals', function () {
    $user = User::factory()->create();
    $goal = Goal::factory()->create([
        'user_id' => $user->id,
        'name' => 'Dana Darurat',
        'target_amount' => 10000000,
        'current_amount' => 5000000,
    ]);

    $otherUserGoal = Goal::factory()->create([
        'user_id' => User::factory()->create()->id,
        'name' => 'Beli Mobil',
    ]);

    $this->actingAs($user)
        ->get(route('goals.index'))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Goals/Index')
            ->has('goals', 1)
            ->where('goals.0.name', 'Dana Darurat')
            ->where('goals.0.progress', 50)
        );
});

test('users can create a goal', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('goals.store'), [
            'name' => 'Beli Laptop',
            'target_amount' => 15000000,
            'current_amount' => 2000000,
            'deadline' => '2026-12-31',
            'color' => '#3b82f6',
            'icon' => 'Target',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('goals', [
        'user_id' => $user->id,
        'name' => 'Beli Laptop',
        'target_amount' => 15000000,
        'current_amount' => 2000000,
    ]);
});

test('users cannot update other users goals', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $goal = Goal::factory()->create(['user_id' => $otherUser->id]);

    $this->actingAs($user)
        ->put(route('goals.update', $goal->id), [
            'name' => 'Hack name',
            'target_amount' => 500000,
        ])
        ->assertForbidden();
});

test('users can update their own goal', function () {
    $user = User::factory()->create();
    $goal = Goal::factory()->create([
        'user_id' => $user->id,
        'name' => 'Awal',
        'target_amount' => 1000000,
    ]);

    $this->actingAs($user)
        ->put(route('goals.update', $goal->id), [
            'name' => 'Update baru',
            'target_amount' => 2000000,
            'current_amount' => 500000,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('goals', [
        'id' => $goal->id,
        'name' => 'Update baru',
        'target_amount' => 2000000,
        'current_amount' => 500000,
    ]);
});

test('users can delete their own goal', function () {
    $user = User::factory()->create();
    $goal = Goal::factory()->create(['user_id' => $user->id]);

    $this->actingAs($user)
        ->delete(route('goals.destroy', $goal->id))
        ->assertRedirect();

    $this->assertSoftDeleted($goal);
});
