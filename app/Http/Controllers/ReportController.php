<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Transaction;
use App\Models\Wallet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        // 1. Fetch total income, total expense, and cash flow balance
        $summary = Transaction::where('user_id', $user->id)
            ->withoutTransfers()
            ->selectRaw("
                COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
                COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expense
            ")
            ->first();

        // 2. Fetch category spending distribution
        $categories = Transaction::where('transactions.user_id', $user->id)
            ->where('transactions.type', 'expense')
            ->withoutTransfers()
            ->join('categories', 'transactions.category_id', '=', 'categories.id')
            ->select('categories.name as category', DB::raw('SUM(transactions.amount) as value'))
            ->groupBy('categories.name')
            ->get();

        // 3. Fetch monthly trend of income vs expense
        $driver = DB::connection()->getDriverName();
        $monthSelector = match ($driver) {
            'sqlite' => "strftime('%Y-%m', date) as month",
            'pgsql' => "TO_CHAR(date, 'YYYY-MM') as month",
            default => "DATE_FORMAT(date, '%Y-%m') as month",
        };

        $monthlyTrend = Transaction::where('user_id', $user->id)
            ->withoutTransfers()
            ->selectRaw("
                {$monthSelector},
                COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as income,
                COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as expense
            ")
            ->groupBy('month')
            ->orderBy('month', 'asc')
            ->limit(12)
            ->get();

        // 4. Fetch wallets distribution balance
        $wallets = Wallet::where('user_id', $user->id)
            ->select('name as wallet', 'current_balance as value')
            ->get();

        return Inertia::render('Reports/Index', [
            'summary' => [
                'total_income' => $summary->total_income,
                'total_expense' => $summary->total_expense,
                'net_savings' => $summary->total_income - $summary->total_expense,
            ],
            'categoriesDistribution' => $categories,
            'monthlyTrend' => $monthlyTrend,
            'walletsDistribution' => $wallets,
        ]);
    }
}
