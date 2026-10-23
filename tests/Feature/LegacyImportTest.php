<?php

namespace Tests\Feature;

use App\Models\Purchase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class LegacyImportTest extends TestCase
{
    use RefreshDatabase;

    public function test_import_preserves_ids_content_and_media_without_importing_credentials(): void
    {
        Storage::fake('local');
        $dir = storage_path('framework/testing/legacy-'.bin2hex(random_bytes(8)));
        File::ensureDirectoryExists($dir.'/media');
        try {
            $filename = str_repeat('a', 64);
            copy(base_path('tests/Fixtures/pixel.png'), $dir.'/media/'.$filename);
            $rows = ['users' => [['id' => 'old-user', 'email' => 'ANA@example.test', 'name' => 'Ana', 'role' => 'user', 'password_hash' => 'scrypt$do-not-import']],
                'purchases' => [['id' => 'p_legacy', 'user_id' => 'old-user', 'tema' => 'netflix', 'para' => 'Bia', 'status' => 'paid', 'price_cents' => 1990, 'share_token' => str_repeat('b', 64), 'content_version' => 1, 'themeData' => ['netflix' => ['texts' => ['Uma série']]], 'media' => ['photos' => ['asset-1234567890ab'], 'videos' => [], 'music' => null], 'uploads' => [['id' => 'asset-1234567890ab', 'filename' => $filename, 'mime' => 'image/png']]]],
                'refunds' => [], 'tickets' => []];
            foreach ($rows as $name => $data) {
                file_put_contents($dir.'/'.$name.'.json', json_encode($data));
            }
            $hash = hash_file('sha256', $dir.'/users.json');
            $this->artisan('legacy:import', ['directory' => $dir])->assertSuccessful();
            $this->assertDatabaseCount('users', 0);
            $this->artisan('legacy:import', ['directory' => $dir, '--commit' => true])->assertSuccessful();
            $user = User::first();
            $this->assertSame('ana@example.test', $user->email);
            $this->assertStringNotContainsString('scrypt', $user->password);
            $p = Purchase::findOrFail('p_legacy');
            $this->assertSame($user->id, $p->user_id);
            $this->assertSame(['Uma série'], $p->content['themeData']['netflix']['texts']);
            $this->assertSame(str_repeat('b', 64), $p->share_token);
            Storage::disk('local')->assertExists($p->assets()->first()->path);
            $this->assertSame($hash, hash_file('sha256', $dir.'/users.json'));
            $this->artisan('legacy:import', ['directory' => $dir, '--commit' => true])->assertFailed();
            $this->assertDatabaseCount('users', 1);
        } finally {
            File::deleteDirectory($dir);
        }
    }

    public function test_invalid_media_rolls_back_import_without_changing_source(): void
    {
        Storage::fake('local');
        $dir = storage_path('framework/testing/legacy-'.bin2hex(random_bytes(8)));
        File::ensureDirectoryExists($dir.'/media');
        try {
            $filename = str_repeat('a', 64);
            file_put_contents($dir.'/media/'.$filename, 'not an image');
            file_put_contents($dir.'/users.json', json_encode([['id' => 'old', 'email' => 'a@example.test', 'name' => 'Ana', 'role' => 'user']]));
            file_put_contents($dir.'/purchases.json', json_encode([['id' => 'p_old', 'user_id' => 'old', 'tema' => 'namoro', 'para' => 'Bia', 'status' => 'pending', 'price_cents' => 1990, 'uploads' => [['id' => 'asset-1234567890ab', 'filename' => $filename, 'mime' => 'image/png']]]]));
            foreach (['refunds', 'tickets'] as $name) {
                file_put_contents($dir.'/'.$name.'.json', '[]');
            }
            $this->artisan('legacy:import', ['directory' => $dir, '--commit' => true])->assertFailed();
            $this->assertDatabaseCount('users', 0);
            $this->assertDatabaseCount('purchases', 0);
            $this->assertSame([], Storage::disk('local')->allFiles());
            $this->assertSame('not an image', file_get_contents($dir.'/media/'.$filename));
        } finally {
            File::deleteDirectory($dir);
        }
    }
}
