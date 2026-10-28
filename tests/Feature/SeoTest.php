<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Symfony\Component\Process\Process;
use Tests\TestCase;

class SeoTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config(['seo.indexing_enabled' => true, 'app.url' => 'https://site.example.test']);
    }

    public function test_all_pages_have_one_description_robots_and_noscript_without_inline_code(): void
    {
        $pages = json_decode(file_get_contents(resource_path('assets.json')), true);
        foreach ($pages as $page) {
            $response = $this->followingRedirects()->get($page['url'])->assertOk();
            $html = $response->getContent();
            $this->assertSame(1, preg_match_all('/<meta\b[^>]*\bname="description"/i', $html), $page['url']);
            $this->assertSame(1, substr_count($html, 'name="robots"'), $page['url']);
            $this->assertSame(1, substr_count($html, '<noscript>'), $page['url']);
            $this->assertStringContainsString('Ative o JavaScript', $html);
            $this->assertStringContainsString('property="og:title"', $html);
            $this->assertSame(1, substr_count($html, 'property="og:title"'), $page['url']);
            $this->assertSame(1, substr_count($html, 'property="og:type"'), $page['url']);
            $this->assertStringContainsString('name="twitter:description"', $html);
        }
    }

    public function test_public_pages_are_indexable_but_private_and_parameterized_pages_are_not(): void
    {
        $this->get('/')->assertHeader('X-Robots-Tag', 'index, follow, max-image-preview:large')->assertSee('href="https://site.example.test/"', false);
        $this->followingRedirects()->get('/home.html')->assertHeader('X-Robots-Tag', 'index, follow, max-image-preview:large')->assertSee('href="https://site.example.test/"', false);
        $this->get('/criar-presente')->assertHeader('X-Robots-Tag', 'index, follow, max-image-preview:large')->assertSee('href="https://site.example.test/criar-presente"', false);
        $this->get('/temas/namoro')->assertHeader('X-Robots-Tag', 'index, follow, max-image-preview:large');
        $this->followingRedirects()->get('/teste/namoro.html')->assertHeader('X-Robots-Tag', 'index, follow, max-image-preview:large')->assertSee('href="https://site.example.test/temas/namoro"', false);
        foreach (['/presente?token=synthetic-secret', '/temas/namoro?embed=1', '/minha-conta', '/admin/painel', '/pagamento', '/resultado'] as $url) {
            $this->get($url)->assertHeader('X-Robots-Tag', 'noindex, nofollow')->assertSee('name="robots" content="noindex, nofollow"', false);
        }
        $this->get('/entrar')->assertHeader('X-Robots-Tag', 'noindex, follow');
        $this->get('/api/config')->assertHeader('X-Robots-Tag', 'noindex, nofollow');
        $this->get('/missing.html')->assertNotFound()->assertHeader('X-Robots-Tag', 'noindex, nofollow');
    }

    public function test_legacy_html_urls_remain_available_and_friendly_page_routes_are_named(): void
    {
        foreach (['/home.html' => '/', '/criar.html' => '/criar-presente', '/minha-conta.html' => '/minha-conta', '/admin/planos.html' => '/admin/planos', '/teste/namoro.html' => '/temas/namoro'] as $legacyUrl => $friendlyUrl) {
            $this->get($legacyUrl)->assertRedirect($friendlyUrl);
        }

        $routes = collect(app('router')->getRoutes())->map(fn ($route) => $route->uri())->all();
        foreach (['/', 'criar-presente', 'entrar', 'minha-conta', 'temas/namoro', '{legacyPath}'] as $friendlyRoute) {
            $this->assertContains($friendlyRoute, $routes);
        }
        $this->assertSame([], array_filter($routes, fn ($uri) => str_ends_with($uri, '.html')));
    }

    public function test_sitemap_has_only_public_canonical_urls_and_ignores_request_host(): void
    {
        $response = $this->withHeader('Host', 'untrusted.example.test')->get('/sitemap.xml')->assertOk();
        $xml = simplexml_load_string($response->getContent());
        $this->assertNotFalse($xml);
        $urls = array_map(fn ($url) => (string) $url->loc, iterator_to_array($xml->url, false));
        $this->assertCount(18, $urls);
        $this->assertContains('https://site.example.test/', $urls);
        $this->assertContains('https://site.example.test/temas/vinil', $urls);
        $this->assertNotContains('https://site.example.test/entrar', $urls);
        foreach ($urls as $url) {
            $this->assertStringStartsWith('https://site.example.test/', $url);
            $this->assertStringNotContainsString('.html', $url);
            $this->assertStringNotContainsString('?', $url);
            $this->get(parse_url($url, PHP_URL_PATH))->assertOk()->assertHeader('X-Robots-Tag', 'index, follow, max-image-preview:large');
        }
    }

    public function test_sitemap_xml_declaration_works_with_php_short_tags_enabled(): void
    {
        $script = 'require '.var_export(base_path('vendor/autoload.php'), true).'; $app=require '.var_export(base_path('bootstrap/app.php'), true).'; $app->make(Illuminate\\Contracts\\Console\\Kernel::class)->bootstrap(); echo view("sitemap",["urls"=>["https://site.example.test/home.html"]])->render();';
        $process = new Process([PHP_BINARY, '-d', 'short_open_tag=1', '-r', $script], base_path());
        $process->mustRun();
        $this->assertStringStartsWith('<?xml version="1.0" encoding="UTF-8"?>', $process->getOutput());
        $this->assertNotFalse(simplexml_load_string($process->getOutput()));
    }

    public function test_robots_allows_public_search_and_separates_gptbot_training(): void
    {
        $response = $this->get('/robots.txt')->assertOk()->assertSee('User-agent: OAI-SearchBot')->assertSee('Sitemap: https://site.example.test/sitemap.xml');
        $this->assertStringContainsString("User-agent: GPTBot\nDisallow: /\n", $response->getContent());
        foreach (config('seo.restricted_paths') as $path) {
            $this->assertStringContainsString('Disallow: '.$path, $response->getContent());
        }
        config(['seo.allow_gptbot_training' => true]);
        $this->assertStringContainsString("User-agent: GPTBot\nAllow: /\nDisallow: /admin/", $this->get('/robots.txt')->getContent());
    }

    public function test_disabling_indexing_blocks_all_crawlers_and_empties_sitemap(): void
    {
        config(['seo.indexing_enabled' => false]);
        $this->get('/home.html')->assertHeader('X-Robots-Tag', 'noindex, nofollow');
        $this->assertSame("User-agent: *\nDisallow: /\n", $this->get('/robots.txt')->getContent());
        $xml = simplexml_load_string($this->get('/sitemap.xml')->getContent());
        $this->assertCount(0, $xml->url);
    }
}
