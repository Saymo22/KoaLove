<?php

namespace App\Http\Controllers;

use App\Services\MediaStorage;
use Illuminate\Http\JsonResponse;

abstract class ApiController extends Controller
{
    protected function ok(array $data = [], int $status = 200): JsonResponse
    {
        return response()->json(['ok' => true, 'data' => $data], $status);
    }

    protected function mediaUnavailable(): ?JsonResponse
    {
        if (! app(MediaStorage::class)->status()['configured']) {
            return response()->json(['ok' => false, 'error' => ['code' => 'MEDIA_UNAVAILABLE', 'message' => 'O armazenamento de mídia está indisponível. Seu rascunho foi mantido; tente novamente mais tarde.']], 503);
        }

        return null;
    }
}
