<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Debt;
use App\Models\Goal;
use App\Models\Subscription;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CalendarApiController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        // 1. Get transactions (limit to past 6 months and next 1 month)
        $transactions = Transaction::where('user_id', $user->id)
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

        return response()->json([
            'transactions' => $transactions,
            'goals' => $goals,
            'debts' => $debts,
            'subscriptions' => $subscriptions,
        ]);
    }
}
