<?php
return [
    'paths' => ['api/*'], // sin 'sanctum/csrf-cookie'
    'allowed_methods' => ['*'],
    'allowed_origins' => ['http://localhost:3000', 'http://127.0.0.1:3000'],
    'allowed_headers' => ['*'], // incluye Authorization
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => false, // SIN cookies
];
