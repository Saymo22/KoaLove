<?php

namespace Tests\Feature;

use App\Http\Controllers\PurchaseController;
use App\Models\Purchase;
use App\Models\Refund;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class RefundRequestTest extends TestCase
{
    use RefreshDatabase;

    private function paid(): Purchase
    {
        $owner = User::factory()->create();
        $this->actingAs($owner);

        return Purchase::create(['id' => 'p_'.Str::random(20), 'user_id' => $owner->id, 'share_token' => bin2hex(random_bytes(32)), 'status' => 'paid', 'content' => ['tema' => 'namoro', 'titulo' => 'Presente de teste'], 'price_cents' => 1990, 'amount_paid_cents' => 1990, 'paid_at' => now(), 'manifest' => ['photos' => [], 'videos' => [], 'music' => null]]);
    }

    public function test_owner_requests_review_without_changing_payment_and_admin_receives_it(): void
    {
        $p = $this->paid();
        $response = $this->postJson('/api/purchases/'.$p->id.'/refund', ['reason' => 'Quero solicitar a análise do reembolso.', 'status' => 'approved', 'user_id' => 999, 'amount_cents' => 1])->assertOk()->assertJsonPath('data.refund.status', 'pending');
        $id = $response->json('data.refund.id');
        $this->assertDatabaseHas('refunds', ['id' => $id, 'purchase_id' => $p->id, 'user_id' => $p->user_id, 'status' => 'pending']);
        $this->assertDatabaseHas('purchases', ['id' => $p->id, 'status' => 'paid', 'amount_paid_cents' => 1990]);
        $this->getJson('/api/purchases')->assertOk()->assertJsonPath('data.purchases.0.refund.status', 'pending');
        $admin = User::factory()->create();
        $admin->forceFill(['role' => 'admin'])->save();
        $this->actingAs($admin)->getJson('/api/admin/refunds')->assertOk()->assertJsonPath('data.refunds.0.id', $id)->assertJsonPath('data.refunds.0.reason', 'Quero solicitar a análise do reembolso.');
    }

    public function test_request_is_idempotent_and_does_not_overwrite_an_existing_decision(): void
    {
        $p = $this->paid();
        $id = $this->postJson('/api/purchases/'.$p->id.'/refund', ['reason' => 'Primeiro motivo de teste.'])->assertOk()->json('data.refund.id');
        $this->postJson('/api/purchases/'.$p->id.'/refund', ['reason' => 'Outro motivo de teste.'])->assertOk()->assertJsonPath('data.refund.id', $id);
        Refund::findOrFail($id)->update(['status' => 'rejected', 'review_note' => 'Nota interna do administrador.']);
        $this->postJson('/api/purchases/'.$p->id.'/refund', ['reason' => 'Nova tentativa de teste.'])->assertOk()->assertJsonPath('data.refund.status', 'rejected')->assertJsonMissingPath('data.refund.review_note');
        $this->assertDatabaseCount('refunds', 1);
        $this->assertDatabaseHas('refunds', ['id' => $id, 'reason' => 'Primeiro motivo de teste.', 'status' => 'rejected']);
        $public = app(PurchaseController::class)->project($p, true);
        $this->assertArrayNotHasKey('refund', $public);
    }

    public function test_guests_other_customers_and_other_admins_cannot_request_for_the_owner(): void
    {
        $p = $this->paid();
        auth()->forgetGuards();
        $this->postJson('/api/purchases/'.$p->id.'/refund', ['reason' => 'Solicitação de teste.'])->assertUnauthorized();
        $other = User::factory()->create();
        $this->actingAs($other)->postJson('/api/purchases/'.$p->id.'/refund', ['reason' => 'Solicitação de teste.'])->assertForbidden();
        $other->forceFill(['role' => 'admin'])->save();
        $this->actingAs($other)->postJson('/api/purchases/'.$p->id.'/refund', ['reason' => 'Solicitação de teste.'])->assertForbidden();
        $this->assertDatabaseCount('refunds', 0);
    }

    public function test_invalid_reasons_and_unpaid_refunded_or_deleted_purchases_are_rejected(): void
    {
        $p = $this->paid();
        foreach (['', '    ', 'abcd', str_repeat('x', 1001), ['invalid']] as $reason) {
            $this->postJson('/api/purchases/'.$p->id.'/refund', ['reason' => $reason])->assertUnprocessable();
        }
        foreach (['pending', 'refunded'] as $status) {
            $p->update(['status' => $status]);
            $this->postJson('/api/purchases/'.$p->id.'/refund', ['reason' => 'Solicitação de teste.'])->assertConflict();
        }
        $p->update(['status' => 'paid']);
        $p->delete();
        $this->postJson('/api/purchases/'.$p->id.'/refund', ['reason' => 'Solicitação de teste.'])->assertNotFound();
        $this->assertDatabaseCount('refunds', 0);
    }

    public function test_commercial_window_expires_at_exactly_72_hours_but_legal_review_remains_available(): void
    {
        $this->travelTo(now()->startOfSecond());
        $p = $this->paid();
        $this->travel(72 * 3600 - 1)->seconds();
        $this->getJson('/api/purchases/'.$p->id)->assertOk()->assertJsonPath('data.purchase.refund_eligibility.eligible', true);
        $this->travel(1)->seconds();
        $this->getJson('/api/purchases/'.$p->id)->assertOk()->assertJsonPath('data.purchase.refund_eligibility.reason', 'expired');
        $this->postJson('/api/purchases/'.$p->id.'/refund', ['reason' => 'Teste fora do prazo comercial.'])->assertConflict();
        $this->postJson('/api/purchases/'.$p->id.'/refund', ['reason' => 'Solicito análise dos direitos legais.', 'request_kind' => 'legal_review'])->assertOk()->assertJsonPath('data.refund.request_kind', 'legal_review');
        $this->assertDatabaseHas('purchases', ['id' => $p->id, 'status' => 'paid']);
    }

    public function test_first_public_open_blocks_commercial_requests_and_is_immutable_without_public_leaks(): void
    {
        $this->travelTo(now()->startOfSecond());
        $p = $this->paid();
        $p->update(['content_version' => 1]);
        $this->getJson('/api/purchases/'.$p->id)->assertOk()->assertJsonPath('data.purchase.refund_eligibility.eligible', true);
        $this->head('/api/shared/'.$p->share_token)->assertOk();
        $this->assertNull($p->fresh()->first_shared_opened_at);
        $this->get('/ver.html?demo=1&tema=namoro')->assertOk();
        $this->assertNull($p->fresh()->first_shared_opened_at);
        $this->travel(10)->seconds();
        $response = $this->getJson('/api/shared/'.$p->share_token)->assertOk()->assertJsonMissingPath('data.purchase.refund_eligibility')->assertJsonMissingPath('data.purchase.first_shared_opened_at');
        $this->assertStringContainsString('no-store', $response->headers->get('Cache-Control'));
        $opened = $p->fresh()->first_shared_opened_at->toIso8601String();
        $this->assertSame(now()->toIso8601String(), $opened);
        $this->travel(5)->minutes();
        $this->getJson('/api/shared/'.$p->share_token)->assertOk();
        $this->assertSame($opened, $p->fresh()->first_shared_opened_at->toIso8601String());
        $this->getJson('/api/purchases/'.$p->id)->assertOk()->assertJsonPath('data.purchase.refund_eligibility.reason', 'link_opened');
        $this->postJson('/api/purchases/'.$p->id.'/refund', ['reason' => 'Teste após abertura.', 'first_shared_opened_at' => null, 'paid_at' => now()->toIso8601String()])->assertConflict();
        $this->postJson('/api/purchases/'.$p->id.'/refund', ['reason' => 'Avaliação dos direitos legais.', 'request_kind' => 'legal_review'])->assertOk();
        $this->assertDatabaseHas('refunds', ['purchase_id' => $p->id, 'request_kind' => 'legal_review', 'status' => 'pending']);
    }

    public function test_historical_unknown_access_and_unknown_payment_date_require_individual_review(): void
    {
        $p = $this->paid();
        $p->update(['share_tracking_started_at' => now()->addMinute()]);
        $this->getJson('/api/purchases/'.$p->id)->assertOk()->assertJsonPath('data.purchase.refund_eligibility.reason', 'tracking_unverified');
        $this->postJson('/api/purchases/'.$p->id.'/refund', ['reason' => 'Histórico não verificável.'])->assertConflict();
        $p->update(['paid_at' => null]);
        $this->getJson('/api/purchases/'.$p->id)->assertOk()->assertJsonPath('data.purchase.refund_eligibility.reason', 'payment_date_unknown');
        $this->postJson('/api/purchases/'.$p->id.'/refund', ['reason' => 'Data de pagamento não verificável.'])->assertConflict();
        $this->postJson('/api/purchases/'.$p->id.'/refund', ['reason' => 'Peço avaliação individual.', 'request_kind' => 'legal_review'])->assertOk();
    }

    public function test_legal_review_after_commercial_rejection_preserves_history_and_is_idempotent_with_timestamp_ties(): void
    {
        $this->travelTo(now()->startOfSecond());
        $p = $this->paid();
        Refund::create(['id' => 'z_commercial', 'purchase_id' => $p->id, 'user_id' => $p->user_id, 'request_kind' => 'commercial', 'status' => 'rejected', 'reason' => 'Motivo original.', 'created_at' => now()]);
        $id = $this->postJson('/api/purchases/'.$p->id.'/refund', ['reason' => 'Solicito análise legal específica.', 'request_kind' => 'legal_review'])->assertOk()->assertJsonPath('data.refund.request_kind', 'legal_review')->json('data.refund.id');
        $this->postJson('/api/purchases/'.$p->id.'/refund', ['reason' => 'Repetição de análise legal.', 'request_kind' => 'legal_review'])->assertOk()->assertJsonPath('data.refund.id', $id);
        $this->getJson('/api/purchases/'.$p->id)->assertOk()->assertJsonPath('data.purchase.refund.id', $id)->assertJsonPath('data.purchase.refund.status', 'pending');
        $this->assertDatabaseCount('refunds', 2);
        $this->assertDatabaseHas('refunds', ['id' => 'z_commercial', 'status' => 'rejected', 'reason' => 'Motivo original.']);
    }

    public function test_request_conditions_are_preserved_if_link_opens_and_time_passes_after_submission(): void
    {
        $p = $this->paid();
        $p->update(['content_version' => 1]);
        $id = $this->postJson('/api/purchases/'.$p->id.'/refund', ['reason' => 'Pedido comercial dentro do prazo.'])->assertOk()->json('data.refund.id');
        $this->getJson('/api/shared/'.$p->share_token)->assertOk();
        $this->travel(4)->days();
        $this->postJson('/api/purchases/'.$p->id.'/refund', ['reason' => 'Repetição após quatro dias.'])->assertOk()->assertJsonPath('data.refund.id', $id);
        $this->assertTrue(Refund::findOrFail($id)->eligibility_snapshot['eligible']);
        $this->assertDatabaseCount('refunds', 1);
    }

    public function test_invalid_or_unavailable_shared_access_does_not_record_an_open(): void
    {
        $p = $this->paid();
        $this->getJson('/api/shared/'.$p->share_token)->assertNotFound();
        $p->update(['content_version' => 1, 'status' => 'pending']);
        $this->getJson('/api/shared/'.$p->share_token)->assertNotFound();
        $this->getJson('/api/shared/'.str_repeat('a', 64))->assertNotFound();
        $this->assertNull($p->fresh()->first_shared_opened_at);
        $p->update(['status' => 'paid']);
        foreach (['invalid', ['commercial']] as $kind) {
            $this->postJson('/api/purchases/'.$p->id.'/refund', ['reason' => 'Teste de tipo inválido.', 'request_kind' => $kind])->assertUnprocessable();
        }
    }
}
