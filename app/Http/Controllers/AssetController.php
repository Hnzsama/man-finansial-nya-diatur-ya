<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class AssetController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        try {
            $user = $request->user();

            $assets = Asset::where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->get();

            // Calculate stats
            $totalValue = (float) $assets->sum('current_value');

            // Count assets by type
            $counts = [
                'savings' => 0,
                'deposit' => 0,
                'gold' => 0,
                'stock' => 0,
                'crypto' => 0,
                'property' => 0,
            ];

            foreach ($assets as $asset) {
                if (array_key_exists($asset->type, $counts)) {
                    $counts[$asset->type]++;
                }
            }

            return Inertia::render('Assets/Index', [
                'assets' => $assets,
                'stats' => [
                    'total_value' => $totalValue,
                    'counts' => $counts,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching assets: '.$e->getMessage());

            return Inertia::render('Assets/Index', [
                'assets' => [],
                'stats' => [
                    'total_value' => 0,
                    'counts' => [
                        'savings' => 0,
                        'deposit' => 0,
                        'gold' => 0,
                        'stock' => 0,
                        'crypto' => 0,
                        'property' => 0,
                    ],
                ],
                'error' => 'An error occurred while loading assets.',
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
            'type' => ['required', 'in:savings,deposit,gold,stock,crypto,property'],
            'current_value' => ['required', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        try {
            DB::transaction(function () use ($request, $validated) {
                $asset = new Asset($validated);
                $asset->user_id = $request->user()->id;
                $asset->save();
            });

            return redirect()->back()->with('success', 'Asset successfully added.');
        } catch (\Exception $e) {
            Log::error('Error creating asset: '.$e->getMessage());

            return redirect()->back()->withErrors(['error' => 'Failed to create asset.']);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Asset $asset): RedirectResponse
    {
        abort_if($asset->user_id !== $request->user()->id, 403);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'in:savings,deposit,gold,stock,crypto,property'],
            'current_value' => ['required', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        try {
            DB::transaction(function () use ($validated, $asset) {
                $asset->update($validated);
            });

            return redirect()->back()->with('success', 'Asset successfully updated.');
        } catch (\Exception $e) {
            Log::error('Error updating asset: '.$e->getMessage());

            return redirect()->back()->withErrors(['error' => 'Failed to update asset.']);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Asset $asset): RedirectResponse
    {
        abort_if($asset->user_id !== $request->user()->id, 403);

        try {
            DB::transaction(function () use ($asset) {
                $asset->delete();
            });

            return redirect()->back()->with('success', 'Asset successfully deleted.');
        } catch (\Exception $e) {
            Log::error('Error deleting asset: '.$e->getMessage());

            return redirect()->back()->withErrors(['error' => 'Failed to delete asset.']);
        }
    }
}
