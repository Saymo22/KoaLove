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
        $promotion = $this->active(Promotion::query())->where(fn ($q) => $q->whereNull('plan_id')->orWhere('plan_id', $planId))
            ->orderByDesc('discount_percent')->orderBy('ends_at')->first();
        $discount = (int) ($promotion?->discount_percent ?? 0);
        $source = $promotion ? 'promotion' : null;
        $code = strtoupper(trim($code ?? ''));
        if ($code !== '') {
            $coupon = $this->active(Coupon::where('code', $code))->where(fn ($q) => $q->whereNull('plan_id')->orWhere('plan_id', $planId))->first();
            abort_unless($coupon, 422, 'Cupom inválido, expirado ou indisponível para este plano.');
            if ($coupon->discount_percent >= $discount) {
                $discount = (int) $coupon->discount_percent;
                $source = 'coupon';
            }
        }

        return ['base_price_cents' => $base, 'amount_cents' => max(1, (int) round($base * (100 - $discount) / 100)),
            'discount_percent' => $discount, 'coupon' => $code ?: null, 'discount_source' => $source,
            'promotion' => $promotion ? ['id' => $promotion->id, 'name' => $promotion->name, 'discount_percent' => $promotion->discount_percent, 'ends_at' => $promotion->ends_at?->toIso8601String()] : null];
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
