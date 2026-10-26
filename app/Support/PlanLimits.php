<?php

namespace App\Support;

use App\Models\MediaUpload;
use App\Models\Purchase;
use App\Services\MediaValidator;
use InvalidArgumentException;

/**
 * Fonte única dos limites de mídia por plano.
 *
 * MIN/MAX são os limites aceitos no cadastro de planos; DEFAULTS é o que vale
 * para compras sem plan_snapshot (legado) e para chaves ausentes/inválidas.
 */
class PlanLimits
{
    public const MIN = ['photos' => 1, 'videos' => 0, 'music' => 0];

    public const MAX = ['photos' => 12, 'videos' => 4, 'music' => 1];

    public const DEFAULTS = ['photos_limit' => 12, 'videos_limit' => 4, 'music_limit' => 1];

    private const KINDS = ['photos' => 'photo', 'videos' => 'video', 'music' => 'music'];

    public static function caps(): array
    {
        return ['min' => self::MIN, 'max' => self::MAX, 'defaults' => self::DEFAULTS];
    }

    public static function limitKey(string $kind): string
    {
        return self::plural($kind).'_limit';
    }

    /**
     * Normaliza um snapshot (ou a ausência dele) para limites pluralizados e válidos.
     *
     * @return array{photos:int, videos:int, music:int}
     */
    public static function fromSnapshot(?array $snapshot): array
    {
        $limits = [];
        foreach (self::KINDS as $plural => $kind) {
            $default = self::DEFAULTS[self::limitKey($kind)];
            $value = $snapshot[self::limitKey($kind)] ?? null;
            $value = is_numeric($value) ? (int) $value : $default;
            $limits[$plural] = max(self::MIN[$plural], min(self::MAX[$plural], $value));
        }

        return $limits;
    }

    public static function forPurchase(Purchase $purchase): array
    {
        return self::fromSnapshot($purchase->plan_snapshot);
    }

    public static function allowed(array $limits, string $kind): int
    {
        $plural = self::plural($kind);

        return max(0, (int) ($limits[$plural] ?? self::DEFAULTS[self::limitKey($kind)]));
    }

    /**
     * Rejeita um manifesto (fotos/vídeos/música) acima do limite do plano.
     */
    public static function assertManifest(array $limits, array $manifest, ?string $planName = null): void
    {
        $photos = is_array($manifest['photos'] ?? null) ? $manifest['photos'] : [];
        $videos = is_array($manifest['videos'] ?? null) ? $manifest['videos'] : [];
        $counts = [
            'photo' => count($photos),
            'video' => count($videos),
            'music' => empty($manifest['music']) ? 0 : 1,
        ];
        foreach ($counts as $kind => $count) {
            abort_if($count > self::allowed($limits, $kind), 422, self::manifestMessage($limits, $planName));
        }
    }

    /**
     * Bloqueia novos arquivos além da cota do plano sem impedir substituições.
     *
     * Conta apenas assets do tipo que ainda não fazem parte do manifesto atual,
     * mais reservas de upload direto pendentes, ignorando o asset/reserva em
     * retentativa. Assim um rascunho no limite continua podendo trocar mídias.
     */
    public static function assertUploadAllowed(Purchase $purchase, string $kind, ?string $retryAsset = null, ?string $retryUploadId = null, bool $countPending = true): void
    {
        $allowed = self::allowed(self::forPurchase($purchase), $kind);
        $manifestIds = self::manifestIds($purchase->manifest ?? [], $kind);

        $assets = $purchase->assets()->where('kind', self::kind($kind));
        if ($manifestIds !== []) {
            $assets->whereNotIn('asset_id', $manifestIds);
        }
        if ($retryAsset !== null) {
            $assets->where('asset_id', '!=', $retryAsset);
        }

        $new = $assets->count();
        if ($countPending) {
            $mimes = array_keys(array_filter(MediaValidator::TYPES, fn ($type) => $type === self::kind($kind)));
            $pending = MediaUpload::where('purchase_id', $purchase->id)->whereIn('mime', $mimes)->where('bytes', '>', 0)->where('expires_at', '>', now());
            // A completion can persist an asset before clearing its reservation.
            $pending->whereNotIn('asset_id', $purchase->assets()->getQuery()->select('asset_id'));
            if ($manifestIds !== []) {
                $pending->whereNotIn('asset_id', $manifestIds);
            }
            if ($retryAsset !== null) {
                $pending->where('asset_id', '!=', $retryAsset);
            }
            if ($retryUploadId !== null) {
                $pending->where('id', '!=', $retryUploadId);
            }
            $new += $pending->count();
        }

        abort_if($new >= $allowed, 422, self::uploadMessage($allowed, $kind, $purchase->plan_snapshot['name'] ?? null));
    }

    /**
     * @return list<string>
     */
    private static function manifestIds(array $manifest, string $kind): array
    {
        $items = match (self::kind($kind)) {
            'photo' => $manifest['photos'] ?? [],
            'video' => $manifest['videos'] ?? [],
            'music' => [$manifest['music'] ?? null],
        };

        return array_values(array_filter(is_array($items) ? $items : [], 'is_string'));
    }

    private static function kind(string $kind): string
    {
        return match ($kind) {
            'photo', 'photos' => 'photo',
            'video', 'videos' => 'video',
            'music' => 'music',
            default => throw new InvalidArgumentException('Tipo de mídia desconhecido: '.$kind.'.'),
        };
    }

    private static function plural(string $kind): string
    {
        return match (self::kind($kind)) {
            'photo' => 'photos',
            'video' => 'videos',
            'music' => 'music',
        };
    }

    private static function noun(string $kind, int $count): string
    {
        return match (self::kind($kind)) {
            'photo' => $count === 1 ? 'foto' : 'fotos',
            'video' => $count === 1 ? 'vídeo' : 'vídeos',
            'music' => $count === 1 ? 'música' : 'músicas',
        };
    }

    private static function describe(array $limits): string
    {
        return sprintf(
            '%d %s, %d %s e %d %s',
            $limits['photos'], self::noun('photo', $limits['photos']),
            $limits['videos'], self::noun('video', $limits['videos']),
            $limits['music'], self::noun('music', $limits['music']),
        );
    }

    private static function manifestMessage(array $limits, ?string $planName): string
    {
        $plan = $planName ? 'do plano '.$planName : 'do plano escolhido';

        return 'As mídias ultrapassam os limites '.$plan.': até '.self::describe($limits).'.';
    }

    private static function uploadMessage(int $allowed, string $kind, ?string $planName): string
    {
        $plan = $planName ? 'do plano '.$planName : 'do plano escolhido';

        return 'O limite '.$plan.' é de '.$allowed.' '.self::noun($kind, $allowed).'. Remova uma mídia da seleção ou substitua uma existente antes de enviar.';
    }
}
