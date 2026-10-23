<?php

return [
    'themes' => json_decode(file_get_contents(__DIR__.'/catalog.json'), true, 512, JSON_THROW_ON_ERROR),
    'price_cents' => (int) env('GIFT_PRICE_CENTS', 1990),
    'coupons' => [],
    'simulated_payments' => env('SIMULATED_PAYMENTS', false),
    'ffprobe' => env('FFPROBE_PATH', 'ffprobe'),
    'audit_days' => 30,
    'draft_days' => 30,
    'deletion_days' => 30,
    'privacy_email' => env('PRIVACY_EMAIL'),
    'privacy_controller' => env('PRIVACY_CONTROLLER'),
    'dummy_hash' => '$2y$12$Vi9K49Zt2fc7PtEs0YAk3uVC6pOM8SeSVbc.R46/gPSm/HrlHxWJC',
];
