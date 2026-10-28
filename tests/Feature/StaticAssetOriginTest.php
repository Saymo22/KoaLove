<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Vite;
use Tests\TestCase;

class StaticAssetOriginTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Reproduz o cenário da Vercel: o gerador de URLs é fixado em APP_URL, que
     * pode ser outro domínio da mesma implantação (alias *.vercel.app), enquanto
     * o visitante usa o domínio personalizado.
     */
    private function pinUrlGeneratorToAnotherHost(): void
    {
        URL::forceScheme('https');
        URL::forceRootUrl('https://projetona.vercel.app');
    }

    public function test_vite_asset_helper_emits_origin_relative_urls(): void
    {
        $this->pinUrlGeneratorToAnotherHost();

        $script = Vite::asset('resources/js/entries/home.js');
        $style = Vite::asset('resources/css/home.css');

        $this->assertStringStartsWith('/build/assets/', $script);
        $this->assertStringStartsWith('/build/assets/', $style);
        $this->assertStringNotContainsString('projetona.vercel.app', $script.$style);
    }

    public function test_every_catalog_page_loads_its_bundles_from_its_own_origin(): void
    {
        $this->pinUrlGeneratorToAnotherHost();
        $pages = json_decode(file_get_contents(resource_path('assets.json')), true, 512, JSON_THROW_ON_ERROR);
        $this->assertNotEmpty($pages);

        foreach ($pages as $name => $page) {
            $html = $this->withServerVariables(['HTTP_HOST' => 'www.koalove.site', 'SERVER_NAME' => 'www.koalove.site'])
                ->followingRedirects()->get($page['url'])
                ->assertOk()
                ->getContent();

            // A CSP `script-src 'self'`/`style-src 'self'` só aceita a própria origem;
            // qualquer bundle absoluto para outro host é bloqueado pelo navegador.
            $this->assertDoesNotMatchRegularExpression(
                '#(?:src|href)="https?://[^"]*/build/assets/#',
                $html,
                "A página {$name} referencia bundles de outra origem."
            );
            $this->assertMatchesRegularExpression(
                '#(?:src|href)="/build/assets/[^"]+"#',
                $html,
                "A página {$name} não referencia bundles relativos à origem."
            );
        }
    }

    public function test_content_security_policy_keeps_bundles_on_the_same_origin(): void
    {
        $this->pinUrlGeneratorToAnotherHost();

        $csp = $this->followingRedirects()->get('/home.html')->assertOk()->headers->get('Content-Security-Policy');

        $this->assertStringContainsString("default-src 'self'", $csp);
        $this->assertStringContainsString("script-src 'self'", $csp);
        $this->assertStringContainsString("style-src 'self' 'unsafe-inline' https://fonts.googleapis.com", $csp);
        $this->assertStringContainsString("font-src 'self' data: https://fonts.gstatic.com", $csp);
        $this->assertStringContainsString("frame-ancestors 'self'", $csp);
        $this->assertStringContainsString("form-action 'self'", $csp);
        $this->assertStringContainsString("object-src 'none'", $csp);
        $this->assertStringNotContainsString('projetona.vercel.app', $csp);
    }
}
