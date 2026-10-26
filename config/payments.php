<?php

return [
    'driver' => env('PAYMENT_GATEWAY', 'none'),
    'enabled' => (bool) env('PAYMENTS_ENABLED', false),
    'pix' => [
        'key' => env('PIX_KEY'),
        'name' => env('PIX_RECEIVER_NAME'),
        'city' => env('PIX_RECEIVER_CITY'),
    ],
    'mercadopago' => [
        'access_token' => env('MERCADO_PAGO_ACCESS_TOKEN'),
        'webhook_secret' => env('MERCADO_PAGO_WEBHOOK_SECRET'),
        'live' => (bool) env('MERCADO_PAGO_LIVE_MODE', true),
    ],
];
