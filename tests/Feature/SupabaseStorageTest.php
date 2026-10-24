<?php

namespace Tests\Feature;

use App\Models\User;
use Aws\CommandInterface;
use Aws\MockHandler;
use Aws\Result;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class SupabaseStorageTest extends TestCase
{
    use RefreshDatabase;

    private function configureStorage(): void
    {
        config(['filesystems.default' => 'supabase',
            'filesystems.disks.supabase.endpoint' => 'https://storage.example.test/storage/v1/s3',
            'filesystems.disks.supabase.key' => 'synthetic-key',
            'filesystems.disks.supabase.secret' => 'synthetic-secret',
            'gift.serverless' => true]);
    }

    public function test_supabase_put_omits_unsupported_acl_and_signed_upload_stays_private(): void
    {
        $this->configureStorage();
        $disk = Storage::disk('supabase');
        $commands = [];
        $disk->getClient()->getHandlerList()->setHandler(new MockHandler([
            function (CommandInterface $command) use (&$commands) {
                $commands[] = $command;

                return new Result(['ETag' => 'synthetic']);
            },
        ]));
        $this->assertTrue($disk->put('healthchecks/synthetic', 'test', ['visibility' => 'private', 'ContentType' => 'image/png']));
        $this->assertArrayNotHasKey('ACL', $commands[0]->toArray());
        $this->assertSame('gift-media', $commands[0]['Bucket']);
        $signed = $disk->temporaryUploadUrl('gifts/synthetic/incoming/id', now()->addMinutes(5), ['ContentType' => 'video/mp4', 'ContentLength' => 20]);
        $this->assertStringStartsWith('https://storage.example.test/storage/v1/s3/gift-media/', $signed['url']);
        $this->assertStringContainsString('X-Amz-Expires=300', $signed['url']);
        $this->assertStringNotContainsString('synthetic-secret', $signed['url']);
        $this->assertArrayNotHasKey('x-amz-acl', $signed['headers']);
    }

    public function test_supabase_limits_are_advertised_and_enforced_before_reservation(): void
    {
        $this->configureStorage();
        $this->getJson('/api/config')->assertOk()
            ->assertJsonPath('data.media_storage.configured', true)
            ->assertJsonPath('data.media_upload', 'direct')
            ->assertJsonPath('data.media_storage.limits.video', 50000000);
        $this->actingAs(User::factory()->create());
        $p = $this->postJson('/api/purchases', ['tema' => 'namoro', 'para' => 'Pessoa'])->assertCreated()->json('data.purchase');
        $this->postJson('/api/purchases/'.$p['id'].'/media/synthetic-video-12345/upload-url', ['mime' => 'video/mp4', 'bytes' => 50000001])->assertStatus(413);
        $this->assertDatabaseCount('media_uploads', 0);
        $disk = Storage::fake('supabase');
        $disk->buildTemporaryUploadUrlsUsing(fn () => ['url' => 'https://storage.example.test/put', 'headers' => []]);
        $this->postJson('/api/purchases/'.$p['id'].'/media/synthetic-video-12345/upload-url', ['mime' => 'video/mp4', 'bytes' => 50000000])->assertOk();
        $this->assertDatabaseHas('media_uploads', ['disk' => 'supabase', 'bytes' => 50000000]);
        config(['filesystems.disks.supabase.secret' => null]);
        $this->getJson('/api/config')->assertJsonPath('data.media_storage.configured', false);
    }
}
