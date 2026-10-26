<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class Refund extends Model
{
    public $incrementing = false;

    protected $keyType = 'string';

    protected $guarded = [];

    public function scopeLatestForPurchase(Builder $query, string $id): Builder
    {
        return $query->where('purchase_id', $id)->orderByRaw("CASE WHEN request_kind = 'legal_review' THEN 0 ELSE 1 END")->latest('created_at')->orderByDesc('id');
    }

    protected function casts(): array
    {
        return ['reviewed_at' => 'datetime', 'eligibility_snapshot' => 'array'];
    }
}
