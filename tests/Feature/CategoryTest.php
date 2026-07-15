<?php

use App\Models\Budget;
use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('guests are redirected to login', function () {
    $this->get(route('categories.index'))->assertRedirect(route('login'));
});

test('authenticated users can view category list with budget status', function () {
    $user = User::factory()->create();

    // Create an expense category with a budget limit
    $category = Category::factory()->create([
        'user_id' => $user->id,
        'name' => 'Belanja Bulanan',
        'type' => 'expense',
    ]);

    $budget = Budget::create([
        'user_id' => $user->id,
        'category_id' => $category->id,
        'name' => $category->name,
        'amount_limit' => 1000000,
        'period' => 'monthly',
    ]);

    // Create a transaction of this category
    Transaction::factory()->create([
        'user_id' => $user->id,
        'category_id' => $category->id,
        'type' => 'expense',
        'amount' => 400000,
        'date' => now()->format('Y-m-d'),
    ]);

    $this->actingAs($user)
        ->get(route('categories.index'))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Categories/Index')
            ->has('categories', 1)
            ->where('categories.0.name', 'Belanja Bulanan')
            ->where('categories.0.total_spent', 400000)
            ->where('categories.0.progress', 40)
            ->where('stats.total_budgeted', 1000000)
            ->where('stats.total_spent', 400000)
            ->where('stats.total_budget_remaining', 600000)
            ->where('stats.exceeded_budgets', 0)
        );
});

test('users can create category without a budget', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('categories.store'), [
            'name' => 'Kopi Sore',
            'type' => 'expense',
            'icon' => 'Coffee',
            'color' => '#8b5cf6',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('categories', [
        'user_id' => $user->id,
        'name' => 'Kopi Sore',
        'type' => 'expense',
    ]);

    // Verify no budget is created
    $category = Category::where('name', 'Kopi Sore')->first();
    $this->assertDatabaseMissing('budgets', [
        'category_id' => $category->id,
    ]);
});

test('users can create category with a budget', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('categories.store'), [
            'name' => 'Bensin Bulanan',
            'type' => 'expense',
            'icon' => 'Car',
            'color' => '#f97316',
            'amount_limit' => 500000,
            'period' => 'monthly',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('categories', [
        'user_id' => $user->id,
        'name' => 'Bensin Bulanan',
    ]);

    $category = Category::where('name', 'Bensin Bulanan')->first();
    $this->assertDatabaseHas('budgets', [
        'category_id' => $category->id,
        'amount_limit' => 500000,
        'period' => 'monthly',
    ]);
});

test('users can update category details and create associated budget', function () {
    $user = User::factory()->create();
    $category = Category::factory()->create([
        'user_id' => $user->id,
        'name' => 'Lama',
        'type' => 'expense',
    ]);

    $this->actingAs($user)
        ->put(route('categories.update', $category->id), [
            'name' => 'Baru',
            'type' => 'expense',
            'icon' => 'Folder',
            'color' => '#3b82f6',
            'amount_limit' => 200000,
            'period' => 'weekly',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('categories', [
        'id' => $category->id,
        'name' => 'Baru',
    ]);

    $this->assertDatabaseHas('budgets', [
        'category_id' => $category->id,
        'amount_limit' => 200000,
        'period' => 'weekly',
    ]);
});

test('users can update category details and delete associated budget by clearing limit', function () {
    $user = User::factory()->create();
    $category = Category::factory()->create([
        'user_id' => $user->id,
        'name' => 'Transportasi',
        'type' => 'expense',
    ]);

    $budget = Budget::create([
        'user_id' => $user->id,
        'category_id' => $category->id,
        'name' => $category->name,
        'amount_limit' => 300000,
        'period' => 'monthly',
    ]);

    $this->actingAs($user)
        ->put(route('categories.update', $category->id), [
            'name' => 'Transportasi',
            'type' => 'expense',
            'icon' => 'Folder',
            'color' => '#3b82f6',
            'amount_limit' => '',
            'period' => 'monthly',
        ])
        ->assertRedirect();

    $this->assertDatabaseMissing('budgets', [
        'id' => $budget->id,
    ]);
});

test('deleting a category deletes its associated budget', function () {
    $user = User::factory()->create();
    $category = Category::factory()->create([
        'user_id' => $user->id,
        'name' => 'Delete Me',
        'type' => 'expense',
    ]);

    $budget = Budget::create([
        'user_id' => $user->id,
        'category_id' => $category->id,
        'name' => $category->name,
        'amount_limit' => 300000,
        'period' => 'monthly',
    ]);

    $this->actingAs($user)
        ->delete(route('categories.destroy', $category->id))
        ->assertRedirect();

    $this->assertSoftDeleted($category);
    $this->assertDatabaseMissing('budgets', [
        'id' => $budget->id,
    ]);
});
