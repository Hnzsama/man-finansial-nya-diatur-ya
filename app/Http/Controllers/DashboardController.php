<?php

namespace App\Http\Controllers;

use App\Models\Budget;
use App\Models\Category;
use App\Models\Debt;
use App\Models\Goal;
use App\Models\Subscription;
use App\Models\Transaction;
use App\Models\Wallet;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        try {
            $user = $request->user();
            $userId = $user->id;

            // ── 1. Core Stats ──────────────────────────────────────────────
            $wallets = Wallet::where('user_id', $userId)->get();
            $totalBalance = $wallets->sum('current_balance');

            $startOfMonth = Carbon::now()->startOfMonth();
            $endOfMonth = Carbon::now()->endOfMonth();

            $currentMonthTransactions = Transaction::where('user_id', $userId)
                ->whereBetween('date', [$startOfMonth, $endOfMonth])
                ->withoutTransfers()
                ->get();

            $monthlyIncome = $currentMonthTransactions->where('type', 'income')->sum('amount');
            $monthlyExpense = $currentMonthTransactions->where('type', 'expense')->sum('amount');
            $netFlow = $monthlyIncome - $monthlyExpense;

            $startOfLastMonth = Carbon::now()->subMonth()->startOfMonth();
            $endOfLastMonth = Carbon::now()->subMonth()->endOfMonth();

            $lastMonthTransactions = Transaction::where('user_id', $userId)
                ->whereBetween('date', [$startOfLastMonth, $endOfLastMonth])
                ->withoutTransfers()
                ->get();

            $lastMonthIncome = $lastMonthTransactions->where('type', 'income')->sum('amount');
            $lastMonthExpense = $lastMonthTransactions->where('type', 'expense')->sum('amount');
            $lastMonthNetFlow = $lastMonthIncome - $lastMonthExpense;

            $incomeChange = $lastMonthIncome > 0 ? (($monthlyIncome - $lastMonthIncome) / $lastMonthIncome) * 100 : 0;
            $expenseChange = $lastMonthExpense > 0 ? (($monthlyExpense - $lastMonthExpense) / $lastMonthExpense) * 100 : 0;
            $netFlowChange = $lastMonthNetFlow != 0 ? (($netFlow - $lastMonthNetFlow) / abs($lastMonthNetFlow)) * 100 : 0;

            $stats = [
                'total_balance' => (float) $totalBalance,
                'monthly_income' => (float) $monthlyIncome,
                'monthly_expense' => (float) $monthlyExpense,
                'net_flow' => (float) $netFlow,
                'income_change' => round($incomeChange, 1),
                'expense_change' => round($expenseChange, 1),
                'net_flow_change' => round($netFlowChange, 1),
            ];

            // ── 2. Spending Chart (last 90 days) ───────────────────────────
            $startDate = Carbon::now()->subDays(90)->startOfDay();
            $chartTransactions = Transaction::where('user_id', $userId)
                ->where('date', '>=', $startDate)
                ->whereIn('type', ['income', 'expense'])
                ->withoutTransfers()
                ->select('date', DB::raw('type'), DB::raw('SUM(amount) as total'))
                ->groupBy('date', 'type')
                ->get();

            $chartData = [];
            for ($i = 90; $i >= 0; $i--) {
                $d = Carbon::now()->subDays($i)->format('Y-m-d');
                $chartData[$d] = ['date' => $d, 'income' => 0, 'expense' => 0];
            }
            foreach ($chartTransactions as $ct) {
                $d = Carbon::parse($ct->date)->format('Y-m-d');
                if (isset($chartData[$d])) {
                    $chartData[$d][$ct->type] = (float) $ct->total;
                }
            }
            $chartDataList = array_values($chartData);

            // ── 3. Recent Transactions ─────────────────────────────────────
            $recentTransactions = Transaction::with(['wallet', 'category'])
                ->where('user_id', $userId)
                ->orderBy('date', 'desc')
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get();

            $walletsList = Wallet::where('user_id', $userId)->get();
            $categoriesList = Category::where('user_id', $userId)->get();

            // ── 4. Wallet Distribution (for donut chart) ───────────────────
            $walletsDistribution = $walletsList->map(fn ($w) => [
                'name' => $w->name,
                'balance' => (float) $w->current_balance,
                'type' => $w->type,
                'color' => $w->color,
            ])->filter(fn ($w) => $w['balance'] > 0)->values();

            // ── 5. Budgets Summary ─────────────────────────────────────────
            $activeBudgets = Budget::where('user_id', $userId)
                ->where(function ($q) {
                    $q->whereNull('end_date')->orWhere('end_date', '>=', Carbon::now());
                })
                ->with('category')
                ->get();

            /** @var array<int, array{id:int, name:string, limit:float, spent:float, category:string|null, period:string}> $topBudgets */
            $topBudgets = $activeBudgets->map(function ($budget) use ($userId, $startOfMonth, $endOfMonth) {
                $spent = Transaction::where('user_id', $userId)
                    ->where('type', 'expense')
                    ->withoutTransfers()
                    ->when($budget->category_id, fn ($q) => $q->where('category_id', $budget->category_id))
                    ->whereBetween('date', [$startOfMonth, $endOfMonth])
                    ->sum('amount');

                return [
                    'id' => $budget->id,
                    'name' => $budget->name,
                    'limit' => (float) $budget->amount_limit,
                    'spent' => (float) $spent,
                    'category' => $budget->category?->name,
                    'period' => $budget->period,
                ];
            })->sortByDesc('spent')->take(4)->values();

            $budgetsSummary = [
                'count' => $activeBudgets->count(),
                'total_limit' => (float) $activeBudgets->sum('amount_limit'),
                'total_spent' => (float) $topBudgets->sum('spent'),
            ];

            // ── 6. Goals Summary ───────────────────────────────────────────
            $activeGoals = Goal::where('user_id', $userId)->get();
            $avgProgress = $activeGoals->count() > 0
                ? $activeGoals->avg(fn ($g) => $g->target_amount > 0
                    ? min(($g->current_amount / $g->target_amount) * 100, 100)
                    : 0)
                : 0;

            $nearestGoal = $activeGoals
                ->filter(fn ($g) => $g->deadline !== null)
                ->sortBy('deadline')
                ->first();

            $topGoals = $activeGoals->map(fn ($g) => [
                'id' => $g->id,
                'name' => $g->name,
                'target_amount' => (float) $g->target_amount,
                'current_amount' => (float) $g->current_amount,
                'progress' => $g->target_amount > 0
                    ? round(min(($g->current_amount / $g->target_amount) * 100, 100), 1)
                    : 0,
                'deadline' => $g->deadline?->format('Y-m-d'),
                'color' => $g->color,
                'icon' => $g->icon,
            ])->sortByDesc('progress')->take(4)->values();

            $goalsSummary = [
                'count' => $activeGoals->count(),
                'avg_progress' => round($avgProgress, 1),
                'nearest_deadline' => $nearestGoal?->deadline?->format('Y-m-d'),
                'nearest_name' => $nearestGoal?->name,
            ];

            // ── 7. Debts Summary ───────────────────────────────────────────
            $activeDebts = Debt::where('user_id', $userId)->where('status', 'active')->get();

            $totalPayable = $activeDebts->where('type', 'payable')->sum('remaining_amount');
            $totalReceivable = $activeDebts->where('type', 'receivable')->sum('remaining_amount');
            $overdueCount = $activeDebts->filter(
                fn ($d) => $d->due_date !== null && $d->due_date->lt(Carbon::today())
            )->count();

            $debtsSummary = [
                'total_payable' => (float) $totalPayable,
                'total_receivable' => (float) $totalReceivable,
                'overdue_count' => $overdueCount,
                'count' => $activeDebts->count(),
            ];

            // ── 8. Subscriptions Summary ───────────────────────────────────
            $activeSubscriptions = Subscription::where('user_id', $userId)
                ->where('is_active', true)
                ->orderBy('next_billing_date')
                ->get();

            $monthlySubCost = $activeSubscriptions->sum(function ($sub) {
                return match ($sub->frequency) {
                    'daily' => (float) $sub->amount * 30,
                    'weekly' => (float) $sub->amount * 4.33,
                    'monthly' => (float) $sub->amount,
                    'yearly' => (float) $sub->amount / 12,
                    default => (float) $sub->amount,
                };
            });

            $nextSub = $activeSubscriptions->first();
            $daysUntilNext = $nextSub
                ? max(0, (int) Carbon::now()->diffInDays($nextSub->next_billing_date, false))
                : null;

            $subscriptionsSummary = [
                'count' => $activeSubscriptions->count(),
                'monthly_cost' => round($monthlySubCost, 2),
                'next_billing' => $nextSub?->next_billing_date?->format('Y-m-d'),
                'next_name' => $nextSub?->name,
                'days_until_next' => $daysUntilNext,
            ];

            return Inertia::render('Dashboard/Index', [
                'stats' => $stats,
                'chartData' => $chartDataList,
                'recentTransactions' => $recentTransactions,
                'wallets' => $walletsList,
                'categories' => $categoriesList,
                'walletsDistribution' => $walletsDistribution,
                'budgetsSummary' => $budgetsSummary,
                'topBudgets' => $topBudgets,
                'goalsSummary' => $goalsSummary,
                'topGoals' => $topGoals,
                'debtsSummary' => $debtsSummary,
                'subscriptionsSummary' => $subscriptionsSummary,
            ]);

        } catch (\Exception $e) {
            Log::error('Error loading dashboard data: '.$e->getMessage());

            return Inertia::render('Dashboard/Index', [
                'stats' => ['total_balance' => 0, 'monthly_income' => 0, 'monthly_expense' => 0, 'net_flow' => 0, 'income_change' => 0, 'expense_change' => 0, 'net_flow_change' => 0],
                'chartData' => [],
                'recentTransactions' => [],
                'wallets' => [],
                'categories' => [],
                'walletsDistribution' => [],
                'budgetsSummary' => ['count' => 0, 'total_limit' => 0, 'total_spent' => 0],
                'topBudgets' => [],
                'goalsSummary' => ['count' => 0, 'avg_progress' => 0, 'nearest_deadline' => null, 'nearest_name' => null],
                'topGoals' => [],
                'debtsSummary' => ['total_payable' => 0, 'total_receivable' => 0, 'overdue_count' => 0, 'count' => 0],
                'subscriptionsSummary' => ['count' => 0, 'monthly_cost' => 0, 'next_billing' => null, 'next_name' => null, 'days_until_next' => null],
                'error' => 'Terjadi kesalahan saat memuat data dashboard.',
            ]);
        }
    }
}
