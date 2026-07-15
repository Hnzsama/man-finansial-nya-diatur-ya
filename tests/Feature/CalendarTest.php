<?php

use App\Models\Debt;
use App\Models\Goal;
use App\Models\Subscription;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('guests are redirected from calendar index', function () {
    $this->get(route('calendar.index'))->assertRedirect(route('login'));
});

test('users can access financial calendar details and aggregated events', function () {
    $user = User::factory()->create();

    Transaction::factory()->count(2)->create([
        'user_id' => $user->id,
        'date' => '2026-07-16',
    ]);

    Goal::factory()->create([
        'user_id' => $user->id,
        'deadline' => '2026-07-20',
    ]);

    Debt::factory()->create([
        'user_id' => $user->id,
        'due_date' => '2026-07-25',
    ]);

    Subscription::factory()->create([
        'user_id' => $user->id,
        'next_billing_date' => '2026-07-28',
    ]);

    $response = $this->actingAs($user)
        ->get(route('calendar.index'))
        ->assertOk();

    $response->assertInertia(fn ($page) => $page
        ->component('Calendar/Index')
        ->has('transactions', 2)
        ->has('goals', 1)
        ->has('debts', 1)
        ->has('subscriptions', 1)
    );
});
