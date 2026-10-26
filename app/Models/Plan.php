<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Plan extends Model
{
    use SoftDeletes;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $guarded = [];

    protected function casts(): array
    {
        return ['features' => 'array', 'active' => 'boolean', 'featured' => 'boolean', 'price_cents' => 'integer'];
    }

    public function snapshot(): array
    {
        return $this->only(['id', 'name', 'description', 'features', 'photos_limit', 'videos_limit', 'music_limit']);
    }
}
