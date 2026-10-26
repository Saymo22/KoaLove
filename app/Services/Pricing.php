<?php

namespace App\Services;

use App\Models\Coupon;
use App\Models\PaymentCheckout;
use App\Models\Plan;
use App\Models\Promotion;
use App\Models\Purchase;

class Pricing
{
    public function plans()
    {
        return Plan::where('active', true)->orderBy('sort_order')->orderBy('created_at');
    }

    public function plan(?string $id = null): Plan
    {
        return $id ? $this->plans()->whereKey($id)->firstOrFail() : Plan::where('active', true)->orderByDesc('featured')->orderBy('sort_order')->firstOrFail();
    }

    private function active($query)
    {
        return $query->where('active', true)->where(fn ($q) => $q->whereNull('starts_at')->orWhere('starts_at', '<=', now()))
            ->where(fn ($q) => $q->whereNull('ends_at')->orWhere('ends_at', '>', now()));
    }

    public function calculate(int $base, ?string $planId, ?string $code = null): array
    {
        $promotion = null;
        $saving = 0;
        foreach ($this->active(Promotion::query())->where(fn ($q) => $q->whereNull('plan_id')->orWhere('plan_id', $planId))->get() as $offer) {
            $candidate = $offer->discount_cents !== null ? (int) $offer->discount_cents : $base - (int) round($base * (100 - $offer->discount_percent) / 100);
            if ($candidate > $saving) {
                $saving = $candidate;
                $promotion = $offer;
            }
        }
        $source = $promotion ? 'promotion' : null;
        $couponId = null;
        $code = strtoupper(trim($code ?? ''));
        if ($code !== '') {
            $coupon = $this->active(Coupon::where('code', $code))->where(fn ($q) => $q->whereNull('plan_id')->orWhere('plan_id', $planId))->first();
            abort_unless($coupon && (! $coupon->usage_limit || $this->couponUses($coupon->code) < $coupon->usage_limit), 422, 'Cupom inválido, expirado ou esgotado.');
            $candidate = $coupon->discount_cents !== null ? (int) $coupon->discount_cents : $base - (int) round($base * (100 - $coupon->discount_percent) / 100);
            if ($candidate >= $saving) {
                $saving = $candidate;
                $source = 'coupon';
                $couponId = $coupon->id;
            }
        }
        $saving = min($base - 1, $saving);
        $discount = $base ? min(100, (int) round($saving * 100 / $base)) : 0;

        return ['base_price_cents' => $base, 'amount_cents' => max(1, $base - $saving), 'discount_percent' => $discount, 'discount_cents' => $saving,
            'coupon' => $code ?: null, 'coupon_id' => $couponId, 'discount_source' => $source,
            'promotion' => $promotion ? ['id' => $promotion->id, 'name' => $promotion->name, 'discount_percent' => $promotion->discount_percent, 'discount_cents' => $promotion->discount_cents, 'ends_at' => $promotion->ends_at?->toIso8601String()] : null];
    }

    public function couponUses(string $code): int
    {
        $coupon = Coupon::withTrashed()->where('code', $code)->first();

        return PaymentCheckout::where(function ($q) use ($coupon, $code) {
            if ($coupon) {
                $q->where('pricing_details->coupon_id', $coupon->id);
            }$q->orWhere(fn ($q) => $q->whereNull('pricing_details->coupon_id')->where('coupon', $code));
        })
            ->where('pricing_details->discount_source', 'coupon')->whereNotIn('status', ['rejected', 'cancelled', 'expired'])->count();
    }

    public function reserveCoupon(array $pricing): void
    {
        if (($pricing['discount_source'] ?? null) !== 'coupon') {
            return;
        }
        $coupon = Coupon::where('code', $pricing['coupon'])->lockForUpdate()->firstOrFail();
        abort_if($coupon->usage_limit && $this->couponUses($coupon->code) >= $coupon->usage_limit, 409, 'O limite deste cupom foi atingido. Recalcule o pagamento.');
    }

    public function quote(Purchase $purchase, ?string $code = null): array
    {
        if ($checkout = PaymentCheckout::where('purchase_id', $purchase->id)->first()) {
            abort_if($code && strtoupper(trim($code)) !== $checkout->coupon, 409, 'O checkout já foi iniciado. Continue com o valor existente.');

            return [...($checkout->pricing_details ?? []), 'base_price_cents' => $checkout->pricing_details['base_price_cents'] ?? $purchase->price_cents,
                'amount_cents' => $checkout->amount_cents, 'discount_percent' => $checkout->discount_percent, 'coupon' => $checkout->coupon, 'frozen' => true];
        }
        $base = $purchase->price_cents;
        if ($purchase->plan_id) {
            $plan = Plan::findOrFail($purchase->plan_id);
            abort_unless($plan->active, 409, 'Este plano está indisponível. Escolha um plano ativo em um novo presente.');
            $base = $plan->price_cents;
        }

        return [...$this->calculate($base, $purchase->plan_id, $code), 'frozen' => false];
    }

    public function catalog(): array
    {
        $plans = $this->plans()->get()->map(fn ($plan) => [...$plan->toArray(), ...$this->calculate($plan->price_cents, $plan->id)])->all();
        $default = collect($plans)->firstWhere('featured', true) ?? ($plans[0] ?? null);

        return ['plans' => $plans, 'default_plan_id' => $default['id'] ?? null, 'price_cents' => $default['amount_cents'] ?? null, 'server_time_ms' => now()->getTimestampMs()];
    }
}
