<?php

namespace Tests\Feature;

use App\Models\Purchase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class LocalMediaStorageTest extends TestCase
{
    use RefreshDatabase;

    public function test_photos_video_and_music_are_saved_privately_on_the_server(): void
    {
        config(['filesystems.default' => 'local', 'gift.serverless' => false]);
        $disk = Storage::fake('local');
        $this->actingAs(User::factory()->create());
        $purchase = $this->postJson('/api/purchases', ['tema' => 'namoro', 'para' => 'Fixture'])->assertCreated()->json('data.purchase');
        $pcm = str_repeat("\0", 1600);
        $wave = 'RIFF'.pack('V', 36 + strlen($pcm)).'WAVEfmt '.pack('VvvVVvv', 16, 1, 1, 8000, 16000, 2, 16).'data'.pack('V', strlen($pcm)).$pcm;
        $files = [
            'photo-local-1234567890' => ['image/png', file_get_contents(base_path('tests/Fixtures/pixel.png')), 'photo'],
            'video-local-1234567890' => ['video/webm', file_get_contents(base_path('tests/Fixtures/synthetic-video.webm')), 'video'],
            'music-local-1234567890' => ['audio/wav', $wave, 'music'],
        ];
        foreach ($files as $id => [$mime, $bytes, $kind]) {
            $this->call('POST', '/api/purchases/'.$purchase['id'].'/media/'.$id, [], [], [], ['CONTENT_TYPE' => $mime, 'HTTP_ACCEPT' => 'application/json'], $bytes)
                ->assertOk()->assertJsonPath('data.kind', $kind)->assertJsonMissingPath('data.path');
            $asset = Purchase::findOrFail($purchase['id'])->assets()->where('asset_id', $id)->firstOrFail();
            $this->assertSame('local', $asset->disk);
            $disk->assertExists($asset->path);
            $this->assertStringNotContainsString(public_path(), $disk->path($asset->path));
        }
        $this->postJson('/api/purchases/'.$purchase['id'].'/update', ['tema' => 'namoro', 'para' => 'Fixture', 'media' => ['photos' => ['photo-local-1234567890'], 'videos' => ['video-local-1234567890'], 'music' => 'music-local-1234567890']])->assertOk();
        foreach ($files as $id => [$mime]) {
            $this->get('/api/purchases/'.$purchase['id'].'/media/'.$id)->assertOk()->assertHeader('Content-Type', $mime);
        }
        $this->get('/api/purchases/'.$purchase['id'].'/media/video-local-1234567890', ['Range' => 'bytes=0-9'])->assertStatus(206)->assertHeader('Content-Length', '10');
        $this->actingAs(User::factory()->create());
        $this->getJson('/api/purchases/'.$purchase['id'].'/media/photo-local-1234567890')->assertForbidden();
        $this->assertCount(3, $disk->allFiles());
    }

    public function test_serverless_local_disk_is_not_advertised_as_persistent_storage(): void
    {
        config(['filesystems.default' => 'local', 'gift.serverless' => true]);
        $disk = Storage::fake('local');
        $this->getJson('/api/config')->assertOk()->assertJsonPath('data.media_upload', 'server')->assertJsonPath('data.media_storage.configured', false);
        $this->actingAs(User::factory()->create());
        $purchase = $this->postJson('/api/purchases', ['tema' => 'namoro', 'para' => 'Fixture'])->assertCreated()->json('data.purchase');
        $this->call('POST', '/api/purchases/'.$purchase['id'].'/media/photo-local-1234567890', [], [], [], ['CONTENT_TYPE' => 'image/png', 'HTTP_ACCEPT' => 'application/json'], file_get_contents(base_path('tests/Fixtures/pixel.png')))
            ->assertStatus(503)->assertJsonPath('error.code', 'MEDIA_UNAVAILABLE');
        $this->assertDatabaseCount('media_assets', 0);
        $this->assertCount(0, $disk->allFiles());
        $this->artisan('media:check', ['--probe' => true])->assertFailed();
    }

    public function test_local_storage_diagnostic_removes_its_synthetic_probe(): void
    {
        config(['filesystems.default' => 'local', 'gift.serverless' => false]);
        $disk = Storage::fake('local');
        $this->getJson('/api/config')->assertJsonPath('data.media_storage.configured', true)->assertJsonPath('data.media_upload', 'server');
        $this->artisan('media:check', ['--probe' => true])->assertSuccessful();
        $this->assertSame([], $disk->allFiles());
    }
}
