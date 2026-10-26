<?php

namespace App\Services;

class MediaStorage
{
    public function status(): array
    {
        $disk = config('filesystems.default');
        $driver = config('filesystems.disks.'.$disk.'.driver');
        $configured = match ($driver) {
            'local' => ! config('gift.serverless'),
            's3' => (bool) (config('filesystems.disks.'.$disk.'.bucket') && config('filesystems.disks.'.$disk.'.region')),
            'supabase' => (bool) (config('filesystems.disks.'.$disk.'.endpoint') && config('filesystems.disks.'.$disk.'.key') && config('filesystems.disks.'.$disk.'.secret') && config('filesystems.disks.'.$disk.'.bucket')),
            default => false,
        };

        return ['configured' => $configured, 'mode' => in_array($driver, ['s3', 'supabase'], true) ? 'direct' : 'server', 'limits' => MediaValidator::limits()];
    }
}
