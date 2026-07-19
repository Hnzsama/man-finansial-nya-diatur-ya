<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Asset;
use App\Models\Budget;
use App\Models\Debt;
use App\Models\Goal;
use App\Models\Subscription;
use App\Models\Transaction;
use App\Models\Wallet;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardApiController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        try {
            $user = $request->user();

            // Read date filters from query
            $startDate = $request->query('start_date', Carbon::now()->startOfMonth()->toDateString());
            $endDate = $request->query('end_date', Carbon::now()->endOfMonth()->toDateString());

            // Total Balance
            $totalBalance = Wallet::where('user_id', $user->id)->sum('current_balance');

            // Wallets
            $wallets = Wallet::where('user_id', $user->id)->get();

            // Income / Expense in date range (exclude Transfer Fund)
            $rangeTransactions = Transaction::where('user_id', $user->id)
                ->whereBetween('date', [$startDate, $endDate])
                ->withoutTransfers()
                ->get();

            $income = $rangeTransactions->where('type', 'income')->sum('amount');
            $expense = $rangeTransactions->where('type', 'expense')->sum('amount');

            // Recent Transactions
            $recentTransactions = Transaction::with(['wallet', 'category'])
                ->where('user_id', $user->id)
                ->orderBy('date', 'desc')
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get();

            // Budget Status from budgets table
            $budgets = Budget::with('category')
                ->where('user_id', $user->id)
                ->get();

            $budgetStatus = [];
            foreach ($budgets as $budget) {
                if (! $budget->category) {
                    continue;
                }

                $spent = Transaction::where('user_id', $user->id)
                    ->where('category_id', $budget->category_id)
                    ->where('type', 'expense')
                    ->whereBetween('date', [$startDate, $endDate])
                    ->sum('amount');

                $budgetStatus[] = [
                    'category' => $budget->category,
                    'spent' => (float) $spent,
                    'budget' => (float) $budget->amount_limit,
                    'percentage' => $budget->amount_limit > 0 ? round(($spent / $budget->amount_limit) * 100, 1) : 0,
                ];
            }

            // Additional Summary Data
            $totalAssetValue = Asset::where('user_id', $user->id)->sum('current_value');
            $totalDebt = Debt::where('user_id', $user->id)->where('type', 'payable')->where('status', 'active')->sum('remaining_amount');
            $totalReceivable = Debt::where('user_id', $user->id)->where('type', 'receivable')->where('status', 'active')->sum('remaining_amount');
            $totalGoalTarget = Goal::where('user_id', $user->id)->sum('target_amount');
            $totalGoalCurrent = Goal::where('user_id', $user->id)->sum('current_amount');
            $activeSubscriptionsCount = Subscription::where('user_id', $user->id)->where('is_active', true)->count();

            return response()->json([
                'total_balance' => (float) $totalBalance,
                'income_this_month' => (float) $income,
                'expense_this_month' => (float) $expense,
                'net_this_month' => (float) ($income - $expense),
                'wallets' => $wallets,
                'recent_transactions' => $recentTransactions,
                'budget_status' => $budgetStatus,
                'total_asset_value' => (float) $totalAssetValue,
                'total_debt' => (float) $totalDebt,
                'total_receivable' => (float) $totalReceivable,
                'total_goal_target' => (float) $totalGoalTarget,
                'total_goal_current' => (float) $totalGoalCurrent,
                'active_subscriptions_count' => (int) $activeSubscriptionsCount,
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to load dashboard data.'], 500);
        }
    }
}
