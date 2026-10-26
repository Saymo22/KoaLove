<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_checkouts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('purchase_id')->unique();
            $table->foreign('purchase_id')->references('id')->on('purchases')->cascadeOnDelete();
            $table->string('method', 10);
            $table->string('provider', 30)->default('mercadopago');
            $table->json('pix_details')->nullable();
            $table->string('bank_reference', 64)->nullable()->unique();
            $table->foreignId('confirmed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->index('confirmed_by');
            $table->timestamp('confirmed_at')->nullable();
            $table->unsignedInteger('amount_cents');
            $table->string('coupon', 20)->nullable();
            $table->unsignedSmallInteger('discount_percent')->default(0);
            $table->boolean('live');
            $table->string('status', 30)->default('new');
            $table->string('preference_id')->nullable()->unique();
            $table->text('checkout_url')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->string('paid_payment_id', 40)->nullable()->unique();
            $table->timestamps();
        });
        Schema::create('payment_receipts', function (Blueprint $table) {
            $table->string('id', 40)->primary();
            $table->foreignUuid('checkout_id')->constrained('payment_checkouts')->cascadeOnDelete();
            $table->index('checkout_id');
            $table->string('status', 30);
            $table->unsignedInteger('amount_cents');
            $table->unsignedInteger('refunded_cents')->default(0);
            $table->timestamps();
        });
        if (DB::getDriverName() === 'pgsql' && config('database.connections.pgsql.search_path') === 'app_private') {
            // The backend owns these tables; no browser/API role receives a policy.
            DB::statement('ALTER TABLE app_private.payment_checkouts ENABLE ROW LEVEL SECURITY');
            DB::statement('ALTER TABLE app_private.payment_receipts ENABLE ROW LEVEL SECURITY');
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_receipts');
        Schema::dropIfExists('payment_checkouts');
    }
};
