<?php

namespace Tests\Feature;

use App\Models\Plan;
use App\Models\Purchase;
use App\Models\User;
use App\Support\PlanLimits;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Tests\TestCase;

class PlanMediaLimitsTest extends TestCase
{
    use RefreshDatabase;

    private const CAPS = [
        'min' => ['photos' => 1, 'videos' => 0, 'music' => 0],
        'max' => ['photos' => 12, 'videos' => 4, 'music' => 1],
        'defaults' => ['photos_limit' => 12, 'videos_limit' => 4, 'music_limit' => 1],
    ];

    private function admin(): User
    {
        $user = User::factory()->create();
        $user->forceFill(['role' => 'admin'])->save();

        return $user;
    }

    private function planData(array $extra = []): array
    {
        return [...Plan::first()->only(['name', 'description', 'price_cents', 'features', 'photos_limit', 'videos_limit', 'music_limit', 'active', 'featured', 'sort_order']), ...$extra];
    }

    private function plan(string $name, array $limits, array $extra = []): Plan
    {
        return Plan::create(['id' => (string) Str::uuid(), ...$this->planData(['name' => $name, 'featured' => false, 'sort_order' => 1]), ...$limits, ...$extra]);
    }

    private function draft(User $user, ?Plan $plan = null): array
    {
        $this->actingAs($user);

        return $this->postJson('/api/purchases', ['tema' => 'namoro', 'para' => 'Bia', 'plan_id' => $plan?->id])->assertCreated()->json('data.purchase');
    }

    private function upload(array $purchase, string $asset, string $mime = 'image/png', ?string $fixture = 'pixel.png')
    {
        $bytes = $fixture === null ? $this->wave() : file_get_contents(base_path('tests/Fixtures/'.$fixture));

        return $this->call('POST', '/api/purchases/'.$purchase['id'].'/media/'.$asset, [], [], [], ['CONTENT_TYPE' => $mime, 'HTTP_ACCEPT' => 'application/json'], $bytes);
    }

    private function wave(): string
    {
        $pcm = str_repeat("\0", 1600);

        return 'RIFF'.pack('V', 36 + strlen($pcm)).'WAVEfmt '.pack('VvvVVvv', 16, 1, 1, 8000, 16000, 2, 16).'data'.pack('V', strlen($pcm)).$pcm;
    }

    private function media(array $photos, array $videos = [], ?string $music = null): array
    {
        return ['photos' => $photos, 'videos' => $videos, 'music' => $music];
    }

    public function test_config_and_admin_pricing_publish_the_same_plan_limits_contract(): void
    {
        $this->getJson('/api/config')->assertOk()
            ->assertJsonPath('data.plan_limits.min', self::CAPS['min'])
            ->assertJsonPath('data.plan_limits.max', self::CAPS['max'])
            ->assertJsonPath('data.plan_limits.defaults', self::CAPS['defaults']);
        $this->actingAs($this->admin());
        $this->getJson('/api/admin/pricing')->assertOk()
            ->assertJsonPath('data.limits.min', self::CAPS['min'])
            ->assertJsonPath('data.limits.max', self::CAPS['max'])
            ->assertJsonPath('data.limits.defaults', self::CAPS['defaults']);
        $this->getJson('/api/admin/workspace')->assertOk()
            ->assertJsonPath('data.limits.min', self::CAPS['min'])
            ->assertJsonPath('data.limits.max', self::CAPS['max'])
            ->assertJsonPath('data.limits.defaults', self::CAPS['defaults']);
        $this->assertSame(self::CAPS, PlanLimits::caps());
        $this->assertSame(['photos' => 12, 'videos' => 4, 'music' => 1], PlanLimits::fromSnapshot(null));
    }

    public function test_admin_plan_limits_are_applied_and_the_snapshot_stays_frozen(): void
    {
        Storage::fake('local');
        $admin = $this->admin();
        $this->actingAs($admin);
        $planId = $this->postJson('/api/admin/plans', $this->planData(['name' => 'Essencial', 'photos_limit' => 1, 'videos_limit' => 0, 'music_limit' => 0, 'featured' => false, 'sort_order' => 1]))
            ->assertOk()->json('data.plan.id');
        $plan = Plan::findOrFail($planId);
        $draft = $this->draft(User::factory()->create(), $plan);
        $this->assertSame(1, $draft['plan']['photos_limit']);

        $this->actingAs($admin);
        $this->postJson('/api/admin/plans/'.$plan->id, $this->planData(['name' => 'Essencial', 'photos_limit' => 3, 'videos_limit' => 1, 'music_limit' => 0, 'featured' => false, 'sort_order' => 1]))->assertOk();
        $this->assertSame(3, $plan->fresh()->photos_limit);
        $this->actingAs(User::findOrFail($draft['user_id']));
        $this->getJson('/api/purchases/'.$draft['id'])->assertOk()
            ->assertJsonPath('data.purchase.plan.photos_limit', 1)
            ->assertJsonPath('data.purchase.plan.videos_limit', 0);
        // O rascunho mantém o limite congelado no snapshot, não o valor atualizado do plano.
        $this->upload($draft, 'frozen-photo-11111111')->assertOk();
        $this->upload($draft, 'frozen-photo-22222222')->assertUnprocessable()
            ->assertJsonPath('error.message', 'O limite do plano Essencial é de 1 foto. Remova uma mídia da seleção ou substitua uma existente antes de enviar.');
    }

    public function test_upload_quota_blocks_extra_photos_but_allows_replacing_at_the_limit(): void
    {
        Storage::fake('local');
        $plan = $this->plan('Uma foto', ['photos_limit' => 1, 'videos_limit' => 0, 'music_limit' => 0]);
        $draft = $this->draft(User::factory()->create(), $plan);

        $this->upload($draft, 'quota-photo-11111111')->assertOk();
        $this->upload($draft, 'quota-photo-22222222')->assertUnprocessable()
            ->assertJsonPath('error.message', 'O limite do plano Uma foto é de 1 foto. Remova uma mídia da seleção ou substitua uma existente antes de enviar.');
        $this->assertDatabaseCount('media_assets', 1);
        $this->postJson('/api/purchases/'.$draft['id'].'/update', ['tema' => 'namoro', 'para' => 'Bia', 'media' => $this->media(['quota-photo-11111111'])])->assertOk();

        // No limite, trocar a mídia continua possível: o asset do manifesto não conta como novo.
        $this->upload($draft, 'quota-photo-33333333')->assertOk();
        $this->postJson('/api/purchases/'.$draft['id'].'/update', ['tema' => 'namoro', 'para' => 'Bia', 'media' => $this->media(['quota-photo-33333333'])])->assertOk();
        $this->assertDatabaseCount('media_assets', 1);
    }

    public function test_upload_quota_applies_to_video_and_music_kinds(): void
    {
        Storage::fake('local');
        $plan = $this->plan('Mídia única', ['photos_limit' => 12, 'videos_limit' => 1, 'music_limit' => 1]);
        $draft = $this->draft(User::factory()->create(), $plan);

        $this->upload($draft, 'quota-video-11111111', 'video/webm', 'synthetic-video.webm')->assertOk();
        $this->upload($draft, 'quota-video-22222222', 'video/webm', 'synthetic-video.webm')->assertUnprocessable()
            ->assertJsonPath('error.message', 'O limite do plano Mídia única é de 1 vídeo. Remova uma mídia da seleção ou substitua uma existente antes de enviar.');
        $this->upload($draft, 'quota-music-11111111', 'audio/wav', null)->assertOk();
        $this->upload($draft, 'quota-music-22222222', 'audio/wav', null)->assertUnprocessable()
            ->assertJsonPath('error.message', 'O limite do plano Mídia única é de 1 música. Remova uma mídia da seleção ou substitua uma existente antes de enviar.');
    }

    public function test_over_quota_manifest_finalization_returns_the_plan_message(): void
    {
        Storage::fake('local');
        $plan = $this->plan('Só uma', ['photos_limit' => 1, 'videos_limit' => 0, 'music_limit' => 0]);
        $draft = $this->draft(User::factory()->create(), $plan);
        $this->upload($draft, 'final-photo-11111111')->assertOk();
        $this->upload($draft, 'final-photo-22222222')->assertUnprocessable();

        $this->postJson('/api/purchases/'.$draft['id'].'/update', ['tema' => 'namoro', 'para' => 'Bia', 'media' => $this->media(['final-photo-11111111'])])->assertOk();
        $this->postJson('/api/purchases/'.$draft['id'].'/update', ['tema' => 'namoro', 'para' => 'Bia', 'media' => $this->media(['final-photo-11111111', 'final-photo-22222222'])])
            ->assertUnprocessable()
            ->assertJsonPath('error.message', 'As mídias ultrapassam os limites do plano Só uma: até 1 foto, 0 vídeos e 0 músicas.');
    }

    public function test_legacy_purchase_without_snapshot_uses_default_caps(): void
    {
        Storage::fake('local');
        $this->assertSame(['photos' => 12, 'videos' => 4, 'music' => 1], PlanLimits::fromSnapshot(null));
        $this->assertSame(['photos' => 12, 'videos' => 0, 'music' => 1], PlanLimits::fromSnapshot(['photos_limit' => '99', 'videos_limit' => '-2', 'music_limit' => 'x']));
        $this->assertSame(['photos' => 1, 'videos' => 0, 'music' => 0], PlanLimits::fromSnapshot(['photos_limit' => 1, 'videos_limit' => 0, 'music_limit' => 0]));

        $user = User::factory()->create();
        $purchase = Purchase::create(['id' => 'p_legacy_limits', 'user_id' => $user->id, 'share_token' => bin2hex(random_bytes(32)), 'status' => 'pending',
            'content' => ['tema' => 'namoro'], 'price_cents' => 1990, 'plan_snapshot' => null]);
        $this->actingAs($user);
        $draft = ['id' => $purchase->id];
        for ($index = 1; $index <= 12; $index++) {
            $this->upload($draft, 'legacy-photo-'.str_pad((string) $index, 8, '0', STR_PAD_LEFT))->assertOk();
        }
        $this->upload($draft, 'legacy-photo-99999999')->assertUnprocessable()
            ->assertJsonPath('error.message', 'O limite do plano escolhido é de 12 fotos. Remova uma mídia da seleção ou substitua uma existente antes de enviar.');
        $photos = $purchase->assets()->orderBy('asset_id')->pluck('asset_id')->all();
        $this->postJson('/api/purchases/'.$purchase->id.'/update', ['tema' => 'namoro', 'para' => 'Bia', 'media' => $this->media($photos)])->assertOk();
    }

    public function test_direct_upload_reservations_count_against_the_plan_quota(): void
    {
        config(['filesystems.default' => 's3', 'filesystems.disks.s3.bucket' => 'test-bucket', 'filesystems.disks.s3.region' => 'us-east-1']);
        $disk = Storage::fake('s3');
        $disk->buildTemporaryUploadUrlsUsing(fn ($path, $expires, $options) => ['url' => 'https://storage.example.test/'.$path, 'headers' => []]);
        $plan = $this->plan('Reserva única', ['photos_limit' => 1, 'videos_limit' => 0, 'music_limit' => 0]);
        $draft = $this->draft(User::factory()->create(), $plan);
        $url = '/api/purchases/'.$draft['id'].'/media/';

        $first = $this->postJson($url.'reserve-photo-11111111/upload-url', ['mime' => 'image/png', 'bytes' => 100])->assertOk()->json('data.upload_id');
        $this->postJson($url.'reserve-photo-22222222/upload-url', ['mime' => 'image/png', 'bytes' => 100])->assertUnprocessable()
            ->assertJsonPath('error.message', 'O limite do plano Reserva única é de 1 foto. Remova uma mídia da seleção ou substitua uma existente antes de enviar.');
        // Repetir a reserva do mesmo asset devolve o ticket existente, sem consumir nova cota.
        $this->assertSame($first, $this->postJson($url.'reserve-photo-11111111/upload-url', ['mime' => 'image/png', 'bytes' => 100])->assertOk()->json('data.upload_id'));
        // Reservas expiradas liberam a cota.
        $this->travel(21)->minutes();
        $this->postJson($url.'reserve-photo-22222222/upload-url', ['mime' => 'image/png', 'bytes' => 100])->assertOk();
    }
}
