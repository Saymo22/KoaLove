<?php

namespace App\Http\Controllers;

use App\Models\Coupon;
use App\Models\Plan;
use App\Models\Promotion;
use App\Models\Purchase;
use App\Services\Pricing;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class PricingController extends ApiController
{
    public function index()
    {
        return $this->ok(['plans' => Plan::orderBy('sort_order')->get(), 'promotions' => Promotion::latest()->get(), 'coupons' => Coupon::latest()->get()]);
    }

    public function plan(Request $request, ?Plan $plan = null)
    {
        $data = $request->validate([
            'name' => 'required|string|min:2|max:60', 'description' => 'nullable|string|max:240',
            'price_cents' => 'required|integer|min:100|max:10000000', 'features' => 'required|array|list|min:1|max:12', 'features.*' => 'required|string|max:160',
            'photos_limit' => 'required|integer|min:1|max:12', 'videos_limit' => 'required|integer|min:0|max:4', 'music_limit' => 'required|integer|min:0|max:1',
            'active' => 'required|boolean', 'featured' => 'required|boolean', 'sort_order' => 'required|integer|min:0|max:999',
        ]);
        $plan = DB::transaction(function () use ($plan, $data) {
            Plan::orderBy('id')->lockForUpdate()->get();
            $count = Plan::where('active', true)->when($plan?->exists, fn ($q) => $q->where('id', '!=', $plan->id))->count() + (int) $data['active'];
            abort_unless($count >= 1 && $count <= 3, 422, 'Mantenha entre um e três planos ativos.');
            if ($data['featured']) {
                Plan::query()->update(['featured' => false]);
            }
            $record = $plan?->exists ? $plan : new Plan(['id' => (string) Str::uuid()]);
            $record->fill([...$data, 'description' => $data['description'] ?? ''])->save();

            return $record;
        });

        return $this->ok(['plan' => $plan]);
    }

    public function offer(Request $request, string $kind, ?string $id = null)
    {
        abort_unless(in_array($kind, ['promotions', 'coupons'], true), 404);
        $model = $kind === 'coupons' ? Coupon::class : Promotion::class;
        $record = $id ? $model::findOrFail($id) : new $model(['id' => (string) Str::uuid()]);
        if ($kind === 'coupons' && is_string($request->input('code'))) {
            $request->merge(['code' => strtoupper(trim($request->input('code')))]);
        }
        $rules = ['plan_id' => 'nullable|uuid|exists:plans,id', 'discount_percent' => 'required|integer|min:1|max:95', 'active' => 'required|boolean',
            'starts_at' => ($kind === 'promotions' ? 'required' : 'nullable').'|date', 'ends_at' => ($kind === 'promotions' ? 'required' : 'nullable').'|date|after:starts_at'];
        $field = $kind === 'coupons' ? 'code' : 'name';
        if (! $request->filled('starts_at')) {
            $rules['ends_at'] = ($kind === 'promotions' ? 'required' : 'nullable').'|date';
        }
        $rules[$field] = ['required', 'string', 'max:'.($kind === 'coupons' ? 20 : 80), Rule::unique($kind, $field)->ignore($record->id)];
        if ($kind === 'coupons') {
            $rules[$field][] = 'regex:/\A[A-Z0-9][A-Z0-9_-]{2,19}\z/';
        }
        $record->fill($request->validate($rules))->save();

        return $this->ok(['offer' => $record]);
    }

    public function quote(Request $request, Purchase $purchase, Pricing $pricing)
    {
        Gate::authorize('update', $purchase);
        $data = $request->validate(['cupom' => 'nullable|string|max:20']);

        return $this->ok(['quote' => $pricing->quote($purchase, $data['cupom'] ?? null)]);
    }
}
