<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;

abstract class ApiController extends Controller
{
    protected function ok(array $data = [], int $status = 200): JsonResponse
    {
        return response()->json(['ok' => true, 'data' => $data], $status);
    }
}
