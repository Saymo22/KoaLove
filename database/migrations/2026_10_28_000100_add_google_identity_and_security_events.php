<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('google_sub')->nullable()->unique();
            $table->string('google_avatar_url', 2048)->nullable();
            $table->timestamp('google_signin_disabled_at')->nullable()->index();
            $table->timestamp('google_security_event_at')->nullable();
            $table->unsignedInteger('google_session_version')->default(0);
        });

        Schema::create('google_security_events', function (Blueprint $table) {
            $table->string('event_id')->primary();
            $table->timestamp('received_at')->index();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('google_security_events');
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['google_sub']);
            $table->dropIndex(['google_signin_disabled_at']);
            $table->dropColumn(['google_sub', 'google_avatar_url', 'google_signin_disabled_at', 'google_security_event_at', 'google_session_version']);
        });
    }
};
