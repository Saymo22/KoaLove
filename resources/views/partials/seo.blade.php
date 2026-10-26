@php($seo = app(\App\Services\Seo::class)->metadata(request()))
@unless(request()->is('ver.html', 'teste', 'teste/*'))
@vite('resources/js/chat/entry.js')
@endunless
@vite('resources/css/brand.css')
<link rel="icon" type="image/svg+xml" href="/branding/koalove-simbolo-principal.svg">
<title>{{ $seo['title'] }}</title>
<meta name="description" content="{{ $seo['description'] }}">
<meta name="robots" content="{{ $seo['robots'] }}">
<meta name="author" content="KoaLove">
<meta property="og:site_name" content="KoaLove">
<meta property="og:locale" content="pt_BR">
<meta property="og:type" content="website">
<meta property="og:title" content="{{ $seo['title'] }}">
<meta property="og:description" content="{{ $seo['description'] }}">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="{{ $seo['title'] }}">
<meta name="twitter:description" content="{{ $seo['description'] }}">
@if($seo['canonical'])
<link rel="canonical" href="{{ $seo['canonical'] }}">
<meta property="og:url" content="{{ $seo['canonical'] }}">
@endif
@vite('resources/css/accessibility.css')
