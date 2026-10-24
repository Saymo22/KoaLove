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
            default => false,
        };

        return ['configured' => $configured, 'mode' => $driver === 's3' ? 'direct' : 'server', 'limits' => MediaValidator::LIMITS];
    }
}
