<?php

namespace App\Services;

use App\Http\Controllers\PurchaseController;
use App\Models\MediaAsset;
use App\Models\MediaUpload;
use App\Models\Purchase;
use App\Support\PlanLimits;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class GiftMedia
{
    public function __construct(private MediaValidator $validator, private PurchaseController $gifts) {}

    public function store(Purchase $purchase, string $asset, string $tmp, string $mime, ?string $uploadId = null): MediaAsset
    {
        $verified = $this->validator->validate($tmp, $mime);
        $disk = config('filesystems.default');
        $path = 'gifts/'.$purchase->id.'/'.Str::uuid();
        $keep = false;
        try {
            $stream = fopen($tmp, 'rb');
            try {
                abort_unless(Storage::disk($disk)->put($path, $stream, ['visibility' => 'private', 'ContentType' => $verified['mime']]), 503, 'Não foi possível armazenar a mídia.');
            } finally {
                if (is_resource($stream)) {
                    fclose($stream);
                }
            }
            $result = DB::transaction(function () use ($purchase, $asset, $verified, $disk, $path, $uploadId) {
                $p = Purchase::whereKey($purchase->id)->lockForUpdate()->firstOrFail();
                $this->gifts->editable($p, true);
                if ($uploadId !== null) {
                    abort_unless(MediaUpload::whereKey($uploadId)->where('purchase_id', $p->id)->where('asset_id', $asset)->where('bytes', '>', 0)->where('expires_at', '>', now())->exists(), 409, 'Esta reserva foi cancelada ou expirou. Envie novamente a seleção atual.');
                }
                if ($old = $p->assets()->where('asset_id', $asset)->first()) {
                    abort_unless($old->kind === $verified['kind'], 409, 'Identificador já usado por outro tipo de mídia.');

                    return $old;
                }
                // Defesa final: mesmo que o upload direto tenha sido reservado antes de uma
                // mudança de plano, a cota do tipo de mídia é conferida ao gravar o asset.
                PlanLimits::assertUploadAllowed($p, $verified['kind'], $asset, $uploadId);
                $reserved = MediaUpload::where('purchase_id', $p->id)->where('expires_at', '>', now())->when($uploadId, fn ($q) => $q->where('id', '!=', $uploadId))->sum('bytes');
                abort_if($p->assets()->count() >= 80 || $p->assets()->sum('bytes') + $reserved + $verified['bytes'] > 314572800, 413, 'Limite de 300 MB atingido.');
                $p->touch();

                return $p->assets()->create(['asset_id' => $asset, ...$verified, 'disk' => $disk, 'path' => $path]);
            });
            $keep = $result->path === $path;

            return $result;
        } finally {
            if (! $keep) {
                Storage::disk($disk)->delete($path);
            }
        }
    }

    public static function deletePurchase(Purchase $purchase): void
    {
        $disks = $purchase->assets()->pluck('disk')->merge(MediaUpload::where('purchase_id', $purchase->id)->pluck('disk'))->push(config('filesystems.default'))->unique();
        foreach ($disks as $disk) {
            Storage::disk($disk)->deleteDirectory('gifts/'.$purchase->id);
        }
    }
}
