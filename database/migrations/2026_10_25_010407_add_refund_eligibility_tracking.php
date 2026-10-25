<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('purchases', function (Blueprint $table) {
            $table->timestampTz('first_shared_opened_at')->nullable();
            $table->timestampTz('share_tracking_started_at')->nullable();
        });
        // Registra quando passamos a observar acessos, sem inventar histórico anterior.
        DB::table('purchases')->update(['share_tracking_started_at' => now()]);
        Schema::table('refunds', function (Blueprint $table) {
            $table->string('request_kind', 20)->nullable();
            $table->json('eligibility_snapshot')->nullable();
            $table->index(['purchase_id', 'created_at'], 'refunds_purchase_created_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('refunds', function (Blueprint $table) {
            $table->dropIndex('refunds_purchase_created_idx');
            $table->dropColumn(['request_kind', 'eligibility_snapshot']);
        });
        Schema::table('purchases', fn (Blueprint $table) => $table->dropColumn(['first_shared_opened_at', 'share_tracking_started_at']));
    }
};
