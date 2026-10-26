<?php

namespace Tests\Feature;

use App\Models\MediaUpload;
use App\Models\Purchase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class CloudMediaTest extends TestCase
{
    use RefreshDatabase;

    private function setupCloud(): array
    {
        config(['filesystems.default' => 's3']);
        config(['filesystems.disks.s3.bucket' => 'test-bucket', 'filesystems.disks.s3.region' => 'us-east-1']);
        $disk = Storage::fake('s3');
        $disk->buildTemporaryUploadUrlsUsing(fn ($path, $expires, $options) => ['url' => 'https://storage.example.test/'.$path, 'headers' => ['Host' => ['storage.example.test'], 'Content-Type' => [$options['ContentType']]]]);
        $disk->buildTemporaryUrlsUsing(fn ($path, $expires, $options) => 'https://storage.example.test/'.$path.'?temporary=1');
        $user = User::factory()->create();
        $this->actingAs($user);
        $p = $this->postJson('/api/purchases', ['tema' => 'netflix', 'para' => 'Bia'])->assertCreated()->json('data.purchase');

        return [$disk, $p];
    }

    private function reserve(array $p, int $bytes, string $mime = 'image/png', string $asset = 'cloud-asset-1234567890'): array
    {
        return $this->postJson('/api/purchases/'.$p['id'].'/media/'.$asset.'/upload-url', compact('bytes', 'mime'))->assertOk()->json('data');
    }

    public function test_unconfigured_cloud_storage_returns_actionable_unavailable_error(): void
    {
        [, $p] = $this->setupCloud();
        config(['filesystems.disks.s3.bucket' => null]);
        $this->postJson('/api/purchases/'.$p['id'].'/media/cloud-asset-1234567890/upload-url', ['mime' => 'image/png', 'bytes' => 100])
            ->assertStatus(503)->assertJsonPath('error.code', 'MEDIA_UNAVAILABLE');
        $this->assertDatabaseCount('media_uploads', 0);
    }

    public function test_renewed_put_url_cannot_outlive_its_cleanup_reservation(): void
    {
        [$disk, $p] = $this->setupCloud();
        $until = null;
        $disk->buildTemporaryUploadUrlsUsing(function ($path, $expires) use (&$until) {
            $until = $expires;

            return ['url' => 'https://storage.example.test/'.$path, 'headers' => []];
        });
        $ticket = $this->reserve($p, 100);
        $intent = MediaUpload::findOrFail($ticket['upload_id']);
        $this->travel(18)->minutes();
        $retry = $this->reserve($p, 100);
        $this->assertSame($ticket['upload_id'], $retry['upload_id']);
        $this->assertTrue($until->lessThanOrEqualTo($intent->expires_at));
    }

    public function test_direct_upload_is_private_until_validation_and_finalization(): void
    {
        [$disk,$p] = $this->setupCloud();
        $bytes = file_get_contents(base_path('tests/Fixtures/pixel.png'));
        $ticket = $this->reserve($p, strlen($bytes));
        $this->assertArrayNotHasKey('Host', $ticket['headers']);
        $intent = MediaUpload::findOrFail($ticket['upload_id']);
        $disk->put($intent->path, $bytes);
        $this->getJson('/api/purchases/'.$p['id'].'/media/cloud-asset-1234567890')->assertNotFound();
        $this->postJson('/api/purchases/'.$p['id'].'/media/cloud-asset-1234567890/complete-upload', ['upload_id' => $intent->id])->assertOk();
        $this->assertDatabaseHas('media_uploads', ['id' => $intent->id, 'bytes' => 0]);
        $disk->assertMissing($intent->path);
        $asset = Purchase::find($p['id'])->assets()->firstOrFail();
        $this->assertSame('s3', $asset->disk);
        $this->assertSame('image/png', $asset->mime);
        $this->reserve($p, strlen($bytes));
        $this->assertDatabaseCount('media_assets', 1);
        $this->postJson('/api/purchases/'.$p['id'].'/update', ['tema' => 'netflix', 'para' => 'Bia', 'media' => ['photos' => ['cloud-asset-1234567890'], 'videos' => [], 'music' => null]])->assertOk();
        $this->get('/api/purchases/'.$p['id'].'/media/cloud-asset-1234567890')->assertRedirect('https://storage.example.test/'.$asset->path.'?temporary=1');
        $this->postJson('/api/purchases/'.$p['id'].'/media/cloud-asset-1234567890/complete-upload', ['upload_id' => $intent->id])->assertOk();
        // A reused signed PUT must not leave an orphaned object after completion.
        $disk->put($intent->path, $bytes);
        $this->travel(21)->minutes();
        $this->artisan('privacy:prune')->assertSuccessful();
        $disk->assertMissing($intent->path);
        $this->assertDatabaseMissing('media_uploads', ['id' => $intent->id]);
    }

    public function test_intents_enforce_owner_mime_size_and_quota(): void
    {
        [$disk,$p] = $this->setupCloud();
        $ticket = $this->reserve($p, 10);
        $other = User::factory()->create();
        $this->actingAs($other)->postJson('/api/purchases/'.$p['id'].'/media/cloud-asset-1234567890/complete-upload', ['upload_id' => $ticket['upload_id']])->assertForbidden();
        $this->actingAs(User::find($p['user_id']));
        $this->postJson('/api/purchases/'.$p['id'].'/media/cloud-asset-1234567890/upload-url', ['bytes' => 11, 'mime' => 'image/png'])->assertConflict();
        $intent = MediaUpload::find($ticket['upload_id']);
        $disk->put($intent->path, 'bad');
        $this->postJson('/api/purchases/'.$p['id'].'/media/cloud-asset-1234567890/complete-upload', ['upload_id' => $intent->id])->assertUnprocessable();
        $disk->put($intent->path, 'not-a-png!');
        $this->postJson('/api/purchases/'.$p['id'].'/media/cloud-asset-1234567890/complete-upload', ['upload_id' => $intent->id])->assertStatus(415);
        $this->assertDatabaseCount('media_assets', 0);
        $this->postJson('/api/purchases/'.$p['id'].'/media/cloud-asset-1234567890/upload-url', ['bytes' => 104857600, 'mime' => 'image/png'])->assertStatus(413);
        $this->reserve($p, 104857600, 'video/mp4', 'video-first-1234567890');
        $this->reserve($p, 104857600, 'video/mp4', 'video-second-1234567890');
        $this->postJson('/api/purchases/'.$p['id'].'/media/video-third-1234567890/upload-url', ['bytes' => 104857600, 'mime' => 'video/mp4'])->assertStatus(413);
    }

    public function test_expired_uploads_are_cleaned_and_cron_requires_secret(): void
    {
        [$disk,$p] = $this->setupCloud();
        $ticket = $this->reserve($p, 10);
        $intent = MediaUpload::find($ticket['upload_id']);
        $disk->put($intent->path, 'quarantine');
        $this->travel(21)->minutes();
        $this->postJson('/api/purchases/'.$p['id'].'/media/cloud-asset-1234567890/complete-upload', ['upload_id' => $intent->id])->assertNotFound();
        $this->getJson('/api/internal/prune')->assertNotFound();
        config(['gift.cron_secret' => str_repeat('x', 40)]);
        $this->withToken(str_repeat('x', 40))->getJson('/api/internal/prune')->assertOk();
        $disk->assertMissing($intent->path);
        $this->assertDatabaseCount('media_uploads', 0);
    }
}
