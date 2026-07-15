<?php

namespace App\Http\Controllers;

use App\Models\Goal;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class GoalController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        try {
            $user = $request->user();

            $goals = Goal::where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->get();

            // Calculate progress for each goal
            $goals = $goals->map(function ($goal) {
                $goal->progress = $goal->target_amount > 0
                    ? min(round(($goal->current_amount / $goal->target_amount) * 100, 1), 100)
                    : 0;

                return $goal;
            });

            return Inertia::render('Goals/Index', [
                'goals' => $goals,
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching goals: '.$e->getMessage());

            return Inertia::render('Goals/Index', [
                'goals' => [],
                'error' => 'Terjadi kesalahan saat memuat data target keuangan.',
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
            'target_amount' => ['required', 'numeric', 'min:0.01'],
            'current_amount' => ['nullable', 'numeric', 'min:0'],
            'deadline' => ['nullable', 'date'],
            'color' => ['nullable', 'string', 'max:255'],
            'icon' => ['nullable', 'string', 'max:255'],
        ]);

        try {
            DB::transaction(function () use ($request, $validated) {
                $goal = new Goal($validated);
                $goal->user_id = $request->user()->id;
                $goal->current_amount = $validated['current_amount'] ?? 0;
                $goal->save();
            });

            return redirect()->back()->with('success', 'Target keuangan berhasil dibuat.');
        } catch (\Exception $e) {
            Log::error('Error creating goal: '.$e->getMessage());

            return redirect()->back()->withErrors(['error' => 'Gagal membuat target keuangan.']);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Goal $goal): RedirectResponse
    {
        abort_if($goal->user_id !== $request->user()->id, 403);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'target_amount' => ['required', 'numeric', 'min:0.01'],
            'current_amount' => ['nullable', 'numeric', 'min:0'],
            'deadline' => ['nullable', 'date'],
            'color' => ['nullable', 'string', 'max:255'],
            'icon' => ['nullable', 'string', 'max:255'],
        ]);

        try {
            DB::transaction(function () use ($validated, $goal) {
                $goal->update($validated);
            });

            return redirect()->back()->with('success', 'Target keuangan berhasil diperbarui.');
        } catch (\Exception $e) {
            Log::error('Error updating goal: '.$e->getMessage());

            return redirect()->back()->withErrors(['error' => 'Gagal memperbarui target keuangan.']);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Goal $goal): RedirectResponse
    {
        abort_if($goal->user_id !== $request->user()->id, 403);

        try {
            DB::transaction(function () use ($goal) {
                $goal->delete();
            });

            return redirect()->back()->with('success', 'Target keuangan berhasil dihapus.');
        } catch (\Exception $e) {
            Log::error('Error deleting goal: '.$e->getMessage());

            return redirect()->back()->withErrors(['error' => 'Gagal menghapus target keuangan.']);
        }
    }
}
