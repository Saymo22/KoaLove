<?php

namespace Tests\Feature;

use App\Models\PaymentCheckout;
use App\Models\Purchase;
use App\Models\Refund;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Factory;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Tests\TestCase;

class MercadoPagoTest extends TestCase
{
    use RefreshDatabase;

    private function ready(): Purchase
    {
        config(['app.url' => 'https://gift.example.test', 'payments.driver' => 'mercadopago', 'payments.enabled' => true,
            'payments.mercadopago.access_token' => 'synthetic-access-token', 'payments.mercadopago.webhook_secret' => 'synthetic-webhook-secret', 'payments.mercadopago.live' => false]);
        $user = User::factory()->create();
        $this->actingAs($user);

        return Purchase::create(['id' => 'p_synthetic_payment', 'user_id' => $user->id, 'share_token' => str_repeat('c', 64), 'status' => 'pending', 'content_version' => 1,
            'content' => ['tema' => 'namoro', 'para' => 'Fixture'], 'manifest' => ['photos' => ['fixture-photo'], 'videos' => [], 'music' => null], 'price_cents' => 1990]);
    }

    private function preference(): array
    {
        return ['id' => 'synthetic-preference', 'collector_id' => 123, 'external_reference' => PaymentCheckout::firstOrFail()->id,
            'init_point' => 'https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=synthetic',
            'sandbox_init_point' => 'https://sandbox.mercadopago.com.br/checkout/v1/redirect?pref_id=synthetic'];
    }

    private function fake(array $payment = [], ?callable $preference = null): void
    {
        Http::swap(new Factory);
        Http::preventStrayRequests();
        Http::fake(function ($request) use ($payment, $preference) {
            if ($request->url() === 'https://api.mercadopago.com/users/me') {
                return Http::response(['id' => 123]);
            }
            if ($request->url() === 'https://api.mercadopago.com/checkout/preferences') {
                return $preference ? $preference($request) : Http::response($this->preference(), 201);
            }
            if (str_contains($request->url(), '/v1/payments/')) {
                return Http::response($payment);
            }
            if (str_contains($request->url(), '/checkout/preferences/search')) {
                return Http::response(['elements' => [['id' => 'synthetic-preference', 'external_reference' => PaymentCheckout::firstOrFail()->id]]]);
            }
            if (str_contains($request->url(), '/checkout/preferences/synthetic-preference')) {
                return Http::response($this->preference());
            }

            return Http::response([], 500);
        });
    }

    private function start(Purchase $p)
    {
        return $this->postJson('/api/purchases/'.$p->id.'/pay', ['metodo' => 'pix']);
    }

    private function payment(array $overrides = []): array
    {
        return array_replace(['id' => 789, 'collector_id' => 123, 'external_reference' => PaymentCheckout::firstOrFail()->id,
            'currency_id' => 'BRL', 'transaction_amount' => 19.90, 'live_mode' => false, 'status' => 'approved', 'payment_method_id' => 'pix'], $overrides);
    }

    private function notify(string $id = '789', bool $signed = true, ?string $bodyId = null)
    {
        $ts = (string) now()->getTimestampMs();
        $requestId = 'synthetic-request-id';
        $digest = hash_hmac('sha256', "id:$id;request-id:$requestId;ts:$ts;", 'synthetic-webhook-secret');

        return $this->postJson('/api/webhooks/mercadopago?data.id='.$id, ['type' => 'payment', 'data' => ['id' => $bodyId ?? $id]], [
            'x-request-id' => $requestId, 'x-signature' => 'ts='.$ts.',v1='.($signed ? $digest : str_repeat('0', 64)),
        ]);
    }

    public function test_checkout_stays_pending_and_repeated_requests_reuse_preference(): void
    {
        $p = $this->ready();
        $this->fake();
        $this->start($p)->assertOk()->assertJsonPath('data.purchase.status', 'pending')->assertJsonPath('data.checkout.status', 'pending');
        $this->start($p)->assertOk();
        $this->assertDatabaseCount('payment_checkouts', 1);
        $this->assertDatabaseHas('purchases', ['id' => $p->id, 'status' => 'pending', 'paid_at' => null]);
        Http::assertSentCount(2); // Own merchant lookup and a single preference creation.
        Http::assertSent(fn ($r) => $r->method() === 'POST' && $r['items'][0]['unit_price'] === 19.9
            && $r['back_urls']['success'] === 'https://gift.example.test/pagamento?id='.$p->id.'&retorno=1'
            && $r['notification_url'] === 'https://gift.example.test/api/webhooks/mercadopago');
        $this->getJson('/api/shared/'.$p->share_token)->assertNotFound();
        $this->get('/pagamento?id='.$p->id.'&status=approved&payment_id=789')->assertOk();
        $this->get('/pagamento.html?id='.$p->id.'&status=approved&payment_id=789')->assertStatus(301)
            ->assertHeader('Location', '/pagamento?id='.$p->id.'&status=approved&payment_id=789');
        $this->assertSame('pending', $p->fresh()->status);
    }

    public function test_signed_payment_from_another_integration_is_ignored(): void
    {
        $p = $this->ready();
        $this->fake();
        $this->start($p)->assertOk();
        $this->fake($this->payment(['external_reference' => 'another-store-order']));
        $this->notify()->assertOk();
        $this->assertSame('pending', $p->fresh()->status);
        $this->assertDatabaseCount('payment_receipts', 0);
    }

    public function test_signed_approval_is_verified_and_idempotent_refund_revokes_sharing(): void
    {
        $p = $this->ready();
        $this->fake();
        $this->start($p)->assertOk();
        $this->fake($this->payment());
        $this->notify()->assertOk();
        $paidAt = $p->fresh()->paid_at->toISOString();
        $this->notify()->assertOk();
        $this->assertSame($paidAt, $p->fresh()->paid_at->toISOString());
        $this->assertDatabaseCount('payment_receipts', 1);
        $this->getJson('/api/shared/'.$p->share_token)->assertOk()->assertJsonMissingPath('data.purchase.checkout');
        $this->fake($this->payment(['status' => 'refunded']));
        $this->notify()->assertOk();
        $this->assertSame('refunded', $p->fresh()->status);
        $this->getJson('/api/shared/'.$p->share_token)->assertNotFound();
        $this->fake($this->payment());
        $this->notify()->assertOk();
        $this->assertSame('refunded', $p->fresh()->status);
    }

    public function test_webhook_rejects_forgery_and_different_body_id_without_contacting_provider(): void
    {
        $p = $this->ready();
        $this->fake();
        $this->start($p)->assertOk();
        Http::fake();
        $this->notify(signed: false)->assertUnauthorized();
        $this->notify(bodyId: '790')->assertUnauthorized();
        Http::assertNothingSent();
        $this->assertSame('pending', $p->fresh()->status);
    }

    public function test_wrong_amount_currency_merchant_and_environment_never_release_gift(): void
    {
        $p = $this->ready();
        $this->fake();
        $this->start($p)->assertOk();
        foreach ([['transaction_amount' => 0.01], ['currency_id' => 'USD'], ['collector_id' => 999], ['live_mode' => true]] as $bad) {
            $this->fake($this->payment($bad));
            $this->notify()->assertUnprocessable();
            $this->assertSame('pending', $p->fresh()->status);
        }
        $this->assertDatabaseCount('payment_receipts', 0);
    }

    public function test_pending_rejection_and_unrelated_refund_do_not_revoke_another_approved_payment(): void
    {
        $p = $this->ready();
        $this->fake();
        $this->start($p)->assertOk();
        foreach (['pending', 'rejected'] as $status) {
            $this->fake($this->payment(['status' => $status]));
            $this->notify()->assertOk();
            $this->assertSame('pending', $p->fresh()->status);
        }
        $this->fake($this->payment());
        $this->notify()->assertOk();
        $this->fake($this->payment(['id' => 790, 'status' => 'refunded']));
        $this->notify('790')->assertOk();
        $this->assertSame('paid', $p->fresh()->status);
        $this->assertSame('approved', PaymentCheckout::first()->status);
    }

    public function test_timeout_recovers_preference_instead_of_creating_another_and_renewal_reuses_id(): void
    {
        $p = $this->ready();
        $this->fake(preference: fn () => Http::response([], 503));
        $this->start($p)->assertStatus(503);
        $this->assertDatabaseCount('payment_checkouts', 1);
        $this->fake();
        $this->start($p)->assertOk();
        Http::assertNotSent(fn ($r) => $r->method() === 'POST');
        $id = PaymentCheckout::first()->id;
        $this->travel(24)->hours();
        $this->fake();
        $this->start($p)->assertOk();
        $this->assertSame($id, PaymentCheckout::first()->id);
        Http::assertNotSent(fn ($r) => $r->method() === 'POST');
    }

    public function test_another_user_cannot_pay_and_price_content_and_method_are_frozen(): void
    {
        $p = $this->ready();
        $owner = User::find($p->user_id);
        $this->fake();
        $this->actingAs(User::factory()->create());
        $this->start($p)->assertForbidden();
        $this->actingAs($owner);
        $this->start($p)->assertOk();
        $this->postJson('/api/purchases/'.$p->id.'/pay', ['metodo' => 'card', 'price_cents' => 1])->assertConflict();
        $this->assertSame(1990, PaymentCheckout::first()->amount_cents);
        $this->postJson('/api/purchases/'.$p->id.'/update', ['tema' => 'namoro', 'para' => 'Changed', 'media' => ['photos' => ['fixture-photo'], 'videos' => [], 'music' => null]])->assertConflict();
    }

    public function test_unconfigured_checkout_creates_nothing_and_rejects_provider_redirect_injection(): void
    {
        $p = $this->ready();
        config(['payments.mercadopago.webhook_secret' => null]);
        $this->getJson('/api/config')->assertJsonPath('data.payments.configured', false)->assertJsonMissingPath('data.payments.access_token');
        $this->start($p)->assertStatus(503);
        $this->assertDatabaseCount('payment_checkouts', 0);
        config(['payments.mercadopago.webhook_secret' => 'synthetic-webhook-secret']);
        $this->fake(preference: fn () => Http::response([...$this->preference(), 'sandbox_init_point' => 'https://www.mercadopago.com.br.evil.test/steal'], 201));
        $this->start($p)->assertStatus(503);
        $this->assertNull(PaymentCheckout::first()->checkout_url);
    }

    public function test_only_the_signed_webhook_is_exempt_from_browser_csrf(): void
    {
        $p = $this->ready();
        $this->fake();
        $this->start($p)->assertOk();
        $this->fake($this->payment());
        $this->app['env'] = 'local';
        try {
            $this->notify()->assertOk();
            $this->postJson('/api/auth/logout', ['confirm' => true])->assertStatus(419);
        } finally {
            $this->app['env'] = 'testing';
        }
    }

    public function test_partial_refund_revokes_access_and_approved_replay_cannot_restore_it(): void
    {
        $p = $this->ready();
        $this->fake();
        $this->start($p)->assertOk();
        $this->fake($this->payment());
        $this->notify()->assertOk();
        $this->fake($this->payment(['transaction_amount_refunded' => 5.00]));
        $this->notify()->assertOk();
        $this->assertSame('refunded', $p->fresh()->status);
        $this->assertDatabaseHas('payment_receipts', ['id' => '789', 'refunded_cents' => 500, 'status' => 'partially_refunded']);
        $this->fake($this->payment());
        $this->notify()->assertOk();
        $this->assertSame('partially_refunded', PaymentCheckout::first()->status);
        $this->getJson('/api/shared/'.$p->share_token)->assertNotFound();
    }

    public function test_payment_export_excludes_other_users_and_provider_secrets(): void
    {
        $p = $this->ready();
        $this->fake();
        $this->start($p)->assertOk();
        $this->fake($this->payment());
        $this->notify()->assertOk();
        $other = User::factory()->create();
        Purchase::create(['id' => 'p_other', 'user_id' => $other->id, 'share_token' => str_repeat('d', 64), 'content' => ['tema' => 'namoro'], 'price_cents' => 1990]);
        PaymentCheckout::create(['id' => (string) Str::uuid(), 'purchase_id' => 'p_other', 'method' => 'pix', 'amount_cents' => 1990, 'live' => false]);
        $this->getJson('/api/privacy/export')->assertOk()->assertJsonCount(1, 'payments')->assertJsonCount(1, 'payment_receipts')
            ->assertJsonPath('payments.0.purchase_id', $p->id)->assertJsonPath('payment_receipts.0.id', '789')
            ->assertJsonMissingPath('payments.0.checkout_url')->assertDontSee('synthetic-access-token')->assertDontSee('synthetic-webhook-secret');
    }

    public function test_activating_mercado_pago_preserves_existing_manual_pix(): void
    {
        $p = $this->ready();
        config(['payments.mercadopago.live' => true]);
        PaymentCheckout::create(['id' => (string) Str::uuid(), 'purchase_id' => $p->id, 'provider' => 'pix_manual', 'method' => 'pix', 'amount_cents' => 1990, 'live' => true, 'status' => 'awaiting_confirmation', 'pix_details' => ['payload' => 'synthetic-existing-pix']]);
        $this->fake();
        $this->start($p)->assertConflict();
        Http::assertSentCount(1); // Merchant preflight only; no new preference.
        $this->fake($this->payment(['live_mode' => true]));
        $this->notify()->assertOk();
        $this->assertSame('pending', $p->fresh()->status);
        $this->assertDatabaseCount('payment_receipts', 0);
        $this->getJson('/api/purchases/'.$p->id)->assertJsonPath('data.purchase.checkout.provider', 'pix_manual')->assertJsonPath('data.purchase.checkout.pix.payload', 'synthetic-existing-pix');
    }

    public function test_admin_can_close_refund_request_only_after_provider_confirms_full_refund(): void
    {
        $p = $this->ready();
        $this->fake();
        $this->start($p)->assertOk();
        $this->fake($this->payment());
        $this->notify()->assertOk();
        $refund = Refund::create(['id' => 'r_provider_fixture', 'purchase_id' => $p->id, 'user_id' => $p->user_id, 'reason' => 'Solicitação sintética', 'status' => 'pending']);
        $this->actingAs(User::factory()->create(['role' => 'admin']));
        $url = '/api/admin/refunds/'.$refund->id.'/decision';
        $this->postJson($url, ['status' => 'approved'])->assertConflict();
        $this->fake($this->payment(['status' => 'refunded']));
        $this->notify()->assertOk();
        $this->postJson($url, ['status' => 'approved'])->assertOk();
        $this->assertSame('approved', $refund->fresh()->status);
        $this->assertSame('refunded', $p->fresh()->status);
    }
}
