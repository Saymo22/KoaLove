<?php

namespace Tests\Feature;

use App\Models\PaymentCheckout;
use App\Models\Purchase;
use App\Models\Refund;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class ManualPixTest extends TestCase
{
    use RefreshDatabase;

    private function ready(string $id = 'p_manual_pix'): Purchase
    {
        config(['payments.driver' => 'pix_manual', 'payments.enabled' => true,
            'payments.pix.key' => 'fixture@example.test', 'payments.pix.name' => 'Recebedor Teste', 'payments.pix.city' => 'São Paulo']);
        Http::preventStrayRequests();
        $user = User::factory()->create();
        $this->actingAs($user);

        return Purchase::create(['id' => $id, 'user_id' => $user->id, 'share_token' => hash('sha256', $id), 'status' => 'pending', 'content_version' => 1,
            'content' => ['tema' => 'namoro'], 'manifest' => ['photos' => ['fixture-photo'], 'videos' => [], 'music' => null], 'price_cents' => 1990]);
    }

    private function start(Purchase $p, array $extra = [])
    {
        return $this->postJson('/api/purchases/'.$p->id.'/pay', array_replace(['metodo' => 'pix'], $extra));
    }

    private function confirm(Purchase $p, array $extra = [])
    {
        return $this->postJson('/api/admin/purchases/'.$p->id.'/confirm-pix', array_replace(['amount_cents' => 1990, 'bank_reference' => 'E00000000202610230000synthetic001', 'received' => true], $extra));
    }

    public function test_generates_stable_pix_without_releasing_or_exposing_it_to_guests(): void
    {
        $p = $this->ready();
        $response = $this->start($p, ['amount_cents' => 1, 'status' => 'paid'])->assertOk()->assertJsonPath('data.purchase.status', 'pending')->assertJsonPath('data.checkout.amount_cents', 1990);
        $pix = $response->json('data.checkout.pix');
        $this->assertSame('SAO PAULO', $pix['city']);
        $this->assertStringContainsString('540519.90', $pix['payload']);
        $this->assertMatchesRegularExpression('/\A[A-Za-z0-9]{1,25}\z/', $pix['txid']);
        $this->start($p)->assertJsonPath('data.checkout.pix.payload', $pix['payload']);
        $this->assertDatabaseCount('payment_checkouts', 1);
        $this->getJson('/api/shared/'.$p->share_token)->assertNotFound();
        $this->getJson('/api/config')->assertJsonPath('data.payments.provider', 'pix_manual')->assertJsonMissingPath('data.payments.key');
        $this->postJson('/api/purchases/'.$p->id.'/update', ['tema' => 'namoro', 'para' => 'Fixture', 'media' => ['photos' => ['fixture-photo'], 'videos' => [], 'music' => null]])->assertStatus(409);
        Http::assertNothingSent();
    }

    public function test_only_admin_can_confirm_exact_received_amount_and_retries_are_idempotent(): void
    {
        $p = $this->ready();
        $this->start($p)->assertOk();
        $this->confirm($p)->assertForbidden();
        $this->actingAs(User::factory()->create(['role' => 'admin']));
        $this->confirm($p, ['received' => false])->assertUnprocessable();
        $this->confirm($p, ['amount_cents' => 1])->assertUnprocessable();
        $this->confirm($p)->assertOk();
        $at = $p->fresh()->paid_at->toISOString();
        $this->confirm($p)->assertOk();
        $this->assertSame($at, $p->fresh()->paid_at->toISOString());
        $this->assertNotNull(PaymentCheckout::firstOrFail()->confirmed_by);
        $this->getJson('/api/shared/'.$p->share_token)->assertOk()->assertJsonMissingPath('data.purchase.checkout');
        $this->confirm($p, ['bank_reference' => 'another-bank-reference'])->assertConflict();
    }

    public function test_same_bank_transaction_cannot_pay_two_gifts(): void
    {
        $first = $this->ready();
        $this->start($first)->assertOk();
        $second = $this->ready('p_manual_second');
        $this->start($second)->assertOk();
        $this->actingAs(User::factory()->create(['role' => 'admin']));
        $this->confirm($first)->assertOk();
        $this->confirm($second)->assertConflict();
        $this->assertSame('pending', $second->fresh()->status);
    }

    public function test_card_missing_configuration_and_other_owner_are_rejected(): void
    {
        $p = $this->ready();
        $this->start($p, ['metodo' => 'card'])->assertUnprocessable();
        config(['payments.pix.key' => '']);
        $this->start($p)->assertStatus(503);
        $this->assertDatabaseCount('payment_checkouts', 0);
        $this->actingAs(User::factory()->create());
        $this->start($p)->assertForbidden();
    }

    public function test_deleted_gifts_and_disabled_accounts_are_never_reactivated(): void
    {
        $p = $this->ready();
        $this->start($p)->assertOk();
        $admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin);
        User::findOrFail($p->user_id)->forceFill(['deletion_requested_at' => now()])->save();
        $this->confirm($p)->assertConflict();
        $p->delete();
        $this->confirm($p)->assertNotFound();
        $this->assertSame('pending', $p->fresh()->status);
    }

    public function test_refund_requires_bank_return_acknowledgement_and_revokes_access(): void
    {
        $p = $this->ready();
        $this->start($p)->assertOk();
        $this->actingAs(User::factory()->create(['role' => 'admin']));
        $this->confirm($p)->assertOk();
        $refund = Refund::create(['id' => 'r_manual_fixture', 'purchase_id' => $p->id, 'user_id' => $p->user_id, 'reason' => 'Solicitação sintética', 'status' => 'pending']);
        $url = '/api/admin/refunds/'.$refund->id.'/decision';
        $this->postJson($url, ['status' => 'approved'])->assertUnprocessable();
        $this->assertSame('paid', $p->fresh()->status);
        $this->postJson($url, ['status' => 'approved', 'refund_sent' => true])->assertOk();
        $this->assertSame('refunded', $p->fresh()->status);
        $this->getJson('/api/shared/'.$p->share_token)->assertNotFound();
        $this->confirm($p)->assertConflict();
    }
}
