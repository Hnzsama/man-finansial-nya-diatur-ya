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

class ExportImportController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $wallets = Wallet::where('user_id', $user->id)->get();

        // Fetch all transactions for this user to pass to export panel
        $transactions = Transaction::with(['wallet', 'category'])
            ->where('user_id', $user->id)
            ->orderBy('date', 'desc')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($tx) {
                return [
                    'date' => $tx->date ? $tx->date->toIso8601String() : '',
                    'type' => $tx->type,
                    'amount' => (float) $tx->amount,
                    'category' => $tx->category?->name ?? '-',
                    'wallet' => $tx->wallet?->name ?? '-',
                    'wallet_id' => $tx->wallet_id,
                    'notes' => $tx->notes ?? '',
                    'goal_id' => $tx->goal_id,
                    'debt_id' => $tx->debt_id,
                ];
            });

        // Fetch subscriptions to allow exporting them under 'subscriptions' scope
        $subscriptions = Subscription::with(['wallet', 'category'])
            ->where('user_id', $user->id)
            ->get()
            ->map(function ($sub) {
                return [
                    'date' => $sub->next_billing_date ? $sub->next_billing_date->toIso8601String() : '',
                    'type' => 'expense',
                    'amount' => (float) $sub->amount,
                    'category' => $sub->category?->name ?? 'Subscription',
                    'wallet' => $sub->wallet?->name ?? '-',
                    'wallet_id' => $sub->wallet_id,
                    'notes' => 'Subscription: '.$sub->name.($sub->notes ? ' ('.$sub->notes.')' : ''),
                    'is_subscription' => true,
                    'goal_id' => null,
                    'debt_id' => null,
                ];
            });

        $mergedTransactions = $transactions->concat($subscriptions);

        return Inertia::render('ExportsImports/Index', [
            'wallets' => $wallets,
            'realTransactions' => $mergedTransactions,
        ]);
    }

    /**
     * Store a newly created resource in storage (real upload and parsing of CSV).
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'csv_file' => ['required', 'file', 'mimes:csv,txt', 'max:2048'],
        ]);

        $user = $request->user();
        $file = $request->file('csv_file');
        $path = $file->getRealPath();

        try {
            $handle = fopen($path, 'r');
            if ($handle === false) {
                return redirect()->back()->withErrors(['csv_file' => 'Failed to open the CSV file.']);
            }

            $header = null;
            $rowCount = 0;

            DB::transaction(function () use ($handle, $user, &$rowCount, &$header) {
                while (($row = fgetcsv($handle, 1000, ',')) !== false) {
                    // Skip empty rows or comment rows starting with '#'
                    if (empty($row) || ! isset($row[0]) || str_starts_with(trim($row[0]), '#')) {
                        continue;
                    }

                    if (! $header) {
                        // Normalize headers: lowercase and trimmed
                        $header = array_map(function ($h) {
                            return strtolower(trim($h));
                        }, $row);

                        continue;
                    }

                    // Map row items to headers
                    if (count($header) !== count($row)) {
                        continue;
                    }
                    $data = array_combine($header, $row);
                    if (! $data) {
                        continue;
                    }

                    // Parse date and cap to today's date if it is in the future
                    try {
                        $parsedDate = Carbon::parse($data['date'] ?? now());
                        if ($parsedDate->isFuture()) {
                            $parsedDate = Carbon::today();
                        }
                        $date = $parsedDate->toDateString();
                    } catch (\Exception $e) {
                        $date = now()->format('Y-m-d');
                    }

                    $type = strtolower(trim($data['type'] ?? 'expense'));
                    if (! in_array($type, ['income', 'expense'])) {
                        $type = 'expense';
                    }
                    $amount = (float) ($data['amount'] ?? 0);
                    $categoryName = trim($data['category'] ?? '');
                    $walletName = trim($data['wallet'] ?? '');
                    $notes = trim($data['notes'] ?? '');

                    // 1. Resolve Wallet
                    $wallet = Wallet::where('user_id', $user->id)
                        ->where('name', $walletName)
                        ->first();
                    if (! $wallet) {
                        $wallet = Wallet::firstOrCreate([
                            'user_id' => $user->id,
                            'name' => $walletName ?: 'Cash',
                        ], [
                            'type' => 'cash',
                            'current_balance' => 0,
                        ]);
                    }

                    // 2. Resolve Category
                    $categoryId = null;
                    $normalizedCategoryName = trim($categoryName);

                    // Check if it's a transfer based on category name or notes
                    $isTransfer = in_array(strtolower($normalizedCategoryName), ['transfer masuk', 'transfer keluar', 'transfer in', 'transfer out', 'transfer fund'])
                        || str_starts_with(strtolower($notes), 'transfer to')
                        || str_starts_with(strtolower($notes), 'transfer from');

                    if ($isTransfer) {
                        $category = Category::firstOrCreate([
                            'user_id' => $user->id,
                            'name' => 'Transfer Fund',
                            'type' => $type,
                        ], [
                            'icon' => 'ArrowsRightLeft',
                            'color' => $type === 'income' ? '#10B981' : '#EF4444',
                        ]);
                        $categoryId = $category->id;
                    } elseif ($categoryName && $categoryName !== '-') {
                        $category = Category::firstOrCreate([
                            'user_id' => $user->id,
                            'name' => $categoryName,
                            'type' => $type,
                        ]);
                        $categoryId = $category->id;
                    }

                    // 3. Create Transaction
                    Transaction::create([
                        'user_id' => $user->id,
                        'wallet_id' => $wallet->id,
                        'category_id' => $categoryId,
                        'type' => $type,
                        'amount' => $amount,
                        'date' => $date,
                        'notes' => $notes ?: null,
                    ]);

                    // 4. Update Wallet balance
                    if ($type === 'income') {
                        $wallet->current_balance = (float) $wallet->current_balance + $amount;
                    } else {
                        $wallet->current_balance = (float) $wallet->current_balance - $amount;
                    }
                    $wallet->save();

                    $rowCount++;
                }
            });

            fclose($handle);

            return redirect()->back()->with('success', "Successfully imported {$rowCount} transaction records into the database.");
        } catch (\Exception $e) {
            Log::error('Failed to import CSV: '.$e->getMessage());

            return redirect()->back()->withErrors(['csv_file' => 'Failed to process the CSV file: '.$e->getMessage()]);
        }
    }
}
