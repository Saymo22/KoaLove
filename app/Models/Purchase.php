<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Purchase extends Model
{
    use SoftDeletes;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $guarded = [];

    protected static function booted(): void
    {
        static::creating(function (Purchase $purchase) {
            $purchase->share_tracking_started_at ??= now();
        });
    }

    protected function casts(): array
    {
        return ['content' => 'array', 'manifest' => 'array', 'plan_snapshot' => 'array', 'paid_at' => 'datetime', 'first_shared_opened_at' => 'immutable_datetime', 'share_tracking_started_at' => 'immutable_datetime'];
    }

    public function assets()
    {
        return $this->hasMany(MediaAsset::class);
    }
}
