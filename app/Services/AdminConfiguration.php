<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

class AdminConfiguration
{
    public function all(): array
    {
        $row = DB::table('admin_settings')->where('key', 'system')->value('value');

        return array_replace(['storeName' => 'KoaLove', 'supportEmail' => '', 'whatsapp' => '', 'pixKey' => '', 'refundDays' => 3, 'maintenance' => false, 'emailNotif' => false], $row ? json_decode($row, true) : []);
    }

    public function themes(): array
    {
        $row = DB::table('admin_settings')->where('key', 'themes')->value('value');
        $disabled = $row ? json_decode($row, true) : [];

        return array_filter(config('gift.themes'), fn ($theme, $key) => ! in_array($key, $disabled, true), ARRAY_FILTER_USE_BOTH);
    }

    public function put(string $key, array $value): void
    {
        DB::table('admin_settings')->upsert([['key' => $key, 'value' => json_encode($value), 'created_at' => now(), 'updated_at' => now()]], ['key'], ['value', 'updated_at']);
    }

    public function log(string $type, string $action, string|int|null $target = null): void
    {
        DB::table('admin_activities')->insert(['user_id' => auth()->id(), 'type' => $type, 'action' => $action, 'target' => $target, 'created_at' => now()]);
    }
}
