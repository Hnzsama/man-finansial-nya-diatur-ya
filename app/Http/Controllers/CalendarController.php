<?php

namespace App\Http\Controllers;

use App\Models\Debt;
use App\Models\Goal;
use App\Models\Subscription;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CalendarController extends Controller
{
    /**
     * Display the financial calendar.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        // 1. Get transactions (limit to past 6 months and next 1 month to keep response size optimal)
        $transactions = Transaction::where('user_id', $user->id)
            ->withoutTransfers()
            ->with(['wallet:id,name', 'category:id,name,type'])
            ->whereDate('date', '>=', now()->subMonths(6))
            ->whereDate('date', '<=', now()->addMonth())
            ->get();

        // 2. Get goals
        $goals = Goal::where('user_id', $user->id)
            ->whereNotNull('deadline')
            ->get();

        // 3. Get active debts/loans
        $debts = Debt::where('user_id', $user->id)
            ->whereIn('status', ['active'])
            ->whereNotNull('due_date')
            ->get();

        // 4. Get active subscriptions
        $subscriptions = Subscription::where('user_id', $user->id)
            ->where('is_active', true)
            ->whereNotNull('next_billing_date')
            ->get();

        return Inertia::render('Calendar/Index', [
            'transactions' => $transactions,
            'goals' => $goals,
            'debts' => $debts,
            'subscriptions' => $subscriptions,
        ]);
    }
}
