<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('user')->index();
        });
        Schema::create('purchases', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('client_request_id', 100)->nullable();
            $table->string('share_token', 64)->unique();
            $table->string('status')->default('pending')->index();
            $table->json('content');
            $table->json('manifest')->nullable();
            $table->unsignedInteger('content_version')->default(0);
            $table->unsignedInteger('price_cents');
            $table->unsignedInteger('amount_paid_cents')->nullable();
            $table->string('coupon')->nullable();
            $table->unsignedSmallInteger('discount_percent')->default(0);
            $table->string('payment_method')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->unique(['user_id', 'client_request_id']);
        });
        Schema::create('media_assets', function (Blueprint $table) {
            $table->id();
            $table->string('purchase_id');
            $table->foreign('purchase_id')->references('id')->on('purchases')->cascadeOnDelete();
            $table->string('asset_id', 100);
            $table->string('kind');
            $table->string('mime');
            $table->unsignedBigInteger('bytes');
            $table->string('path');
            $table->timestamps();
            $table->unique(['purchase_id', 'asset_id']);
        });
        Schema::create('refunds', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('purchase_id');
            $table->foreign('purchase_id')->references('id')->on('purchases')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('status')->default('pending');
            $table->text('reason')->nullable();
            $table->text('review_note')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();
        });
        Schema::create('tickets', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('subject');
            $table->string('status')->default('open');
            $table->json('messages');
            $table->timestamps();
        });
        Schema::create('audit_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('action');
            $table->string('ip_hash', 64);
            $table->unsignedSmallInteger('status');
            $table->timestamp('created_at')->index();
        });
    }

    public function down(): void
    {
        foreach (['audit_events', 'tickets', 'refunds', 'media_assets', 'purchases'] as $table) {
            Schema::dropIfExists($table);
        }
        Schema::table('users', fn (Blueprint $table) => $table->dropColumn('role'));
    }
};
