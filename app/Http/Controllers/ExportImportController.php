<?php

namespace App\Http\Controllers;

use App\Models\Wallet;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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

        return Inertia::render('ExportsImports/Index', [
            'wallets' => $wallets,
        ]);
    }

    /**
     * Store a newly created resource in storage (mock upload CSV).
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'csv_file' => ['required', 'file', 'mimes:csv,txt', 'max:2048'],
        ]);

        // Simulating parsing of bank mutation rows
        return redirect()->back()->with('success', 'Simulated CSV ledger imported successfully (12 transaction records parsed).');
    }
}
