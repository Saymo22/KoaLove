<?php

namespace App\Http\Controllers;

use App\Models\MediaUpload;
use App\Models\Purchase;
use App\Services\GiftMedia;
use App\Services\MediaValidator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class CloudUploadController extends ApiController
{
    public function reserve(Request $request, Purchase $purchase, string $asset, PurchaseController $gifts)
    {
        Gate::authorize('update', $purchase);
        $gifts->editable($purchase, true);
        abort_unless(config('filesystems.default') === 's3', 409, 'Upload direto indisponível.');
        if (! config('filesystems.disks.s3.bucket') || ! config('filesystems.disks.s3.region')) {
            return response()->json(['ok' => false, 'error' => ['code' => 'MEDIA_UNAVAILABLE', 'message' => 'Armazenamento de mídia ainda não configurado.']], 503);
        }
        abort_unless(preg_match('/^[\w-]{16,100}$/', $asset), 422, 'Identificador inválido.');
        $data = $request->validate(['mime' => ['required', Rule::in(array_keys(MediaValidator::TYPES))], 'bytes' => 'required|integer|min:1|max:104857600']);
        $kind = MediaValidator::TYPES[$data['mime']];
        abort_if($data['bytes'] > MediaValidator::LIMITS[$kind], 413, 'Arquivo muito grande.');
        $result = DB::transaction(function () use ($purchase, $asset, $data, $gifts, $kind) {
            $p = Purchase::whereKey($purchase->id)->lockForUpdate()->firstOrFail();
            $gifts->editable($p, true);
            if ($old = $p->assets()->where('asset_id', $asset)->first()) {
                abort_unless($old->kind === $kind, 409, 'Identificador já utilizado.');

                return $old;
            }
            $pending = MediaUpload::where('purchase_id', $p->id)->where('bytes', '>', 0)->where('expires_at', '>', now());
            if ($same = (clone $pending)->where('asset_id', $asset)->first()) {
                abort_unless($same->mime === $data['mime'] && $same->bytes === $data['bytes'], 409, 'Arquivo diferente da reserva anterior.');

                return $same;
            }
            abort_if($p->assets()->count() + (clone $pending)->count() >= 80 || $p->assets()->sum('bytes') + (clone $pending)->sum('bytes') + $data['bytes'] > 314572800, 413, 'Limite de 300 MB atingido.');
            $id = (string) Str::uuid();
            $p->touch();

            return MediaUpload::create(['id' => $id, 'purchase_id' => $p->id, 'asset_id' => $asset, ...$data, 'disk' => 's3', 'path' => 'gifts/'.$p->id.'/incoming/'.$id, 'expires_at' => now()->addMinutes(20)]);
        });
        if (! $result instanceof MediaUpload) {
            return $this->ok(['complete' => true, 'id' => $asset, 'kind' => $result->kind]);
        }
        $signed = Storage::disk($result->disk)->temporaryUploadUrl($result->path, now()->addMinutes(5)->min($result->expires_at), ['ContentType' => $result->mime, 'ContentLength' => $result->bytes]);
        $headers = [];
        foreach ($signed['headers'] ?? [] as $key => $value) {
            if (! in_array(strtolower($key), ['host', 'content-length'], true)) {
                $headers[$key] = is_array($value) ? implode(',', $value) : $value;
            }
        }

        return $this->ok(['upload_id' => $result->id, 'url' => $signed['url'], 'headers' => $headers]);
    }

    public function complete(Request $request, Purchase $purchase, string $asset, PurchaseController $gifts, GiftMedia $media)
    {
        Gate::authorize('update', $purchase);
        $gifts->editable($purchase, true);
        $data = $request->validate(['upload_id' => 'required|uuid']);
        $upload = MediaUpload::whereKey($data['upload_id'])->where('purchase_id', $purchase->id)->where('asset_id', $asset)->where('expires_at', '>', now())->firstOrFail();
        if ($upload->bytes === 0) {
            $saved = $purchase->assets()->where('asset_id', $asset)->firstOrFail();

            return $this->ok(['id' => $asset, 'kind' => $saved->kind]);
        }
        $disk = Storage::disk($upload->disk);
        abort_unless($disk->size($upload->path) === $upload->bytes, 422, 'O tamanho enviado não corresponde à reserva.');
        $tmp = tempnam(sys_get_temp_dir(), 'na_cloud_');
        try {
            $input = $disk->readStream($upload->path);
            abort_unless(is_resource($input), 503, 'Não foi possível ler a mídia.');
            $output = fopen($tmp, 'wb');
            try {
                $bytes = stream_copy_to_stream($input, $output, $upload->bytes + 1);
            } finally {
                fclose($input);
                fclose($output);
            }
            abort_unless($bytes === $upload->bytes, 422, 'Mídia incompleta.');
            $saved = $media->store($purchase, $asset, $tmp, $upload->mime, $upload->id);
            $disk->delete($upload->path);
            // Preserve a cleanup record: a signed PUT can be replayed until its URL expires.
            // Zero bytes marks a completed reservation and releases its quota immediately.
            $upload->update(['bytes' => 0]);

            return $this->ok(['id' => $asset, 'kind' => $saved->kind]);
        } finally {
            if (is_file($tmp)) {
                unlink($tmp);
            }
        }
    }
}
