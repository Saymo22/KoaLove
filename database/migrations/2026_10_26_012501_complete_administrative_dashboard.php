<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $t) {
            $t->string('admin_level', 16)->nullable();
            $t->text('admin_note')->nullable();
            $t->json('admin_preferences')->nullable();
        });
        Schema::table('tickets', fn (Blueprint $t) => $t->string('priority', 10)->default('normal'));
        foreach (['plans', 'promotions', 'coupons'] as $name) {
            Schema::table($name, fn (Blueprint $t) => $t->softDeletesTz());
        }
        foreach (['promotions', 'coupons'] as $name) {
            Schema::table($name, function (Blueprint $t) {
                $t->unsignedInteger('discount_cents')->nullable();
            });
        }
        Schema::table('payment_checkouts', fn (Blueprint $t) => $t->string('rejection_reason', 300)->nullable());
        Schema::table('coupons', fn (Blueprint $t) => $t->unsignedInteger('usage_limit')->nullable());
        Schema::create('admin_settings', function (Blueprint $t) {
            $t->string('key', 60)->primary();
            $t->json('value');
            $t->timestamps();
        });
        DB::table('admin_settings')->insert([['key' => 'system', 'value' => '{}', 'created_at' => now(), 'updated_at' => now()], ['key' => 'themes', 'value' => '[]', 'created_at' => now(), 'updated_at' => now()]]);
        Schema::create('admin_activities', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $t->string('type', 24);
            $t->string('action', 100);
            $t->string('target', 100)->nullable();
            $t->timestampTz('created_at')->index();
            $t->softDeletesTz();
        });
        Schema::create('admin_invitations', function (Blueprint $t) {
            $t->uuid('id')->primary();
            $t->string('email', 254)->index();
            $t->string('level', 16);
            $t->foreignId('invited_by')->nullable()->constrained('users')->nullOnDelete();
            $t->timestampTz('expires_at');
            $t->timestampTz('accepted_at')->nullable();
            $t->timestampTz('revoked_at')->nullable();
            $t->timestamps();
        });
        if (DB::getDriverName() === 'pgsql' && config('database.connections.pgsql.search_path') === 'app_private') {
            foreach (['admin_settings', 'admin_activities', 'admin_invitations'] as $name) {
                DB::statement('ALTER TABLE app_private.'.$name.' ENABLE ROW LEVEL SECURITY');
                DB::statement('REVOKE ALL ON app_private.'.$name.' FROM anon, authenticated');
            }
        }
    }

    public function down(): void
    {
        Schema::table('payment_checkouts', fn (Blueprint $t) => $t->dropColumn('rejection_reason'));
        foreach (['admin_invitations', 'admin_activities', 'admin_settings'] as $name) {
            Schema::dropIfExists($name);
        }
        Schema::table('coupons', fn (Blueprint $t) => $t->dropColumn('usage_limit'));
        foreach (['promotions', 'coupons'] as $name) {
            Schema::table($name, fn (Blueprint $t) => $t->dropColumn('discount_cents'));
        }
        foreach (['plans', 'promotions', 'coupons'] as $name) {
            Schema::table($name, fn (Blueprint $t) => $t->dropSoftDeletes());
        }
        Schema::table('tickets', fn (Blueprint $t) => $t->dropColumn('priority'));
        Schema::table('users', fn (Blueprint $t) => $t->dropColumn(['admin_level', 'admin_note', 'admin_preferences']));
    }
};
