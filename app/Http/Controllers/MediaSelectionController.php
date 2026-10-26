<?php

namespace App\Http\Controllers;

use App\Models\MediaUpload;
use App\Models\Purchase;
use App\Support\PlanLimits;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MediaSelectionController extends ApiController
{
    public function store(Request $request, Purchase $purchase, PurchaseController $gifts)
    {
        Gate::authorize('update', $purchase);
        $id = ['required', 'string', 'regex:/^[\w-]{16,100}$/'];
        $selection = $request->validate([
            'photos' => 'required|array|list|min:1|max:'.PlanLimits::MAX['photos'], 'photos.*' => $id,
            'videos' => 'present|array|list|max:'.PlanLimits::MAX['videos'], 'videos.*' => $id,
            'music' => ['nullable', 'string', 'regex:/^[\w-]{16,100}$/'],
        ]);
        $selected = array_merge($selection['photos'], $selection['videos'], array_filter([$selection['music'] ?? null]));
        abort_unless(count($selected) === count(array_unique($selected)), 422, 'Mídia repetida.');
        $discarded = DB::transaction(function () use ($purchase, $selection, $selected, $gifts) {
            $p = Purchase::whereKey($purchase->id)->lockForUpdate()->firstOrFail();
            $gifts->editable($p, true);
            PlanLimits::assertManifest(PlanLimits::forPurchase($p), $selection, $p->plan_snapshot['name'] ?? null);
            $manifest = $p->manifest ?? [];
            $keep = array_merge($selected, $manifest['photos'] ?? [], $manifest['videos'] ?? [], array_filter([$manifest['music'] ?? null]));
            $assets = $p->assets()->whereNotIn('asset_id', $keep)->get();
            $p->assets()->whereIn('id', $assets->pluck('id'))->delete();
            // A storage outage must not lose the path of an abandoned file.
            foreach ($assets as $asset) {
                MediaUpload::create(['id' => (string) Str::uuid(), 'purchase_id' => $p->id, 'asset_id' => $asset->asset_id, 'mime' => $asset->mime, 'bytes' => 0, 'disk' => $asset->disk, 'path' => $asset->path, 'expires_at' => now()->addMinutes(20)]);
            }
            // Keep cleanup markers: previously signed PUTs remain valid until expiry.
            $uploads = MediaUpload::where('purchase_id', $p->id)->where('bytes', '>', 0)->whereNotIn('asset_id', $selected)->get();
            MediaUpload::whereIn('id', $uploads->pluck('id'))->update(['bytes' => 0]);
            $p->touch();

            return $assets->concat($uploads);
        });
        foreach ($discarded as $file) {
            Storage::disk($file->disk)->delete($file->path);
        }

        return $this->ok(['selected' => true]);
    }
}
