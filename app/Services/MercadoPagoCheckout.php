<?php

namespace App\Services;

use App\Contracts\CheckoutGateway;
use App\Models\PaymentCheckout;
use App\Models\Purchase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class MercadoPagoCheckout
{
    public function __construct(private CheckoutGateway $gateway, private PaymentSettings $settings) {}

    public function start(Purchase $purchase, string $method, string $coupon, int $discount, int $amount): array
    {
        abort_unless($this->settings->status()['configured'], 503, 'Pagamento não configurado.');
        abort_unless($amount > 0, 422, 'Valor de pagamento inválido.');
        $this->gateway->collector();
        $checkout = DB::transaction(function () use ($purchase, $method, $coupon, $amount) {
            $p = Purchase::whereKey($purchase->id)->lockForUpdate()->firstOrFail();
            abort_unless($p->status === 'pending', 409, 'Pedido já processado.');
            abort_unless($p->content_version === 1 && count($p->manifest['photos'] ?? []) > 0, 409, 'Salve as mídias antes de pagar.');
            if ($existing = PaymentCheckout::where('purchase_id', $p->id)->first()) {
                abort_unless($existing->provider === 'mercadopago', 409, 'Este pedido já tem um Pix manual. Continue o pagamento existente e aguarde a conferência.');
                abort_unless($existing->amount_cents === $amount && $existing->coupon === ($coupon ?: null) && $existing->method === $method && $existing->live === (bool) config('payments.mercadopago.live'), 409, 'O checkout já foi iniciado com outra condição. Continue o pagamento existente.');

                return $existing;
            }
            $pricing = app(Pricing::class)->quote($p, $coupon);
            abort_unless($pricing['amount_cents'] === $amount, 409, 'O preço mudou. Confira o valor atualizado e tente novamente.');
            $p->update(['price_cents' => $pricing['base_price_cents']]);

            return PaymentCheckout::create(['id' => (string) Str::uuid(), 'purchase_id' => $p->id, 'method' => $method, 'amount_cents' => $amount, 'coupon' => $coupon ?: null, 'discount_percent' => $pricing['discount_percent'], 'pricing_details' => $pricing, 'live' => config('payments.mercadopago.live')]);
        });
        $result = Cache::lock('mercadopago-checkout:'.$checkout->id, 60)->get(function () use ($checkout) {
            $checkout->refresh();
            if (! $checkout->checkout_url || ! $checkout->expires_at || $checkout->expires_at->isPast()) {
                $recover = $checkout->status !== 'new';
                $checkout->update(['status' => 'creating']);
                $preference = $this->gateway->preference($checkout, $recover);
                abort_unless(($preference['external_reference'] ?? null) === $checkout->id && (string) ($preference['collector_id'] ?? '') === $this->gateway->collector(), 503, 'Checkout inválido.');
                $url = $preference[$checkout->live ? 'init_point' : 'sandbox_init_point'] ?? '';
                abort_unless(self::validUrl($url, $checkout->live) && is_string($preference['id'] ?? null), 503, 'Endereço de pagamento inválido.');
                // Keep the HTTP request outside the purchase transaction. The persisted UUID
                // allows reconciliation after a timeout without creating duplicate preferences.
                $checkout->update(['preference_id' => $preference['id'], 'checkout_url' => $url, 'expires_at' => now()->addHours(23)]);
                PaymentCheckout::whereKey($checkout->id)->where('status', 'creating')->update(['status' => 'pending']);
                $checkout->refresh();
            }

            return $this->project($checkout);
        });
        abort_unless(is_array($result), 409, 'Checkout em processamento. Aguarde e tente novamente.');

        return $result;
    }

    public static function validUrl(mixed $url, bool $live): bool
    {
        if (! is_string($url)) {
            return false;
        }
        $parts = parse_url($url);
        $hosts = $live ? ['www.mercadopago.com.br', 'www.mercadopago.com'] : ['sandbox.mercadopago.com.br', 'sandbox.mercadopago.com', 'www.mercadopago.com.br', 'www.mercadopago.com'];

        return ($parts['scheme'] ?? '') === 'https' && in_array($parts['host'] ?? '', $hosts, true) && ! isset($parts['user']) && ! isset($parts['pass']) && ! isset($parts['port']);
    }

    public function project(PaymentCheckout $checkout): array
    {
        if ($checkout->provider === 'pix_manual') {
            return ['provider' => 'pix_manual', 'status' => $checkout->status, 'method' => 'pix', 'coupon' => $checkout->coupon, 'amount_cents' => $checkout->amount_cents, 'pix' => $checkout->pix_details];
        }

        return ['status' => $checkout->status, 'url' => $checkout->checkout_url, 'method' => $checkout->method, 'coupon' => $checkout->coupon, 'amount_cents' => $checkout->amount_cents];
    }

    public function verify(Request $request): string
    {
        abort_unless(config('payments.driver') === 'mercadopago' && $this->settings->status()['configured'], 503);
        // PHP changes dots in query keys to underscores. Read exactly the signed raw key.
        $ids = [];
        foreach (explode('&', $request->server('QUERY_STRING', '')) as $pair) {
            [$key, $value] = array_pad(explode('=', $pair, 2), 2, '');
            if (in_array(urldecode($key), ['data.id', 'data_id'], true)) {
                $ids[] = urldecode($value);
            }
        }
        $requestId = $request->header('x-request-id', '');
        abort_unless(count($ids) === 1 && preg_match('/\A[1-9][0-9]{0,29}\z/', $ids[0]) && preg_match('/\A[a-zA-Z0-9_-]{8,100}\z/', $requestId), 401);
        $id = $ids[0];
        abort_unless((string) $request->input('data.id') === $id && $request->input('type') === 'payment', 401);
        $signature = [];
        foreach (explode(',', $request->header('x-signature', '')) as $part) {
            [$key, $value] = array_pad(explode('=', trim($part), 2), 2, '');
            abort_if(isset($signature[$key]), 401);
            $signature[$key] = $value;
        }
        $ts = $signature['ts'] ?? '';
        $digest = $signature['v1'] ?? '';
        abort_unless(preg_match('/\A[0-9]{10,13}\z/', $ts) && preg_match('/\A[a-f0-9]{64}\z/', $digest), 401);
        $expected = hash_hmac('sha256', "id:$id;request-id:$requestId;ts:$ts;", config('payments.mercadopago.webhook_secret'));
        abort_unless(hash_equals($expected, $digest), 401);

        return $id;
    }

    public function synchronize(string $id): void
    {
        $payment = $this->gateway->payment($id);
        abort_unless((string) ($payment['id'] ?? '') === $id && (string) ($payment['collector_id'] ?? '') === $this->gateway->collector(), 422);
        $reference = $payment['external_reference'] ?? null;
        if (! is_string($reference) || ! Str::isUuid($reference)) {
            return; // Ignore payments belonging to other integrations without querying a UUID column.
        }
        $checkout = PaymentCheckout::find($reference);
        if (! $checkout || $checkout->provider !== 'mercadopago') {
            return; // Another integration of the same merchant may also send notifications.
        }
        $amount = (string) ($payment['transaction_amount'] ?? '');
        abort_unless(preg_match('/\A[0-9]+(?:\.[0-9]{1,2})?\z/', $amount), 422);
        $parts = explode('.', $amount);
        $cents = (int) $parts[0] * 100 + (int) str_pad($parts[1] ?? '', 2, '0');
        abort_unless(($payment['currency_id'] ?? '') === 'BRL' && ($payment['live_mode'] ?? null) === $checkout->live && $checkout->live === (bool) config('payments.mercadopago.live') && $cents === $checkout->amount_cents, 422);
        $status = $payment['status'] ?? '';
        abort_unless(in_array($status, ['pending', 'approved', 'authorized', 'in_process', 'in_mediation', 'rejected', 'cancelled', 'refunded', 'charged_back'], true), 422);
        $refunded = (string) ($payment['transaction_amount_refunded'] ?? '0');
        abort_unless(preg_match('/\A[0-9]+(?:\.[0-9]{1,2})?\z/', $refunded), 422);
        $refundParts = explode('.', $refunded);
        $refundedCents = (int) $refundParts[0] * 100 + (int) str_pad($refundParts[1] ?? '', 2, '0');
        abort_if($refundedCents > $cents, 422);
        if ($status === 'approved' && $refundedCents > 0) {
            $status = 'partially_refunded';
        }
        DB::transaction(function () use ($checkout, $id, $status, $cents, $refundedCents, $payment) {
            $p = Purchase::withTrashed()->whereKey($checkout->purchase_id)->lockForUpdate()->firstOrFail();
            $c = PaymentCheckout::whereKey($checkout->id)->lockForUpdate()->firstOrFail();
            $old = DB::table('payment_receipts')->where('id', $id)->first();
            abort_if($old && $old->checkout_id !== $c->id, 422);
            if ($old && in_array($old->status, ['refunded', 'partially_refunded', 'charged_back', 'in_mediation'], true) && $status === 'approved') {
                $status = $old->status;
                $refundedCents = max($refundedCents, $old->refunded_cents);
            }
            DB::table('payment_receipts')->upsert([['id' => $id, 'checkout_id' => $c->id, 'status' => $status, 'amount_cents' => $cents, 'refunded_cents' => $refundedCents, 'created_at' => $old?->created_at ?? now(), 'updated_at' => now()]], ['id'], ['status', 'amount_cents', 'refunded_cents', 'updated_at']);
            if ($status === 'approved' && $p->status === 'pending' && ! $c->paid_payment_id) {
                $c->paid_payment_id = $id;
                $method = ($payment['payment_method_id'] ?? '') === 'pix' ? 'pix' : (in_array($payment['payment_type_id'] ?? '', ['credit_card', 'debit_card', 'prepaid_card'], true) ? 'card' : 'mercadopago');
                $p->update(['status' => 'paid', 'paid_at' => now(), 'amount_paid_cents' => $cents, 'coupon' => $c->coupon, 'discount_percent' => $c->discount_percent, 'payment_method' => $method]);
            }
            if (! $c->paid_payment_id || $c->paid_payment_id === $id) {
                $c->status = $status;
                $c->save();
                if (in_array($status, ['refunded', 'partially_refunded', 'charged_back', 'in_mediation'], true) && $c->paid_payment_id === $id && $p->status === 'paid') {
                    $p->update(['status' => 'refunded']);
                }
            }
        });
    }
}
