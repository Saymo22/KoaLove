<?php

namespace Tests\Feature;

use App\Models\Coupon;
use App\Models\PaymentCheckout;
use App\Models\Plan;
use App\Models\Promotion;
use App\Models\Purchase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class PricingTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): void
    {
        $user = User::factory()->create();
        $user->forceFill(['role' => 'admin'])->save();
        $this->actingAs($user);
    }

    private function planData(array $extra = []): array
    {
        return [...Plan::first()->only(['name', 'description', 'price_cents', 'features', 'photos_limit', 'videos_limit', 'music_limit', 'active', 'featured', 'sort_order']), ...$extra];
    }

    private function ready(): Purchase
    {
        config(['payments.driver' => 'pix_manual', 'payments.enabled' => true, 'payments.pix.key' => 'fixture@example.test', 'payments.pix.name' => 'Teste', 'payments.pix.city' => 'Sao Paulo']);
        $this->actingAs(User::factory()->create());
        $plan = Plan::first();

        return Purchase::create(['id' => 'p_pricing', 'user_id' => auth()->id(), 'share_token' => bin2hex(random_bytes(32)), 'status' => 'pending', 'content_version' => 1,
            'content' => ['tema' => 'namoro'], 'manifest' => ['photos' => ['fixture-photo'], 'videos' => [], 'music' => null], 'price_cents' => 1990, 'plan_id' => $plan->id, 'plan_snapshot' => $plan->snapshot()]);
    }

    private function promotion(Plan $plan, int $discount = 20): Promotion
    {
        return Promotion::create(['id' => (string) Str::uuid(), 'plan_id' => $plan->id, 'name' => 'Oferta', 'discount_percent' => $discount, 'active' => true, 'starts_at' => now()->subMinute(), 'ends_at' => now()->addHour()]);
    }

    public function test_only_admins_can_manage_pricing(): void
    {
        $this->getJson('/api/admin/pricing')->assertUnauthorized();
        $this->actingAs(User::factory()->create());
        $this->getJson('/api/admin/pricing')->assertForbidden();
        $this->postJson('/api/admin/plans', $this->planData())->assertForbidden();
        $this->assertDatabaseCount('plans', 1);
    }

    public function test_admin_edits_price_and_public_catalog_updates_without_listing_coupons(): void
    {
        $this->admin();
        $plan = Plan::first();
        $this->postJson('/api/admin/plans/'.$plan->id, $this->planData(['price_cents' => 2490]))->assertOk();
        $this->postJson('/api/admin/pricing/coupons', ['code' => ' secreto ', 'discount_percent' => 25, 'active' => true, 'plan_id' => null, 'starts_at' => null, 'ends_at' => null])->assertOk();
        $this->getJson('/api/config')->assertOk()->assertJsonPath('data.price_cents', 2490)->assertJsonPath('data.plans.0.price_cents', 2490)->assertDontSee('SECRETO');
        $this->getJson('/api/admin/pricing')->assertJsonPath('data.coupons.0.code', 'SECRETO');
    }

    public function test_three_active_plans_and_at_least_one_are_enforced(): void
    {
        $this->admin();
        $this->postJson('/api/admin/plans', $this->planData(['name' => 'Segundo', 'featured' => false]))->assertOk();
        $this->postJson('/api/admin/plans', $this->planData(['name' => 'Terceiro', 'featured' => false]))->assertOk();
        $this->postJson('/api/admin/plans', $this->planData(['name' => 'Quarto']))->assertUnprocessable();
        $this->postJson('/api/admin/plans', $this->planData(['name' => 'Rascunho', 'active' => false, 'featured' => false]))->assertOk();
        $this->getJson('/api/config')->assertJsonCount(3, 'data.plans');
    }

    public function test_last_active_plan_and_invalid_money_cannot_be_saved(): void
    {
        $this->admin();
        $plan = Plan::first();
        $this->postJson('/api/admin/plans/'.$plan->id, $this->planData(['active' => false]))->assertUnprocessable();
        $this->postJson('/api/admin/plans/'.$plan->id, $this->planData(['price_cents' => -1]))->assertUnprocessable();
        $this->assertSame(1990, $plan->fresh()->price_cents);
    }

    public function test_promotions_use_real_start_end_and_server_clock(): void
    {
        $plan = Plan::first();
        $promotion = $this->promotion($plan);
        $this->getJson('/api/config')->assertJsonPath('data.plans.0.amount_cents', 1592)->assertJsonPath('data.plans.0.promotion.id', $promotion->id);
        $this->travel(61)->minutes();
        $this->getJson('/api/config')->assertJsonPath('data.plans.0.amount_cents', 1990)->assertJsonPath('data.plans.0.promotion', null);
    }

    public function test_coupon_quote_is_private_scoped_and_does_not_stack(): void
    {
        $p = $this->ready();
        $this->promotion(Plan::first());
        $coupon = Coupon::create(['id' => (string) Str::uuid(), 'code' => 'AMOR30', 'discount_percent' => 30, 'active' => true, 'plan_id' => $p->plan_id]);
        $this->postJson('/api/purchases/'.$p->id.'/quote', ['cupom' => 'amor30'])->assertOk()->assertJsonPath('data.quote.amount_cents', 1393)->assertJsonPath('data.quote.discount_percent', 30);
        $coupon->update(['discount_percent' => 10]);
        $this->postJson('/api/purchases/'.$p->id.'/quote', ['cupom' => 'AMOR30'])->assertJsonPath('data.quote.amount_cents', 1592)->assertJsonPath('data.quote.discount_source', 'promotion');
        $coupon->update(['ends_at' => now()->subMinute()]);
        $this->postJson('/api/purchases/'.$p->id.'/quote', ['cupom' => 'AMOR30'])->assertUnprocessable();
        $this->actingAs(User::factory()->create());
        $this->postJson('/api/purchases/'.$p->id.'/quote', ['cupom' => null])->assertForbidden();
    }

    public function test_checkout_freezes_price_even_after_admin_changes_or_expiry(): void
    {
        $p = $this->ready();
        $promotion = $this->promotion(Plan::first());
        $this->postJson('/api/purchases/'.$p->id.'/pay', ['metodo' => 'pix', 'expected_amount_cents' => 1592, 'amount_cents' => 1])->assertOk()->assertJsonPath('data.checkout.amount_cents', 1592);
        $promotion->update(['active' => false]);
        Plan::whereKey($p->plan_id)->update(['price_cents' => 9990, 'active' => false]);
        $this->travel(2)->hours();
        $this->postJson('/api/purchases/'.$p->id.'/quote', ['cupom' => null])->assertOk()->assertJsonPath('data.quote.amount_cents', 1592)->assertJsonPath('data.quote.frozen', true);
        $this->postJson('/api/purchases/'.$p->id.'/pay', ['metodo' => 'pix'])->assertOk()->assertJsonPath('data.checkout.amount_cents', 1592);
        $this->assertDatabaseCount('payment_checkouts', 1);
        $this->assertSame(1990, PaymentCheckout::first()->pricing_details['base_price_cents']);
    }

    public function test_changed_quote_requires_buyer_to_review_new_total(): void
    {
        $p = $this->ready();
        Plan::whereKey($p->plan_id)->update(['price_cents' => 2490]);
        $this->postJson('/api/purchases/'.$p->id.'/pay', ['metodo' => 'pix', 'expected_amount_cents' => 1990])->assertConflict();
        $this->assertDatabaseCount('payment_checkouts', 0);
        $this->postJson('/api/purchases/'.$p->id.'/quote', ['cupom' => null])->assertJsonPath('data.quote.amount_cents', 2490);
    }

    public function test_plan_selection_and_limits_are_enforced_on_server(): void
    {
        $plan = Plan::first();
        $plan->update(['photos_limit' => 1, 'videos_limit' => 0, 'music_limit' => 0]);
        $this->actingAs(User::factory()->create());
        $body = ['tema' => 'namoro', 'para' => 'Teste', 'plan_id' => $plan->id, 'price_cents' => 1];
        $p = $this->postJson('/api/purchases', $body)->assertCreated()->assertJsonPath('data.purchase.plan.photos_limit', 1)->assertJsonPath('data.purchase.price_cents', 1990)->json('data.purchase');
        foreach (['photo-asset-11111111', 'photo-asset-22222222'] as $asset) {
            $this->call('POST', '/api/purchases/'.$p['id'].'/media/'.$asset, [], [], [], ['CONTENT_TYPE' => 'image/png', 'HTTP_ACCEPT' => 'application/json'], file_get_contents(base_path('tests/Fixtures/pixel.png')))->assertOk();
        }
        $this->postJson('/api/purchases/'.$p['id'].'/update', [...$body, 'media' => ['photos' => ['photo-asset-11111111', 'photo-asset-22222222'], 'videos' => []]])->assertUnprocessable();
        $this->postJson('/api/purchases/'.$p['id'].'/update', [...$body, 'media' => ['photos' => ['photo-asset-11111111'], 'videos' => []]])->assertOk();
    }

    public function test_invalid_promotion_period_and_duplicate_coupon_are_rejected(): void
    {
        $this->admin();
        $this->postJson('/api/admin/pricing/promotions', ['name' => 'Erro', 'discount_percent' => 20, 'active' => true, 'starts_at' => now()->toIso8601String(), 'ends_at' => now()->subHour()->toIso8601String()])->assertUnprocessable();
        $coupon = ['code' => 'AMOR10', 'discount_percent' => 10, 'active' => true];
        $this->postJson('/api/admin/pricing/coupons', $coupon)->assertOk();
        $this->postJson('/api/admin/pricing/coupons', $coupon)->assertUnprocessable();
    }
}
