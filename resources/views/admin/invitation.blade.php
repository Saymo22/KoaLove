<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">@include('partials.seo')@vite(['resources/css/admin-login-premium.css'])</head>
<body><main class="form-side"><div class="form-container"><h1 class="form-title">Convite KoaLove</h1><p class="form-sub">Ao aceitar, sua conta receberá o acesso administrativo indicado no convite. Confirme somente se reconhece quem o enviou.</p><form method="post" action="/admin/invitations/{{ $invitation }}/accept">@csrf<label class="checkbox-label"><input type="checkbox" name="confirmed" value="1" required> Quero aceitar o acesso administrativo</label><button class="btn-submit" type="submit">Aceitar convite</button></form></div></main></body>
</html>
