<?php

namespace App\Http\Controllers;

use App\Models\Purchase;
use App\Services\MediaValidator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MediaController extends ApiController
{
    public function upload(Request $request, Purchase $purchase, string $asset, MediaValidator $validator, PurchaseController $gifts)
    {
        Gate::authorize('update', $purchase);
        $gifts->editable($purchase, true);
        abort_unless(preg_match('/^[\w-]{16,100}$/', $asset), 422, 'Identificador inválido.');
        $mime = strtolower(explode(';', $request->header('Content-Type', ''))[0]);
        $kind = MediaValidator::TYPES[$mime] ?? null;
        abort_unless($kind, 415, 'Formato não suportado.');
        $limit = MediaValidator::LIMITS[$kind];
        abort_if((int) $request->header('Content-Length') > $limit, 413, 'Arquivo muito grande.');
        $tmp = tempnam(sys_get_temp_dir(), 'na_');
        $path = null;
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
            $verified = $validator->validate($tmp, $mime);
            $path = 'gifts/'.$purchase->id.'/'.Str::uuid();
            abort_unless(Storage::disk('local')->put($path, fopen($tmp, 'rb')), 503, 'Não foi possível armazenar a mídia.');
            $result = DB::transaction(function () use ($purchase, $asset, $verified, $path, $gifts) {
                $p = Purchase::whereKey($purchase->id)->lockForUpdate()->firstOrFail();
                $gifts->editable($p, true);
                if ($old = $p->assets()->where('asset_id', $asset)->first()) {
                    abort_unless($old->kind === $verified['kind'], 409, 'Identificador já usado por outro tipo de mídia.');

                    return $old;
                }
                abort_if($p->assets()->count() >= 80 || $p->assets()->sum('bytes') + $verified['bytes'] > 314572800, 413, 'Limite de 300 MB atingido.');
                $p->touch();

                return $p->assets()->create(['asset_id' => $asset, ...$verified, 'path' => $path]);
            });
            if ($result->path !== $path) {
                Storage::disk('local')->delete($path);
            }$path = null;

            return $this->ok(['id' => $asset, 'kind' => $result->kind]);
        } finally {
            if (is_file($tmp)) {
                unlink($tmp);
            }if ($path) {
                Storage::disk('local')->delete($path);
            }
        }
    }

    public function own(Request $request, Purchase $purchase, string $asset)
    {
        Gate::authorize('update', $purchase);

        return $this->download($request, $purchase, $asset);
    }

    public function shared(Request $request, string $token, string $asset, PurchaseController $gifts)
    {
        return $this->download($request, $gifts->sharedPurchase($token), $asset);
    }

    private function download(Request $request, Purchase $purchase, string $asset)
    {
        $manifest = $purchase->manifest ?? [];
        $ids = array_merge($manifest['photos'] ?? [], $manifest['videos'] ?? [], array_filter([$manifest['music'] ?? null]));
        abort_unless(in_array($asset, $ids, true), 404);
        $file = $purchase->assets()->where('asset_id', $asset)->firstOrFail();
        $response = response()->file(Storage::disk('local')->path($file->path), ['Content-Type' => $file->mime, 'Cache-Control' => 'private, no-store']);
        $response->setAutoEtag();

        return $response;
    }
}
