<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    @include('partials.seo')
    <link rel="icon" type="image/svg+xml" href="favicon.svg">
    <meta http-equiv="refresh" content="0; url=home.html">


    <meta name="csrf-token" content="{{ csrf_token() }}">
    @vite(["resources/css/pages/index-extracted.css","resources/js/entries/index.js"])
</head>
<body>
    @include('partials.noscript')
    <div>
        <div class="heart">❤️</div>
        <p>Redirecionando para <a href="home.html">home.html</a>…</p>
    </div>
</body>
</html>
