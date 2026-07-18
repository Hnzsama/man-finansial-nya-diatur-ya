<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Asset;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AssetApiController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        try {
            $assets = Asset::where('user_id', $request->user()->id)->get()->map(function ($asset) {
                $asset->value = $asset->current_value;

                return $asset;
            });

            return response()->json($assets);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to fetch assets.'], 500);
        }
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'in:savings,deposit,gold,stocks,crypto,property,other'],
            'value' => ['required', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string'],
        ]);

        try {
            $asset = DB::transaction(function () use ($validated, $request) {
                return Asset::create([
                    'user_id' => $request->user()->id,
                    'name' => $validated['name'],
                    'type' => $validated['type'],
                    'current_value' => $validated['value'],
                    'notes' => $validated['notes'] ?? null,
                ]);
            });

            $asset->value = $asset->current_value;

            return response()->json($asset, 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to create asset.'], 500);
        }
    }

    public function show(Request $request, Asset $asset): JsonResponse
    {
        if ($asset->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $asset->value = $asset->current_value;

        return response()->json($asset);
    }

    public function update(Request $request, Asset $asset): JsonResponse
    {
        if ($asset->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'in:savings,deposit,gold,stocks,crypto,property,other'],
            'value' => ['required', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string'],
        ]);

        try {
            DB::transaction(function () use ($validated, $asset) {
                $asset->update([
                    'name' => $validated['name'],
                    'type' => $validated['type'],
                    'current_value' => $validated['value'],
                    'notes' => $validated['notes'] ?? null,
                ]);
            });

            $asset->value = $asset->current_value;

            return response()->json($asset);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to update asset.'], 500);
        }
    }

    public function destroy(Request $request, Asset $asset): JsonResponse
    {
        if ($asset->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        try {
            DB::transaction(function () use ($asset) {
                $asset->delete();
            });

            return response()->json(['message' => 'Asset deleted successfully.']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to delete asset.'], 500);
        }
    }
}
