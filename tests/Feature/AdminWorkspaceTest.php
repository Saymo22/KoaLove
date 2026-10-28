<?php

namespace Tests\Feature;

use App\Models\Coupon;
use App\Models\PaymentCheckout;
use App\Models\Plan;
use App\Models\Purchase;
use App\Models\Ticket;
use App\Models\User;
use App\Services\AdminConfiguration;
use App\Services\Pricing;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Tests\TestCase;

class AdminWorkspaceTest extends TestCase
{
    use RefreshDatabase;

    private function admin(string $level = 'owner'): User
    {
        $user = User::factory()->create();
        $user->forceFill(['role' => 'admin', 'admin_level' => $level])->save();
        $this->actingAs($user);

        return $user;
    }

    public function test_workspace_is_private_and_uses_persisted_data(): void
    {
        $this->getJson('/api/admin/workspace')->assertUnauthorized();
        $client = User::factory()->create();
        $this->actingAs($client)->getJson('/api/admin/workspace')->assertForbidden();
        $admin = $this->admin();
        $this->getJson('/api/admin/workspace')->assertOk()->assertJsonPath('data.me.id', $admin->id)->assertJsonCount(13, 'data.themes')->assertJsonCount(1, 'data.clients')->assertJsonCount(0, 'data.ledger');
        $this->postJson('/api/admin/clients/'.$client->id.'/note', ['note' => 'Observação de teste'])->assertOk();
        $this->assertDatabaseHas('users', ['id' => $client->id, 'admin_note' => 'Observação de teste']);
        $this->assertDatabaseHas('admin_activities', ['type' => 'client', 'target' => (string) $client->id]);
    }

    public function test_permissions_are_checked_on_the_server(): void
    {
        $this->admin('support');
        $this->getJson('/api/admin/workspace')->assertOk()->assertJsonCount(0, 'data.plans');
        $this->postJson('/api/admin/settings', ['maintenance' => true])->assertForbidden();
        $this->postJson('/api/admin/settings', ['dark' => true])->assertOk();
        $this->postJson('/api/admin/themes/namoro', ['active' => false])->assertForbidden();
        $this->getJson('/api/admin/purchases')->assertForbidden();
        $this->postJson('/api/admin/administrators/invite', ['email' => 'fixture@example.test', 'level' => 'owner'])->assertForbidden();
        $this->admin('manager');
        $this->postJson('/api/admin/settings', ['maintenance' => true])->assertForbidden();
    }

    public function test_settings_themes_maintenance_and_idle_are_real(): void
    {
        $admin = $this->admin();
        $this->postJson('/api/admin/settings', ['storeName' => 'KoaLove', 'refundDays' => 5, 'idleMin' => 15])->assertOk();
        $this->postJson('/api/admin/themes/namoro', ['active' => false])->assertOk();
        $this->getJson('/api/config')->assertOk()->assertJsonMissingPath('data.themes.namoro');
        $this->postJson('/api/admin/themes/namoro', ['active' => true])->assertOk();
        $this->getJson('/api/config')->assertOk()->assertJsonStructure(['data' => ['themes' => ['namoro']]]);
        $this->postJson('/api/admin/settings', ['maintenance' => true])->assertOk();
        $client = User::factory()->create();
        $this->actingAs($client)->getJson('/api/config')->assertStatus(503);
        $this->actingAs($admin)->postJson('/api/admin/settings', ['maintenance' => false])->assertOk();
        $this->withSession(['admin_last_active' => time() - 3601])->getJson('/api/admin/workspace')->assertUnauthorized();
    }

    public function test_catalog_removal_preserves_history_and_fixed_discounts_apply(): void
    {
        $this->admin();
        $plan = Plan::first();
        $payload = ['plan_id' => $plan->id, 'name' => 'Desconto fixo', 'active' => true, 'discount_cents' => 500, 'starts_at' => now()->subHour()->toIso8601String(), 'ends_at' => now()->addDay()->toIso8601String()];
        $offer = $this->postJson('/api/admin/pricing/promotions', $payload)->assertOk()->json('data.offer.id');
        $quote = app(Pricing::class)->calculate(1990, $plan->id);
        $this->assertSame(1490, $quote['amount_cents']);
        $this->postJson('/api/admin/catalog/promotions/'.$offer.'/delete', ['confirmed' => true])->assertOk();
        $this->assertSoftDeleted('promotions', ['id' => $offer]);
        $this->assertSame(1990, app(Pricing::class)->calculate(1990, $plan->id)['amount_cents']);
        $this->postJson('/api/admin/catalog/plans/'.$plan->id.'/delete', ['confirmed' => true])->assertUnprocessable();
    }

    public function test_coupon_usage_limit_counts_reserved_checkouts_and_preserves_frozen_quote(): void
    {
        $this->admin();
        $plan = Plan::first();
        $coupon = Coupon::create(['id' => (string) Str::uuid(), 'code' => 'FIXED50', 'active' => true, 'discount_percent' => 0, 'discount_cents' => 500, 'usage_limit' => 1]);
        $purchase = Purchase::create(['id' => 'p_coupon_fixture', 'user_id' => auth()->id(), 'share_token' => bin2hex(random_bytes(32)), 'status' => 'pending', 'content' => [], 'manifest' => [], 'price_cents' => 1990]);
        PaymentCheckout::create(['id' => (string) Str::uuid(), 'purchase_id' => $purchase->id, 'method' => 'pix', 'amount_cents' => 1490, 'coupon' => $coupon->code, 'discount_percent' => 25, 'pricing_details' => ['discount_source' => 'coupon'], 'status' => 'new', 'live' => false]);
        $this->assertSame(1, app(Pricing::class)->couponUses($coupon->code));
        $this->assertSame(1490, app(Pricing::class)->quote($purchase, 'FIXED50')['amount_cents']);
        try {
            app(Pricing::class)->calculate(1990, $plan->id, 'FIXED50');
            $this->fail('Cupom esgotado aceito.');
        } catch (HttpException $e) {
            $this->assertSame(422, $e->getStatusCode());
        }
    }

    public function test_ticket_status_and_priority_are_saved_and_client_deletion_revokes_access(): void
    {
        $this->admin();
        $client = User::factory()->create();
        $ticket = Ticket::create(['id' => (string) Str::uuid(), 'user_id' => $client->id, 'subject' => 'Teste', 'status' => 'open', 'messages' => []]);
        $this->postJson('/api/admin/tickets/'.$ticket->id.'/manage', ['priority' => 'high', 'status' => 'closed'])->assertOk();
        $this->assertDatabaseHas('tickets', ['id' => $ticket->id, 'priority' => 'high', 'status' => 'closed']);
        $this->postJson('/api/admin/clients/'.$client->id.'/delete', ['confirmed' => true])->assertOk();
        $this->assertNotNull($client->fresh()->deletion_requested_at);
        $this->actingAs($client->fresh())->getJson('/api/purchases')->assertUnauthorized();
    }

    public function test_invitations_require_same_email_acceptance_and_cannot_elevate_other_accounts(): void
    {
        Mail::fake();
        $admin = $this->admin();
        $client = User::factory()->create();
        $this->postJson('/api/admin/administrators/invite', ['email' => $client->email, 'level' => 'support'])->assertOk();
        $i = DB::table('admin_invitations')->first();
        $this->assertSame('user', $client->fresh()->role);
        Mail::assertSentCount(1);
        $url = URL::temporarySignedRoute('admin.invitation', now()->addDay(), ['invitation' => $i->id]);
        Auth::logout();
        $this->get($url)->assertRedirect('/entrar');
        $this->actingAs($admin)->get($url)->assertForbidden();
        $this->actingAs($client)->get($url)->assertOk();
        $this->post('/admin/invitations/'.$i->id.'/accept', ['confirmed' => true])->assertRedirect('/admin/painel');
        $this->assertSame('support', $client->fresh()->admin_level);
        $this->post('/admin/invitations/'.$i->id.'/accept', ['confirmed' => true])->assertForbidden();
        $this->actingAs($admin)->postJson('/api/admin/administrators/'.$client->id.'/remove', ['confirmed' => true])->assertOk();
        $this->assertSame('user', $client->fresh()->role);
    }

    public function test_clearing_panel_history_does_not_delete_security_audit(): void
    {
        $this->admin();
        $this->postJson('/api/admin/settings', ['dark' => true])->assertOk();
        $before = DB::table('audit_events')->count();
        $this->postJson('/api/admin/activities/clear', ['confirmed' => true])->assertOk();
        $this->assertGreaterThanOrEqual($before, DB::table('audit_events')->count());
        $this->assertGreaterThan(0, DB::table('admin_activities')->whereNotNull('deleted_at')->count());
    }

    public function test_manual_pix_rejection_is_persisted_and_cannot_be_confirmed(): void
    {
        $admin = $this->admin();
        $purchase = Purchase::create(['id' => 'p_manual_review_fixture', 'user_id' => $admin->id, 'share_token' => bin2hex(random_bytes(32)), 'status' => 'pending', 'content' => [], 'manifest' => [], 'price_cents' => 1990]);
        PaymentCheckout::create(['id' => (string) Str::uuid(), 'purchase_id' => $purchase->id, 'provider' => 'pix_manual', 'method' => 'pix', 'amount_cents' => 1990, 'status' => 'awaiting_confirmation', 'live' => false]);
        $this->postJson('/api/admin/purchases/'.$purchase->id.'/reject-pix', ['reason' => 'Não localizado no extrato de teste.'])->assertOk();
        $this->assertDatabaseHas('payment_checkouts', ['purchase_id' => $purchase->id, 'status' => 'rejected', 'rejection_reason' => 'Não localizado no extrato de teste.']);
        $this->postJson('/api/admin/purchases/'.$purchase->id.'/confirm-pix', ['amount_cents' => 1990, 'bank_reference' => 'TEST-REFERENCE-001', 'received' => true])->assertConflict();
        $this->assertSame('pending', $purchase->fresh()->status);
    }

    public function test_alert_summary_is_sent_at_most_once_per_day(): void
    {
        $this->admin();
        app(AdminConfiguration::class)->put('system', ['emailNotif' => true, 'supportEmail' => 'alerts@example.test']);
        Ticket::create(['id' => (string) Str::uuid(), 'user_id' => auth()->id(), 'subject' => 'Atendimento de teste', 'messages' => [], 'status' => 'open']);
        Mail::shouldReceive('raw')->once()->andReturnNull();
        $this->artisan('admin:alerts')->assertExitCode(0);
        $this->artisan('admin:alerts')->assertExitCode(0);
        $this->assertDatabaseHas('admin_settings', ['key' => 'last_alert']);
    }
}
