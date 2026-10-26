<?php

namespace App\Http\Controllers;

use App\Contracts\PaymentGateway;
use App\Http\Requests\PurchaseRequest;
use App\Models\PaymentCheckout;
use App\Models\Purchase;
use App\Models\Refund;
use App\Services\AdminConfiguration;
use App\Services\ManualPix;
use App\Services\MercadoPagoCheckout;
use App\Services\Pricing;
use App\Services\RefundEligibility;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PurchaseController extends ApiController
{
    public function requestRefund(Request $request, Purchase $purchase)
    {
        Gate::authorize('update', $purchase);
        $data = $request->validate(['reason' => 'required|string|min:5|max:1000', 'request_kind' => 'sometimes|string|in:commercial,legal_review']);
        $refund = DB::transaction(function () use ($purchase, $data, $request) {
            $p = Purchase::whereKey($purchase->id)->lockForUpdate()->firstOrFail();
            Gate::authorize('update', $p);
            $kind = $data['request_kind'] ?? 'commercial';
            $existing = Refund::latestForPurchase($p->id)->first();
            if ($existing && ($existing->status !== 'rejected' || $kind === 'commercial' || $existing->request_kind === 'legal_review')) {
                return $existing;
            }
            abort_unless($p->status === 'paid', 409, 'Somente compras pagas podem receber uma solicitação de reembolso.');
            $policy = app(RefundEligibility::class);
            $eligibility = $policy->forPurchase($p);
            abort_if($kind === 'commercial' && ! $eligibility['eligible'], 409, $policy->message($eligibility['reason']));

            return Refund::create(['id' => 'r_'.Str::random(24), 'purchase_id' => $p->id, 'user_id' => $request->user()->id, 'reason' => $data['reason'], 'status' => 'pending',
                'request_kind' => $kind, 'eligibility_snapshot' => $eligibility]);
        });

        return $this->ok(['refund' => $this->refundStatus($refund)]);
    }

    private function refundStatus(Refund $refund): array
    {
        return ['id' => $refund->id, 'status' => $refund->status, 'request_kind' => $refund->request_kind, 'created_at' => $refund->created_at?->getTimestampMs()];
    }

    public function index(Request $request)
    {
        return $this->ok(['purchases' => Purchase::withTrashed()->where('user_id', $request->user()->id)->where(fn ($q) => $q->whereNull('deleted_at')->orWhereNotNull('paid_at'))->latest()->get()->map(fn ($p) => $this->project($p))->all()]);
    }

    public function store(PurchaseRequest $request)
    {
        abort_unless(array_key_exists($request->validated('tema'), app(AdminConfiguration::class)->themes()), 422, 'Tema indisponível.');
        $key = $request->validated('client_request_id');
        $purchase = DB::transaction(function () use ($request, $key) {
            // A trava do usuário serializa criações repetidas e a constraint garante unicidade.
            $request->user()->newQuery()->whereKey($request->user()->id)->lockForUpdate()->first();
            if ($key && $existing = Purchase::withTrashed()->where('user_id', $request->user()->id)->where('client_request_id', $key)->first()) {
                abort_if($existing->trashed(), 409, 'Este rascunho foi excluído.');
                abort_if($request->validated('plan_id') && $existing->plan_id !== $request->validated('plan_id'), 409, 'Este rascunho já utiliza outro plano.');

                return $existing;
            }

            $plan = app(Pricing::class)->plan($request->validated('plan_id'));

            return Purchase::create(['id' => 'p_'.Str::random(24), 'user_id' => $request->user()->id, 'client_request_id' => $key, 'share_token' => bin2hex(random_bytes(32)), 'content' => $request->content(), 'price_cents' => $plan->price_cents, 'plan_id' => $plan->id, 'plan_snapshot' => $plan->snapshot()]);
        });

        return $this->ok(['purchase' => $this->project($purchase)], 201);
    }

    public function show(Purchase $purchase)
    {
        Gate::authorize('view', $purchase);

        return $this->ok(['purchase' => $this->project($purchase)]);
    }

    public function update(PurchaseRequest $request, Purchase $purchase)
    {
        Gate::authorize('update', $purchase);
        $obsolete = [];
        $purchase = DB::transaction(function () use ($request, $purchase, &$obsolete) {
            $p = Purchase::whereKey($purchase->id)->lockForUpdate()->firstOrFail();
            $this->editable($p, $request->routeIs('purchases.migrate'));
            $manifest = $request->validated('media');
            abort_unless(is_array($manifest) && count($manifest['photos'] ?? []) > 0 && array_key_exists('videos', $manifest), 422, 'Informe as mídias do presente.');
            $limits = $p->plan_snapshot ?? ['photos_limit' => 12, 'videos_limit' => 4, 'music_limit' => 1];
            abort_if(count($manifest['photos']) > $limits['photos_limit'] || count($manifest['videos']) > $limits['videos_limit'] || (! empty($manifest['music']) && ! $limits['music_limit']), 422, 'As mídias ultrapassam os limites do plano escolhido.');
            $all = array_merge($manifest['photos'], $manifest['videos'], array_filter([$manifest['music'] ?? null]));
            abort_unless(count($all) === count(array_unique($all)), 422, 'Mídia repetida.');
            foreach (['photos' => 'photo', 'videos' => 'video', 'music' => 'music'] as $key => $kind) {
                $ids = $key === 'music' ? array_filter([$manifest[$key] ?? null]) : $manifest[$key];
                abort_unless($p->assets()->where('kind', $kind)->whereIn('asset_id', $ids)->count() === count($ids), 422, 'Mídia não enviada.');
            }
            $obsolete = $p->assets()->whereNotIn('asset_id', $all)->get()->all();
            $p->assets()->whereNotIn('asset_id', $all)->delete();
            $p->update(['content' => $request->content(), 'manifest' => $manifest, 'content_version' => 1]);

            return $p;
        });
        foreach ($obsolete as $asset) {
            Storage::disk($asset->disk)->delete($asset->path);
        }

        return $this->ok(['purchase' => $this->project($purchase)]);
    }

    public function destroy(Purchase $purchase)
    {
        Gate::authorize('update', $purchase);
        $purchase->delete();

        return $this->ok(['purchase' => $this->project($purchase)]);
    }

    public function pay(Request $request, Purchase $purchase, PaymentGateway $gateway, MercadoPagoCheckout $checkout)
    {
        Gate::authorize('update', $purchase);
        $data = $request->validate(['metodo' => 'required|in:pix,card', 'cupom' => 'nullable|string|max:20', 'expected_amount_cents' => 'sometimes|integer|min:1']);
        if ($purchase->status === 'paid') {
            return $this->ok(['purchase' => $this->project($purchase)]);
        }
        if (in_array(config('payments.driver'), ['mercadopago', 'pix_manual'], true)) {
            $quote = app(Pricing::class)->quote($purchase, $data['cupom'] ?? null);
            abort_if(isset($data['expected_amount_cents']) && $data['expected_amount_cents'] !== $quote['amount_cents'], 409, 'O preço mudou. Confira o valor atualizado e tente novamente.');
            $coupon = $quote['coupon'] ?? '';
            $discount = $quote['discount_percent'];
            $amount = $quote['amount_cents'];
            $payment = config('payments.driver') === 'pix_manual'
                ? app(ManualPix::class)->start($purchase, $data['metodo'], $coupon, $discount, $amount)
                : $checkout->start($purchase, $data['metodo'], $coupon, $discount, $amount);

            return $this->ok(['purchase' => $this->project($purchase->fresh()), 'checkout' => $payment]);
        }
        $p = DB::transaction(function () use ($purchase, $data, $gateway) {
            $p = Purchase::whereKey($purchase->id)->lockForUpdate()->firstOrFail();
            if ($p->status === 'paid') {
                return $p;
            }
            $this->editable($p);
            abort_unless($p->content_version === 1 && count($p->manifest['photos'] ?? []) > 0, 409, 'Salve as fotos antes de pagar.');
            $quote = app(Pricing::class)->quote($p, $data['cupom'] ?? null);
            abort_if(isset($data['expected_amount_cents']) && $data['expected_amount_cents'] !== $quote['amount_cents'], 409, 'O preço mudou. Confira o valor atualizado e tente novamente.');
            $coupon = $quote['coupon'] ?? '';
            $discount = $quote['discount_percent'];
            $gateway->confirm($p, $data['metodo']);
            $p->update(['status' => 'paid', 'paid_at' => now(), 'coupon' => $coupon ?: null, 'discount_percent' => $discount, 'price_cents' => $quote['base_price_cents'], 'amount_paid_cents' => $quote['amount_cents'], 'payment_method' => $data['metodo']]);

            return $p;
        });

        return $this->ok(['purchase' => $this->project($p)]);
    }

    public function shared(string $token)
    {
        $p = $this->sharedPurchase($token);
        if (! request()->isMethod('HEAD') && ! $p->first_shared_opened_at) {
            $p = DB::transaction(function () use ($token) {
                $p = $this->sharedPurchase($token, true);
                if (! $p->first_shared_opened_at) {
                    $openedAt = now();
                    DB::table('purchases')->where('id', $p->id)->update(['first_shared_opened_at' => $openedAt]);
                    $p->first_shared_opened_at = $openedAt;
                }

                return $p;
            });
        }

        return $this->ok(['purchase' => $this->project($p, true)])->header('Cache-Control', 'private, no-store');
    }

    public function sharedPurchase(string $token, bool $lock = false): Purchase
    {
        return Purchase::where('share_token', $token)->where('status', 'paid')->where('content_version', 1)->when($lock, fn ($query) => $query->lockForUpdate())->firstOrFail();
    }

    public function editable(Purchase $p, bool $legacy = false): void
    {
        abort_unless($p->status === 'pending' || ($legacy && $p->status === 'paid' && $p->content_version !== 1), 409, 'Somente rascunhos podem ser alterados.');
        abort_if(PaymentCheckout::where('purchase_id', $p->id)->exists(), 409, 'O pagamento já foi iniciado. Continue o checkout existente.');
    }

    public function project(Purchase $p, bool $shared = false): array
    {
        $content = $p->content;
        $manifest = $p->manifest ?? ['photos' => [], 'videos' => [], 'music' => null];
        if ($shared) {
            unset($content['preview_data_url']);
            $content['themeData'] = [$content['tema'] => $content['themeData'][$content['tema']] ?? []];
        }
        $base = $shared ? '/api/shared/'.$p->share_token.'/media/' : '/api/purchases/'.$p->id.'/media/';
        $out = [...$content, 'status' => $p->status, 'content_version' => $p->content_version, 'photoIds' => $manifest['photos'], 'fotos' => array_map(fn ($id) => $base.rawurlencode($id), $manifest['photos']), 'videos' => array_map(fn ($id) => $base.rawurlencode($id), $manifest['videos']), 'musica' => ! empty($manifest['music']) ? $base.rawurlencode($manifest['music']) : null];
        if (! $shared) {
            $out = [...$out, 'id' => $p->id, 'user_id' => $p->user_id, 'share_token' => $p->share_token, 'price_cents' => $p->price_cents, 'amount_paid_cents' => $p->amount_paid_cents, 'coupon' => $p->coupon, 'payment_method' => $p->payment_method, 'discount_percent' => $p->discount_percent, 'created_at' => $p->created_at?->getTimestampMs(), 'paid_at' => $p->paid_at?->getTimestampMs(), 'deleted' => $p->trashed()];
        }

        if (! $shared && $checkout = PaymentCheckout::where('purchase_id', $p->id)->first()) {
            $out['checkout'] = app(MercadoPagoCheckout::class)->project($checkout);
        }
        if (! $shared) {
            $out['plan_id'] = $p->plan_id;
            $out['plan'] = $p->plan_snapshot;
            $refund = Refund::latestForPurchase($p->id)->first(['id', 'status', 'request_kind', 'created_at']);
            $out['refund'] = $refund ? $this->refundStatus($refund) : null;
            $out['refund_eligibility'] = app(RefundEligibility::class)->forPurchase($p);
        }

        return $out;
    }
}
