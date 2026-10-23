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

    protected function casts(): array
    {
        return ['content' => 'array', 'manifest' => 'array', 'paid_at' => 'datetime'];
    }

    public function assets()
    {
        return $this->hasMany(MediaAsset::class);
    }
}
