<?php

namespace App\Http\Controllers;

use App\Models\Purchase;
use App\Services\GiftMedia;
use App\Services\MediaValidator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;

class MediaController extends ApiController
{
    public function upload(Request $request, Purchase $purchase, string $asset, GiftMedia $media, PurchaseController $gifts)
    {
        Gate::authorize('update', $purchase);
        $gifts->editable($purchase, true);
        if ($unavailable = $this->mediaUnavailable()) {
            return $unavailable;
        }
        abort_unless(preg_match('/^[\w-]{16,100}$/', $asset), 422, 'Identificador inválido.');
        $mime = strtolower(explode(';', $request->header('Content-Type', ''))[0]);
        $kind = MediaValidator::TYPES[$mime] ?? null;
        abort_unless($kind, 415, 'Formato não suportado.');
        $limit = MediaValidator::limits()[$kind];
        abort_if((int) $request->header('Content-Length') > $limit, 413, 'Arquivo muito grande.');
        $tmp = tempnam(sys_get_temp_dir(), 'na_');
        try {
            $input = $request->getContent(true);
            $out = fopen($tmp, 'wb');
            $bytes = 0;
            try {
                while (! feof($input)) {
                    $chunk = fread($input, 65536);
                    abort_if($chunk === false, 400, 'Envio inválido.');
                    $bytes += strlen($chunk);
                    abort_if($bytes > $limit, 413, 'Arquivo muito grande.');
                    fwrite($out, $chunk);
                }
            } finally {
                fclose($out);
            }
            abort_unless($bytes > 0, 400, 'Arquivo vazio.');
            $saved = $media->store($purchase, $asset, $tmp, $mime);

            return $this->ok(['id' => $asset, 'kind' => $saved->kind]);
        } finally {
            if (is_file($tmp)) {
                unlink($tmp);
            }
        }
    }

    public function own(Request $request, Purchase $purchase, string $asset)
    {
        Gate::authorize('update', $purchase);

        return $this->download($purchase, $asset);
    }

    public function shared(Request $request, string $token, string $asset, PurchaseController $gifts)
    {
        return $this->download($gifts->sharedPurchase($token), $asset);
    }

    private function download(Purchase $purchase, string $asset)
    {
        $manifest = $purchase->manifest ?? [];
        $ids = array_merge($manifest['photos'] ?? [], $manifest['videos'] ?? [], array_filter([$manifest['music'] ?? null]));
        abort_unless(in_array($asset, $ids, true), 404);
        $file = $purchase->assets()->where('asset_id', $asset)->firstOrFail();
        $disk = Storage::disk($file->disk);
        if (config('filesystems.disks.'.$file->disk.'.driver') !== 'local') {
            return redirect()->away($disk->temporaryUrl($file->path, now()->addMinute(), ['ResponseContentType' => $file->mime, 'ResponseCacheControl' => 'private, no-store']))->header('Cache-Control', 'private, no-store');
        }
        $response = response()->file($disk->path($file->path), ['Content-Type' => $file->mime, 'Cache-Control' => 'private, no-store']);
        $response->setAutoEtag();

        return $response;
    }
}
