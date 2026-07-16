<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
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
            $startOfMonth = Carbon::now()->startOfMonth()->toDateString();
            $endOfMonth = Carbon::now()->endOfMonth()->toDateString();

            // Total Balance
            $totalBalance = Wallet::where('user_id', $user->id)->sum('current_balance');

            // Wallets
            $wallets = Wallet::where('user_id', $user->id)->get();

            // Income / Expense this month
            $thisMonthTransactions = Transaction::where('user_id', $user->id)
                ->whereBetween('date', [$startOfMonth, $endOfMonth])
                ->get();

            $income = $thisMonthTransactions->where('type', 'income')->sum('amount');
            $expense = $thisMonthTransactions->where('type', 'expense')->sum('amount');

            // Recent Transactions
            $recentTransactions = Transaction::with(['wallet', 'category'])
                ->where('user_id', $user->id)
                ->orderBy('date', 'desc')
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get();

            // Budget Status
            $categoriesWithBudget = Category::where('user_id', $user->id)
                ->whereNotNull('budget_amount')
                ->get();

            $budgetStatus = [];
            foreach ($categoriesWithBudget as $category) {
                $spent = Transaction::where('user_id', $user->id)
                    ->where('category_id', $category->id)
                    ->where('type', 'expense')
                    ->whereBetween('date', [$startOfMonth, $endOfMonth])
                    ->sum('amount');

                $budgetStatus[] = [
                    'category' => $category,
                    'spent' => (float) $spent,
                    'budget' => (float) $category->budget_amount,
                    'percentage' => $category->budget_amount > 0 ? round(($spent / $category->budget_amount) * 100, 1) : 0,
                ];
            }

            return response()->json([
                'total_balance' => (float) $totalBalance,
                'income_this_month' => (float) $income,
                'expense_this_month' => (float) $expense,
                'net_this_month' => (float) ($income - $expense),
                'wallets' => $wallets,
                'recent_transactions' => $recentTransactions,
                'budget_status' => $budgetStatus,
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to load dashboard data.'], 500);
        }
    }
}
