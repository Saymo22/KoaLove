<?php

namespace App\Services;

use Symfony\Component\Process\Process;

class MediaValidator
{
    public const TYPES = ['image/jpeg' => 'photo', 'image/png' => 'photo', 'image/webp' => 'photo', 'image/gif' => 'photo', 'image/avif' => 'photo', 'audio/mpeg' => 'music', 'audio/wav' => 'music', 'audio/x-wav' => 'music', 'audio/ogg' => 'music', 'audio/mp4' => 'music', 'audio/webm' => 'music', 'video/mp4' => 'video', 'video/webm' => 'video', 'video/quicktime' => 'video'];

    public const LIMITS = ['photo' => 15728640, 'music' => 26214400, 'video' => 104857600];

    public function validate(string $path, string $mime): array
    {
        abort_unless(isset(self::TYPES[$mime]), 415, 'Formato não suportado.');
        $kind = self::TYPES[$mime];
        clearstatcache(true, $path);
        abort_unless(is_file($path) && filesize($path) > 0 && filesize($path) <= self::LIMITS[$kind], 413, 'Arquivo vazio ou maior que o limite.');
        $actual = (new \finfo(FILEINFO_MIME_TYPE))->file($path);
        $canonical = fn ($v) => match ($v) {
            'audio/x-wav' => 'audio/wav',default => $v
        };
        $same = $canonical($actual) === $canonical($mime) || in_array($mime, ['audio/mp4', 'audio/webm']) && $actual === str_replace('audio/', 'video/', $mime);
        abort_unless($same, 415, 'O conteúdo do arquivo não corresponde ao formato.');
        if ($kind === 'photo') {
            $info = @getimagesize($path);
            abort_unless($info && $info[0] > 0 && $info[1] > 0 && $info[0] * $info[1] <= 16000000, 415, 'Imagem inválida ou maior que 16 megapixels.');
            $image = @imagecreatefromstring(file_get_contents($path));
            abort_unless($image !== false, 415, 'Imagem corrompida.');
            try {
                imagealphablending($image, false);
                imagesavealpha($image, true);
                abort_unless(imagepng($image, $path), 415, 'Não foi possível normalizar a imagem.');
            } finally {
                imagedestroy($image);
            }
            $mime = 'image/png';
        } else {
            $probe = new Process([config('gift.ffprobe'), '-v', 'error', '-protocol_whitelist', 'file,pipe', '-format_whitelist', 'mov,mp4,m4a,3gp,3g2,mj2,matroska,webm,mp3,wav,ogg', '-show_entries', 'stream=codec_type,codec_name', '-of', 'json', $path]);
            $probe->setTimeout(15);
            try {
                $probe->run();
            } catch (\Throwable) {
                abort(503, 'Validador de mídia indisponível.');
            }
            abort_unless($probe->isSuccessful(), 415, 'Áudio ou vídeo inválido.');
            $streams = json_decode($probe->getOutput(), true)['streams'] ?? [];
            abort_unless(collect($streams)->contains(fn ($s) => ($s['codec_type'] ?? '') === ($kind === 'video' ? 'video' : 'audio')), 415, 'Arquivo sem faixa compatível.');
        }
        clearstatcache(true, $path);
        $bytes = filesize($path);
        abort_unless($bytes <= self::LIMITS[$kind], 413, 'Arquivo normalizado excede o limite.');

        return compact('kind', 'mime', 'bytes');
    }
}
