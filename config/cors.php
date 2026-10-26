<?php

return [
    // Browser clients use same-origin Laravel sessions; no cross-origin API access.
    'paths' => [],
    'allowed_methods' => [],
    'allowed_origins' => [],
    'allowed_headers' => [],
    'supports_credentials' => false,
];
