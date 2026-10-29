<?php

namespace Tests\Feature;

use App\Models\User;
use Aws\CommandInterface;
use Aws\MockHandler;
use Aws\Result;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class SupabaseStorageTest extends TestCase
{
    use RefreshDatabase;

    public function test_cors_diagnostic_checks_content_type_and_cleans_only_its_probe(): void
    {
        $this->configureStorage();
        $disk = Storage::fake('supabase');
        $disk->put('gifts/preserved', 'preserve');
        $disk->buildTemporaryUploadUrlsUsing(fn ($path) => ['url' => 'https://storage.example.test/'.$path.'?signature=private', 'headers' => []]);
        Http::fake(function ($request) use ($disk) {
            $this->assertSame('https://www.koalove.site', $request->header('Origin')[0]);
            if ($request->method() === 'OPTIONS') {
                $this->assertSame('content-type', $request->header('Access-Control-Request-Headers')[0]);

                return Http::response('', 200, ['Access-Control-Allow-Origin' => 'https://www.koalove.site', 'Access-Control-Allow-Methods' => 'GET, PUT', 'Access-Control-Allow-Headers' => 'content-type']);
            }
            $this->assertSame('PUT', $request->method());
            $disk->put(ltrim(parse_url($request->url(), PHP_URL_PATH), '/'), $request->body());

            return Http::response('', 200, ['Access-Control-Allow-Origin' => '*']);
        });
        $this->artisan('media:check', ['--origin' => 'https://www.koalove.site', '--probe' => true, '--capacity' => true])->assertSuccessful();
        Http::assertSentCount(2);
        $this->assertSame(['gifts/preserved'], $disk->allFiles());
    }

    public function test_cors_diagnostic_does_not_send_put_when_preflight_is_incomplete(): void
    {
        $this->configureStorage();
        $disk = Storage::fake('supabase');
        $disk->buildTemporaryUploadUrlsUsing(fn () => ['url' => 'https://storage.example.test/healthchecks/synthetic', 'headers' => []]);
        Http::fake(['*' => Http::response('', 200, ['Access-Control-Allow-Origin' => '*', 'Access-Control-Allow-Methods' => 'PUT'])]);
        $this->artisan('media:check', ['--origin' => 'https://www.koalove.site', '--probe' => true])->assertFailed();
        Http::assertSentCount(1);
        $this->assertSame([], $disk->allFiles());
    }

    public function test_cors_diagnostic_rejects_url_with_path_or_credentials_before_network(): void
    {
        Http::fake();
        $this->artisan('media:check', ['--origin' => 'https://fixture.example.test/private'])->assertFailed();
        $this->artisan('media:check', ['--origin' => 'https://user:password@fixture.example.test'])->assertFailed();
        Http::assertNothingSent();
    }

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
