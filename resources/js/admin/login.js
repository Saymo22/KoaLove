(() => {
    const $ = id => document.getElementById(id);
    const busy = (button, value) => {
        button.disabled = value;
        button.classList.toggle('loading', value);
        button.setAttribute('aria-busy', String(value));
    };
    const message = (element, text, success = false) => {
        element.textContent = text;
        element.className = 'msg-box ' + (success ? 'success' : 'error');
    };
    estaLogadoAdmin().then(ok => { if (ok) window.location.href = '/admin/painel'; });
    $('togglePassword').addEventListener('click', () => {
        const visible = $('senha').type === 'password';
        $('senha').type = visible ? 'text' : 'password';
        $('togglePassword').setAttribute('aria-pressed', String(visible));
        $('togglePassword').setAttribute('aria-label', visible ? 'Ocultar senha' : 'Mostrar senha');
    });
    $('loginForm').addEventListener('submit', async event => {
        event.preventDefault();
        const button = $('btnLogin');
        if (button.disabled) return;
        busy(button, true); $('erro').textContent = '';
        try {
            const result = await fazerLoginAdmin($('email').value.trim(), $('senha').value);
            if (result.ok) { window.location.href = '/admin/painel'; return; }
            message($('erro'), result.error || 'Não foi possível entrar. Tente novamente.');
        } catch { message($('erro'), 'Não foi possível conectar. Tente novamente.'); }
        finally { busy(button, false); }
    });
    $('showRecovery').addEventListener('click', () => {
        $('recoveryEmail').value = $('email').value;
        $('loginPane').hidden = true; $('recoveryPane').hidden = false;
        $('recoveryTitle').focus();
    });
    $('backToLogin').addEventListener('click', () => {
        $('recoveryPane').hidden = true; $('loginPane').hidden = false; $('showRecovery').focus();
    });
    $('recoveryForm').addEventListener('submit', async event => {
        event.preventDefault();
        const button = event.currentTarget.querySelector('[type=submit]');
        if (button.disabled) return;
        busy(button, true); $('recoveryMessage').textContent = '';
        try {
            const response = await window.ApiClient.post('/auth/forgot-password', { email: $('recoveryEmail').value.trim() });
            message($('recoveryMessage'), response.message, true);
        } catch (error) { message($('recoveryMessage'), error.message || 'Não foi possível enviar as instruções.'); }
        finally { busy(button, false); }
    });
})();
