<?php

namespace App\Adapters;

use App\Contracts\CheckoutGateway;
use App\Models\PaymentCheckout;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class MercadoPagoGateway implements CheckoutGateway
{
    private function client(): PendingRequest
    {
        return Http::baseUrl('https://api.mercadopago.com')->withToken(config('payments.mercadopago.access_token'))
            ->acceptJson()->asJson()->connectTimeout(4)->timeout(12)->withoutRedirecting();
    }

    private function request(string $method, string $path, array $data = []): array
    {
        try {
            $response = $this->client()->{$method}($path, $data);
        } catch (ConnectionException) {
            abort(503, 'Conexão com o pagamento indisponível.');
        }
        // Do not throw the provider response: it may contain personal data.
        abort_unless($response->successful() && is_array($response->json()), 503, 'Provedor de pagamento indisponível.');

        return $response->json();
    }

    public function preference(PaymentCheckout $checkout, bool $recover): array
    {
        $expiration = ['expires' => true, 'expiration_date_from' => now()->subMinute()->format('Y-m-d\TH:i:s.vP'), 'expiration_date_to' => now()->addDay()->format('Y-m-d\TH:i:s.vP')];
        if ($checkout->preference_id) {
            return $this->request('put', '/checkout/preferences/'.rawurlencode($checkout->preference_id), $expiration);
        }
        if ($recover) {
            $found = $this->request('get', '/checkout/preferences/search', ['external_reference' => $checkout->id]);
            $items = array_values(array_filter($found['elements'] ?? [], fn ($p) => ($p['external_reference'] ?? null) === $checkout->id));
            // A timed-out POST may have succeeded. Never create another preference blindly.
            abort_unless(count($items) === 1 && is_string($items[0]['id'] ?? null), 503, 'Checkout aguardando conciliação.');

            return $this->request('put', '/checkout/preferences/'.rawurlencode($items[0]['id']), $expiration);
        }
        $base = rtrim(config('app.url'), '/');
        $return = $base.'/pagamento.html?id='.rawurlencode($checkout->purchase_id).'&retorno=1';
        $excluded = ['ticket', 'atm', 'digital_currency'];
        $preferred = $checkout->method === 'pix' ? ['default_payment_method_id' => 'pix'] : ['default_payment_type_id' => 'credit_card'];

        return $this->request('post', '/checkout/preferences', [...$expiration,
            'items' => [['id' => $checkout->purchase_id, 'title' => 'Presente digital KoaLove', 'quantity' => 1, 'currency_id' => 'BRL', 'unit_price' => $checkout->amount_cents / 100]],
            'external_reference' => $checkout->id,
            'back_urls' => ['success' => $return, 'pending' => $return, 'failure' => $return],
            'notification_url' => $base.'/api/webhooks/mercadopago',
            'auto_return' => 'approved',
            'payment_methods' => [...$preferred, 'excluded_payment_types' => array_map(fn ($id) => ['id' => $id], $excluded), 'installments' => 1],
        ]);
    }

    public function payment(string $id): array
    {
        return $this->request('get', '/v1/payments/'.$id);
    }

    public function collector(): string
    {
        return Cache::remember('mercadopago-collector:'.hash('sha256', config('payments.mercadopago.access_token')), 600, function () {
            $account = $this->request('get', '/users/me');
            abort_unless(preg_match('/\A[1-9][0-9]*\z/', (string) ($account['id'] ?? '')), 503);

            return (string) $account['id'];
        });
    }
}
