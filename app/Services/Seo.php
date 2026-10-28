<?php

namespace App\Services;

use Illuminate\Http\Request;

class Seo
{
    public function publicPages(): array
    {
        $pages = config('seo.pages');
        foreach (config('gift.themes') as $key => $theme) {
            $name = $theme['nome'] ?? $theme['name'] ?? ucfirst($key);
            $pages['/temas/'.$key] ??= ['title' => 'Tema '.$name.' — KoaLove', 'description' => 'Conheça a demonstração do tema '.$name.' para presentes digitais do KoaLove. Personalize sua história com fotos, vídeos, música e mensagens.'];
        }

        return $pages;
    }

    public function metadata(Request $request): array
    {
        $path = '/'.trim($request->path(), '/');
        $public = $this->publicPages();
        $utilities = config('seo.utility_pages');
        $data = $public[$path] ?? $utilities[$path] ?? config('seo.restricted_pages')[$path] ?? ['title' => 'Área reservada — KoaLove', 'description' => 'Área reservada do KoaLove para acessar sua conta e gerenciar presentes digitais.'];
        $discoverable = config('seo.indexing_enabled') && isset($public[$path]) && ! $request->getQueryString();
        $follow = config('seo.indexing_enabled') && ! $request->getQueryString() && (isset($public[$path]) || isset($utilities[$path]));
        $data['robots'] = ($discoverable ? 'index' : 'noindex').', '.($follow ? 'follow' : 'nofollow');
        if ($discoverable) {
            $data['robots'] .= ', max-image-preview:large';
        }
        $data['canonical'] = isset($public[$path]) ? $this->baseUrl().$path : null;

        return $data;
    }

    public function baseUrl(): string
    {
        return rtrim(config('app.url'), '/');
    }

    public function robots(): string
    {
        if (! config('seo.indexing_enabled')) {
            return "User-agent: *\nDisallow: /\n";
        }
        $rules = "Allow: /\n";
        foreach (config('seo.restricted_paths') as $path) {
            $rules .= 'Disallow: '.$path."\n";
        }
        $rules .= "Disallow: /*?*\n";
        $text = "User-agent: *\n".$rules."\nUser-agent: OAI-SearchBot\n".$rules;
        $text .= "\nUser-agent: GPTBot\n".(config('seo.allow_gptbot_training') ? $rules : "Disallow: /\n");

        return $text."\nSitemap: ".$this->baseUrl()."/sitemap.xml\n";
    }
}
