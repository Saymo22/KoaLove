<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('media_assets', fn (Blueprint $table) => $table->string('disk')->default('local'));
        Schema::create('media_uploads', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('purchase_id');
            $table->foreign('purchase_id')->references('id')->on('purchases')->cascadeOnDelete();
            $table->string('asset_id', 100);
            $table->string('mime');
            $table->unsignedBigInteger('bytes');
            $table->string('disk');
            $table->string('path');
            $table->timestamp('expires_at')->index();
            $table->timestamps();
            $table->index(['purchase_id', 'asset_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('media_uploads');
        Schema::table('media_assets', fn (Blueprint $table) => $table->dropColumn('disk'));
    }
};
