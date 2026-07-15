<?php

use App\Models\TransactionHistory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('guests are redirected from document pages', function () {
    $this->get(route('exports.index'))->assertRedirect(route('login'));
    $this->get(route('activity-logs.index'))->assertRedirect(route('login'));
    $this->get(route('receipts.index'))->assertRedirect(route('login'));
    $this->get(route('reports.index'))->assertRedirect(route('login'));
});

test('users can access reports page statistics dashboard', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('reports.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('Reports/Index'));
});

test('users can access export and import page', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('exports.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('ExportsImports/Index'));
});

test('users can access activity logs page and see modification log history', function () {
    $user = User::factory()->create();
    TransactionHistory::factory()->create([
        'user_id' => $user->id,
        'field_changed' => 'amount',
        'old_value' => '10000',
        'new_value' => '15000',
    ]);

    $this->actingAs($user)
        ->get(route('activity-logs.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('ActivityLogs/Index')
            ->has('logs.data', 1)
        );
});

test('users can access receipts vault gallery page', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('receipts.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('Receipts/Index'));
});
