<?php

namespace App\Http\Controllers;

use App\Models\Wallet;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class WalletController extends Controller
{
    /**
     * Display a listing of the wallets.
     */
    public function index(Request $request): Response|RedirectResponse
    {
        try {
            $wallets = $request->user()->wallets()->orderBy('name')->get();

            $totalBalance = $wallets->sum('current_balance');
            $cashBalance = $wallets->where('type', 'cash')->sum('current_balance');
            $bankBalance = $wallets->where('type', 'bank')->sum('current_balance');
            $ewalletBalance = $wallets->where('type', 'ewallet')->sum('current_balance');

            return Inertia::render('Wallets/Index', [
                'wallets' => $wallets,
                'stats' => [
                    'total_balance' => $totalBalance,
                    'cash_balance' => $cashBalance,
                    'bank_balance' => $bankBalance,
                    'ewallet_balance' => $ewalletBalance,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching wallets: '.$e->getMessage());

            return redirect()->back()->with('error', 'Terjadi kesalahan saat memuat data wallet.');
        }
    }

    /**
     * Store a newly created wallet in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'in:cash,bank,ewallet,digital'],
            'opening_balance' => ['required', 'numeric', 'min:0'],
            'icon' => ['nullable', 'string', 'max:255'],
            'color' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
        ]);

        try {
            DB::transaction(function () use ($validated, $request) {
                // When creating, the current_balance is initially the opening_balance
                $validated['current_balance'] = $validated['opening_balance'];

                $request->user()->wallets()->create($validated);
            });

            return redirect()->back()->with('success', 'Wallet berhasil dibuat.');
        } catch (\Exception $e) {
            Log::error('Error creating wallet: '.$e->getMessage());

            return redirect()->back()->with('error', 'Terjadi kesalahan saat membuat wallet.');
        }
    }

    /**
     * Update the specified wallet in storage.
     */
    public function update(Request $request, Wallet $wallet): RedirectResponse
    {
        abort_if($wallet->user_id !== $request->user()->id, 403);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'in:cash,bank,ewallet,digital'],
            'opening_balance' => ['required', 'numeric'],
            'icon' => ['nullable', 'string', 'max:255'],
            'color' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
        ]);

        try {
            DB::transaction(function () use ($validated, $wallet) {
                // Calculate difference in opening balance to adjust current balance
                $difference = $validated['opening_balance'] - $wallet->opening_balance;
                $validated['current_balance'] = $wallet->current_balance + $difference;

                $wallet->update($validated);
            });

            return redirect()->back()->with('success', 'Wallet berhasil diperbarui.');
        } catch (\Exception $e) {
            Log::error('Error updating wallet: '.$e->getMessage());

            return redirect()->back()->with('error', 'Terjadi kesalahan saat memperbarui wallet.');
        }
    }

    /**
     * Remove the specified wallet from storage.
     */
    public function destroy(Request $request, Wallet $wallet): RedirectResponse
    {
        abort_if($wallet->user_id !== $request->user()->id, 403);

        try {
            DB::transaction(function () use ($wallet) {
                $wallet->delete();
            });

            return redirect()->back()->with('success', 'Wallet berhasil dihapus.');
        } catch (\Exception $e) {
            Log::error('Error deleting wallet: '.$e->getMessage());

            return redirect()->back()->with('error', 'Terjadi kesalahan saat menghapus wallet.');
        }
    }
}
