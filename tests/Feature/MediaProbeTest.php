<?php

namespace Tests\Feature;

use App\Services\MediaValidator;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Tests\TestCase;

class MediaProbeTest extends TestCase
{
    public function test_probe_accepts_a_real_wave_stream_and_rejects_a_truncated_container(): void
    {
        $path = tempnam(sys_get_temp_dir(), 'na_probe_');
        // PCM mono, 8 kHz, 16 bits: um décimo de segundo de silêncio sintético.
        $pcm = str_repeat("\0", 1600);
        $wave = 'RIFF'.pack('V', 36 + strlen($pcm)).'WAVEfmt '.pack('VvvVVvv', 16, 1, 1, 8000, 16000, 2, 16).'data'.pack('V', strlen($pcm)).$pcm;
        try {
            file_put_contents($path, $wave);
            $result = app(MediaValidator::class)->validate($path, 'audio/wav');
            $this->assertSame('music', $result['kind']);
            $this->assertSame(strlen($wave), $result['bytes']);
            file_put_contents($path, substr($wave, 0, 30));
            try {
                app(MediaValidator::class)->validate($path, 'audio/wav');
                $this->fail('Áudio truncado deve ser rejeitado.');
            } catch (HttpException $exception) {
                $this->assertSame(415, $exception->getStatusCode());
            }
        } finally {
            unlink($path);
        }
    }
}
