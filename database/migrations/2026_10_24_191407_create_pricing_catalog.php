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
        Schema::create('plans', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name', 60);
            $table->string('description', 240)->default('');
            $table->unsignedInteger('price_cents');
            $table->json('features');
            $table->unsignedSmallInteger('photos_limit')->default(12);
            $table->unsignedSmallInteger('videos_limit')->default(4);
            $table->unsignedSmallInteger('music_limit')->default(1);
            $table->boolean('active')->default(true);
            $table->boolean('featured')->default(false);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
        });
        foreach (['promotions', 'coupons'] as $name) {
            Schema::create($name, function (Blueprint $table) use ($name) {
                $table->uuid('id')->primary();
                $table->foreignUuid('plan_id')->nullable()->constrained('plans')->restrictOnDelete();
                $table->index('plan_id');
                $table->string($name === 'coupons' ? 'code' : 'name', $name === 'coupons' ? 20 : 80)->unique();
                $table->unsignedSmallInteger('discount_percent');
                $table->boolean('active')->default(true);
                $table->timestampTz('starts_at')->nullable();
                $table->timestampTz('ends_at')->nullable();
                $table->timestamps();
            });
        }
        Schema::table('purchases', function (Blueprint $table) {
            $table->foreignUuid('plan_id')->nullable()->constrained('plans')->restrictOnDelete();
            $table->index('plan_id');
            $table->json('plan_snapshot')->nullable();
        });
        Schema::table('payment_checkouts', fn (Blueprint $table) => $table->json('pricing_details')->nullable());
        DB::table('plans')->insert([
            'id' => '00000000-0000-4000-8000-000000000001', 'name' => 'Presente completo',
            'description' => 'Sua história com todos os temas disponíveis.', 'price_cents' => config('gift.price_cents', 1990),
            'features' => json_encode(['Todos os temas disponíveis (clássicos e especiais)', 'Linha do tempo, carta e contador personalizados', 'Link para compartilhar e QR Code para imprimir', 'Suporte humano por WhatsApp']),
            'photos_limit' => 12, 'videos_limit' => 4, 'music_limit' => 1, 'active' => true, 'featured' => true,
            'sort_order' => 0, 'created_at' => now(), 'updated_at' => now(),
        ]);
        if (DB::getDriverName() === 'pgsql' && config('database.connections.pgsql.search_path') === 'app_private') {
            foreach (['plans', 'promotions', 'coupons'] as $table) {
                DB::statement('ALTER TABLE app_private.'.$table.' ENABLE ROW LEVEL SECURITY');
                DB::statement('REVOKE ALL ON app_private.'.$table.' FROM anon, authenticated');
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payment_checkouts', fn (Blueprint $table) => $table->dropColumn('pricing_details'));
        Schema::table('purchases', function (Blueprint $table) {
            $table->dropConstrainedForeignId('plan_id');
            $table->dropColumn('plan_snapshot');
        });
        Schema::dropIfExists('coupons');
        Schema::dropIfExists('promotions');
        Schema::dropIfExists('plans');
    }
};
