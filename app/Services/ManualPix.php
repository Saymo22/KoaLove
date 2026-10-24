<?php

namespace App\Services;

use App\Models\PaymentCheckout;
use App\Models\Purchase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ManualPix
{
    private function key(): string
    {
        $key = trim((string) config('payments.pix.key'));
        if (filter_var($key, FILTER_VALIDATE_EMAIL) || Str::isUuid($key) || preg_match('/\A\+[1-9][0-9]{9,14}\z/', $key)) {
            return $key;
        }
        $digits = preg_replace('/[^0-9]/', '', $key);

        return preg_match('/\A[0-9.\/\-]+\z/', $key) && in_array(strlen($digits), [11, 14], true) ? $digits : '';
    }

    private function label(string $value, int $limit): string
    {
        return substr(trim(preg_replace('/[^A-Z0-9 ]/', '', strtoupper(Str::ascii($value)))), 0, $limit);
    }

    public function configured(): bool
    {
        return $this->key() !== '' && strlen($this->key()) <= 77 && $this->label((string) config('payments.pix.name'), 25) !== '' && $this->label((string) config('payments.pix.city'), 15) !== '';
    }

    private function field(string $id, string $value): string
    {
        return $id.str_pad((string) strlen($value), 2, '0', STR_PAD_LEFT).$value;
    }

    public function payload(string $key, string $name, string $city, int $amount, string $txid): string
    {
        $payload = $this->field('00', '01').$this->field('26', $this->field('00', 'br.gov.bcb.pix').$this->field('01', $key))
            .$this->field('52', '0000').$this->field('53', '986').$this->field('54', number_format($amount / 100, 2, '.', ''))
            .$this->field('58', 'BR').$this->field('59', $name).$this->field('60', $city).$this->field('62', $this->field('05', $txid)).'6304';
        $crc = 0xFFFF;
        foreach (str_split($payload) as $char) {
            $crc ^= ord($char) << 8;
            for ($i = 0; $i < 8; $i++) {
                $crc = (($crc & 0x8000) ? ($crc << 1) ^ 0x1021 : $crc << 1) & 0xFFFF;
            }
        }

        return $payload.strtoupper(str_pad(dechex($crc), 4, '0', STR_PAD_LEFT));
    }

    public function start(Purchase $purchase, string $method, string $coupon, int $discount, int $amount): array
    {
        abort_unless(config('payments.driver') === 'pix_manual' && config('payments.enabled') && $this->configured(), 503, 'Pix ainda não configurado.');
        abort_unless($method === 'pix' && $amount > 0, 422, 'Somente Pix está disponível.');
        $checkout = DB::transaction(function () use ($purchase, $coupon, $amount) {
            $p = Purchase::whereKey($purchase->id)->lockForUpdate()->firstOrFail();
            abort_unless($p->status === 'pending' && $p->content_version === 1 && count($p->manifest['photos'] ?? []) > 0, 409, 'Pedido indisponível para pagamento.');
            if ($existing = PaymentCheckout::where('purchase_id', $p->id)->first()) {
                abort_unless($existing->provider === 'pix_manual' && $existing->amount_cents === $amount && $existing->coupon === ($coupon ?: null), 409, 'Continue o pagamento já iniciado.');

                return $existing;
            }
            $id = (string) Str::uuid();
            $pricing = app(Pricing::class)->quote($p, $coupon);
            abort_unless($pricing['amount_cents'] === $amount, 409, 'O preço mudou. Confira o valor atualizado e tente novamente.');
            $p->update(['price_cents' => $pricing['base_price_cents']]);
            $key = $this->key();
            $name = $this->label((string) config('payments.pix.name'), 25);
            $city = $this->label((string) config('payments.pix.city'), 15);
            $txid = substr(str_replace('-', '', $id), 0, 25);
            $p->touch();

            return PaymentCheckout::create(['id' => $id, 'purchase_id' => $p->id, 'provider' => 'pix_manual', 'method' => 'pix', 'live' => true,
                'amount_cents' => $amount, 'coupon' => $coupon ?: null, 'discount_percent' => $pricing['discount_percent'], 'pricing_details' => $pricing, 'status' => 'awaiting_confirmation',
                'pix_details' => ['key' => $key, 'name' => $name, 'city' => $city, 'txid' => $txid, 'payload' => $this->payload($key, $name, $city, $amount, $txid)]]);
        });

        return app(MercadoPagoCheckout::class)->project($checkout);
    }
}
