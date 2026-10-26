<?php

namespace Tests\Feature;

use App\Models\Purchase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class IntegrationSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_support_cannot_read_other_clients_gifts_through_alternate_routes(): void
    {
        $client = User::factory()->create();
        $purchase = Purchase::create(['id' => 'p_private_fixture', 'user_id' => $client->id, 'share_token' => str_repeat('e', 64), 'content' => ['tema' => 'namoro', 'para' => 'Fixture', 'titulo' => 'Private fixture'], 'manifest' => ['photos' => [], 'videos' => [], 'music' => null], 'price_cents' => 1990]);
        $support = User::factory()->create();
        $support->forceFill(['role' => 'admin', 'admin_level' => 'support'])->save();
        $this->actingAs($support)->getJson('/api/purchases/'.$purchase->id)->assertForbidden();
        $this->getJson('/api/admin/clients/'.$client->id)->assertOk()->assertJsonCount(0, 'data.purchases')->assertJsonCount(0, 'data.refunds')->assertDontSee($purchase->share_token)->assertDontSee('Private fixture');
        foreach (['owner', 'manager'] as $level) {
            $support->forceFill(['admin_level' => $level])->save();
            $this->getJson('/api/purchases/'.$purchase->id)->assertOk();
        }
        $support->forceFill(['admin_level' => 'support'])->save();
        $this->actingAs($client)->getJson('/api/purchases/'.$purchase->id)->assertOk();
    }

    public function test_missing_routes_and_models_have_generic_errors(): void
    {
        $this->getJson('/api/nonexistent-private-fixture')->assertNotFound()->assertJsonPath('error.message', 'Recurso não encontrado.')->assertDontSee('api/nonexistent');
        $this->actingAs(User::factory()->create())->getJson('/api/purchases/p_missing_fixture')->assertNotFound()->assertDontSee('App\\Models')->assertDontSee('p_missing_fixture');
    }

    public function test_public_reads_do_not_write_audit_events_and_sensitive_reads_do(): void
    {
        $this->getJson('/api/config')->assertOk();
        $this->assertDatabaseCount('audit_events', 0);
        $this->actingAs(User::factory()->create())->getJson('/api/privacy/export')->assertOk();
        $this->assertDatabaseHas('audit_events', ['action' => 'GET api/privacy/export']);
    }

    public function test_audit_failure_does_not_replace_a_successful_response_or_log_bindings(): void
    {
        Log::spy();
        Route::post('/api/audit-failure-fixture', fn () => response()->json(['ok' => true, 'data' => ['saved' => true]]));
        DB::listen(function ($query) {
            if (str_contains($query->sql, 'insert into') && str_contains($query->sql, 'audit_events')) {
                throw new \RuntimeException('private-sql-binding');
            }
        });
        $this->postJson('/api/audit-failure-fixture', ['fixture' => true])->assertOk()->assertJsonPath('data.saved', true);
        Log::shouldHaveReceived('warning')->once()->with('Registro de auditoria indisponível.');
    }

    public function test_api_does_not_allow_cross_origin_session_access(): void
    {
        $this->withHeader('Origin', 'https://untrusted.example.test')->getJson('/api/config')->assertOk()->assertHeaderMissing('Access-Control-Allow-Origin')->assertHeaderMissing('X-Powered-By');
    }

    public function test_predictable_passwords_are_rejected_without_changing_existing_login(): void
    {
        foreach (['password123', 'fixture@example.test', 'Fixture name'] as $password) {
            $this->travel(1)->minutes();
            $this->postJson('/api/auth/register', ['name' => 'Fixture name', 'email' => 'fixture@example.test', 'password' => $password])->assertUnprocessable();
        }
        $this->travel(1)->minutes();
        $this->postJson('/api/auth/register', ['name' => 'Fixture name', 'email' => 'fixture@example.test', 'password' => 'fixture-strong-secret'])->assertCreated()->assertJsonPath('data.user.role', 'user');
    }
}
