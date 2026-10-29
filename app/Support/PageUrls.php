<?php

namespace App\Support;

class PageUrls
{
    public static function canonicalPath(string $path): ?string
    {
        foreach (json_decode(file_get_contents(resource_path('assets.json')), true) as $page) {
            if ($path === $page['url'] || in_array($path, $page['legacy_urls'] ?? [], true)) {
                return $page['url'];
            }
        }

        return null;
    }
}
