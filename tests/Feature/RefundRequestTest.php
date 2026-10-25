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
}
