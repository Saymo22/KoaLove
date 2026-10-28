<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="referrer" content="no-referrer">
  @include('partials.seo')


    <meta name="csrf-token" content="{{ csrf_token() }}">
    @vite(["resources/css/base.css","resources/css/recuperar-senha.css","resources/js/entries/recuperar-senha.js"])
</head>
<body>
    @include('partials.noscript')
  <main class="recovery-card">
    <a href="/entrar">← Voltar ao login</a>
    <h1 id="recoveryTitle">Recuperar senha</h1>
    <p id="recoveryDescription">Informe o e-mail da sua conta para receber um link de recuperação.</p>
    <form id="recoveryForm">
      <div id="emailField"><label for="recoveryEmail">Seu e-mail</label><input id="recoveryEmail" type="email" autocomplete="email" maxlength="254" required></div>
      <div id="passwordFields" hidden>
        <label for="newPassword">Nova senha</label><input id="newPassword" type="password" autocomplete="new-password" minlength="8" maxlength="128">
        <label for="confirmPassword">Confirme a nova senha</label><input id="confirmPassword" type="password" autocomplete="new-password" minlength="8" maxlength="128">
      </div>
      <button id="recoverySubmit" type="submit">Enviar link</button>
      <p id="recoveryMessage" role="status" aria-live="polite"></p>
    </form>
    <p><a href="/recuperar-senha" id="requestAgain" hidden>Solicitar outro link</a></p>
    <footer><a href="/termos-de-uso">Termos</a> · <a href="/politica-de-privacidade">Privacidade</a></footer>
  </main>



</body>
</html>
