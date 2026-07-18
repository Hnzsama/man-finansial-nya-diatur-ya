<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Subscription;
use App\Models\Transaction;
use App\Models\Wallet;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class SubscriptionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        try {
            $user = $request->user();

            $subscriptions = Subscription::where('user_id', $user->id)
                ->with(['wallet', 'category'])
                ->orderBy('next_billing_date', 'asc')
                ->get();

            $wallets = Wallet::where('user_id', $user->id)
                ->orderBy('name', 'asc')
                ->get();

            $categories = Category::where('user_id', $user->id)
                ->orderBy('name', 'asc')
                ->get();

            // Calculate stats
            $activeCount = 0;
            $inactiveCount = 0;
            $dueThisWeek = 0;
            $totalMonthlyCost = 0.0;

            $today = Carbon::today();
            $oneWeekLater = Carbon::today()->addDays(7);

            foreach ($subscriptions as $sub) {
                if ($sub->is_active) {
                    $activeCount++;

                    // Normalize to monthly cost
                    $amount = (float) $sub->amount;
                    switch ($sub->frequency) {
                        case 'daily':
                            $totalMonthlyCost += $amount * 30;
                            break;
                        case 'weekly':
                            $totalMonthlyCost += $amount * 4.33;
                            break;
                        case 'monthly':
                            $totalMonthlyCost += $amount;
                            break;
                        case 'yearly':
                            $totalMonthlyCost += $amount / 12;
                            break;
                    }

                    // Check if due this week
                    if ($sub->next_billing_date) {
                        $nextBilling = Carbon::parse($sub->next_billing_date);
                        if ($nextBilling->between($today, $oneWeekLater)) {
                            $dueThisWeek++;
                        }
                    }
                } else {
                    $inactiveCount++;
                }
            }

            return Inertia::render('Subscriptions/Index', [
                'subscriptions' => $subscriptions,
                'wallets' => $wallets,
                'categories' => $categories,
                'stats' => [
                    'total_monthly_cost' => round($totalMonthlyCost, 2),
                    'active_subscriptions' => $activeCount,
                    'due_this_week' => $dueThisWeek,
                    'inactive_subscriptions' => $inactiveCount,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching subscriptions: '.$e->getMessage());

            return Inertia::render('Subscriptions/Index', [
                'subscriptions' => [],
                'wallets' => [],
                'categories' => [],
                'stats' => [
                    'total_monthly_cost' => 0,
                    'active_subscriptions' => 0,
                    'due_this_week' => 0,
                    'inactive_subscriptions' => 0,
                ],
                'error' => 'An error occurred while loading subscriptions.',
            ]);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'frequency' => ['required', 'in:daily,weekly,monthly,yearly'],
            'next_billing_date' => ['required', 'date'],
            'wallet_id' => ['required', 'exists:wallets,id'],
            'category_id' => ['nullable', 'exists:categories,id'],
            'is_active' => ['nullable', 'boolean'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        try {
            DB::transaction(function () use ($request, $validated) {
                $sub = new Subscription($validated);
                $sub->user_id = $request->user()->id;
                $sub->is_active = $validated['is_active'] ?? true;
                $sub->save();
            });

            return redirect()->back()->with('success', 'Subscription successfully created.');
        } catch (\Exception $e) {
            Log::error('Error creating subscription: '.$e->getMessage());

            return redirect()->back()->withErrors(['error' => 'Failed to create subscription.']);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Subscription $subscription): RedirectResponse
    {
        abort_if($subscription->user_id !== $request->user()->id, 403);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'frequency' => ['required', 'in:daily,weekly,monthly,yearly'],
            'next_billing_date' => ['required', 'date'],
            'wallet_id' => ['required', 'exists:wallets,id'],
            'category_id' => ['nullable', 'exists:categories,id'],
            'is_active' => ['nullable', 'boolean'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        try {
            DB::transaction(function () use ($validated, $subscription) {
                $validated['is_active'] = $validated['is_active'] ?? true;
                $subscription->update($validated);
            });

            return redirect()->back()->with('success', 'Subscription successfully updated.');
        } catch (\Exception $e) {
            Log::error('Error updating subscription: '.$e->getMessage());

            return redirect()->back()->withErrors(['error' => 'Failed to update subscription.']);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Subscription $subscription): RedirectResponse
    {
        abort_if($subscription->user_id !== $request->user()->id, 403);

        try {
            DB::transaction(function () use ($subscription) {
                $subscription->delete();
            });

            return redirect()->back()->with('success', 'Subscription successfully deleted.');
        } catch (\Exception $e) {
            Log::error('Error deleting subscription: '.$e->getMessage());

            return redirect()->back()->withErrors(['error' => 'Failed to delete subscription.']);
        }
    }

    /**
     * Process a manual payment transaction for the subscription early.
     */
    public function processPayment(Request $request, Subscription $subscription): RedirectResponse
    {
        abort_if($subscription->user_id !== $request->user()->id, 403);

        try {
            DB::transaction(function () use ($subscription) {
                // Lock wallet for update
                $wallet = Wallet::where('id', $subscription->wallet_id)
                    ->where('user_id', $subscription->user_id)
                    ->lockForUpdate()
                    ->firstOrFail();

                $categoryId = $subscription->category_id;
                if (empty($categoryId)) {
                    $categoryId = Category::firstOrCreate([
                        'user_id' => $subscription->user_id,
                        'name' => 'Langganan',
                        'type' => 'expense',
                    ], [
                        'icon' => 'Repeat',
                        'color' => '#6366F1',
                    ])->id;
                }

                // Create the expense transaction
                Transaction::create([
                    'user_id' => $subscription->user_id,
                    'wallet_id' => $wallet->id,
                    'category_id' => $categoryId,
                    'type' => 'expense',
                    'amount' => $subscription->amount,
                    'date' => Carbon::now()->format('Y-m-d'),
                    'notes' => 'Payment for subscription: '.$subscription->name,
                ]);

                // Deduct wallet balance
                $wallet->current_balance = (float) $wallet->current_balance - (float) $subscription->amount;
                $wallet->save();

                // Calculate next billing date
                $nextDate = Carbon::parse($subscription->next_billing_date);
                switch ($subscription->frequency) {
                    case 'daily':
                        $nextDate->addDay();
                        break;
                    case 'weekly':
                        $nextDate->addWeek();
                        break;
                    case 'monthly':
                        $nextDate->addMonth();
                        break;
                    case 'yearly':
                        $nextDate->addYear();
                        break;
                }

                $subscription->next_billing_date = $nextDate;
                $subscription->save();
            });

            return redirect()->back()->with('success', 'Subscription payment successfully processed.');
        } catch (\Exception $e) {
            Log::error('Error processing subscription payment: '.$e->getMessage());

            return redirect()->back()->withErrors(['error' => 'Failed to process subscription payment: '.$e->getMessage()]);
        }
    }
}
