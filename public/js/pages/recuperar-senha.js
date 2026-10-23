(() => {
  const $ = id => document.getElementById(id);
  const token = new URLSearchParams(location.hash.slice(1)).get('token');
  if(token) {
    history.replaceState(null,'',location.pathname);
    $('recoveryTitle').textContent = 'Definir nova senha';
    $('recoveryDescription').textContent = 'Escolha uma nova senha de 6 a 128 caracteres.';
    $('emailField').hidden = true; $('recoveryEmail').required = false;
    $('passwordFields').hidden = false;
    $('newPassword').required = $('confirmPassword').required = true;
    $('recoverySubmit').textContent = 'Salvar nova senha'; $('requestAgain').hidden = false;
  }
  $('recoveryForm').addEventListener('submit', async event => {
    event.preventDefault();
    if(token && $('newPassword').value !== $('confirmPassword').value) {
      $('recoveryMessage').textContent = 'As senhas precisam ser iguais.'; return;
    }
    const button = $('recoverySubmit'); button.disabled = true;
    $('recoveryMessage').textContent = 'Aguarde…';
    try {
      const result = await ApiClient.post('/auth/'+(token?'reset-password':'forgot-password'),
        token ? {token,password:$('newPassword').value} : {email:$('recoveryEmail').value.trim()});
      $('recoveryMessage').textContent = result.message;
      if(token) {$('newPassword').value = $('confirmPassword').value = ''; $('passwordFields').hidden = true; button.hidden = true;}
    } catch(error) {$('recoveryMessage').textContent = error.message || 'Não foi possível concluir. Tente novamente.';}
    finally {button.disabled = false;}
  });
})();
