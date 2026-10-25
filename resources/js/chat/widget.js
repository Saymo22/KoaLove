/*!
 * ChatWidget — Nosso Amor
 * Chatbot embutível com visual premium (dourado + rosé), sem dependências.
 * CSS isolado via Shadow DOM: não interfere nas suas páginas.
 *
 * Uso rápido:
 *   <script src="chatbot.js"></script>
 *   <script>
 *     ChatWidget.init({ endpoint: 'https://seu-servidor.com/api/chat' });
 *   </script>
 *
 * Ou só com atributos:
 *   <script src="chatbot.js" data-auto data-endpoint="https://seu-servidor.com/api/chat"></script>
 *
 * Interações: reações nas mensagens, copiar resposta, bandeja de emojis,
 * chuva de corações ao digitar "te amo", respostas rápidas que mudam a cada
 * resposta, botão de voltar ao fim, indicador de nova mensagem.
 */
(function () {
  'use strict';

  var DEFAULTS = {
    name: 'Nosso Amor',
    subtitle: 'Aqui para ajudar, com carinho',
    avatar: '♥', // emoji, letra ou URL de imagem
    accent: '#e2b369', // dourado
    accent2: '#eaa0b2', // rosé
    onAccent: '', // cor do texto sobre o gradiente (automática se vazio)
    theme: 'dark', // 'dark' | 'light' | 'auto'
    position: 'right', // 'right' | 'left'
    offsetX: 24,
    offsetY: 24,
    greeting: 'Olá! 💛 Eu sou o **Nosso Amor**. Como posso te ajudar hoje?',
    teaser: '',
    teaserDelay: 3500,
    placeholder: 'Escreva sua mensagem…',
    suggestions: [],
    endpoint: '', // POST { messages } -> { reply, suggestions? }
    headers: {},
    onMessage: null, // async (texto, historico) => "texto" | { text, suggestions }
    typingDelay: 600,
    persist: true,
    storageKey: 'nossoamor:chat',
    brandLine: '',
    effects: true, // partículas e chuva de corações
    zIndex: 2147483000,
    errorMessage: 'Não consegui responder agora. Tente novamente em instantes.',
    noBackendMessage:
      'Este chat ainda não está conectado a um servidor. Defina `endpoint` ou `onMessage` na configuração.'
  };

  var REACTIONS = ['❤️', '😍', '👏', '✨'];
  var EMOJIS = ['❤️', '🥰', '😍', '😘', '🌹', '💍', '🎁', '📸', '🎉', '✨', '😊', '🙏'];
  var SPARK = ['♥', '✦', '♥', '✧'];
  var SPARK_COLORS = ['#e2b369', '#eaa0b2', '#f4c6d0', '#f0d28f', '#d98aa0'];

  /* ---------- utilidades ---------- */
  function rgbOf(hex) {
    var h = String(hex).replace('#', '').trim();
    if (h.length === 3) h = h.split('').map(function (c) { return c + c; }).join('');
    var n = parseInt(h, 16);
    if (isNaN(n) || h.length !== 6) return [226, 179, 105];
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function lum(hex) {
    var c = rgbOf(hex);
    return (0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]) / 255;
  }

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function inline(s) {
    return s
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[\s(])\*([^*\n]+)\*(?=[\s).,!?:;]|$)/g, '$1<em>$2</em>')
      .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  }

  function md(text) {
    var lines = esc(text).split('\n');
    var out = [];
    var inList = false;
    lines.forEach(function (line) {
      var m = line.match(/^\s*(?:[-*•]|\d+\.)\s+(.*)$/);
      if (m) {
        if (!inList) { out.push('<ul>'); inList = true; }
        out.push('<li>' + inline(m[1]) + '</li>');
      } else {
        if (inList) { out.push('</ul>'); inList = false; }
        out.push(line.trim() === '' ? '<br>' : '<p>' + inline(line) + '</p>');
      }
    });
    if (inList) out.push('</ul>');
    return out.join('');
  }

  function isUrl(s) {
    return /^(https?:\/\/|\/|\.\/|\.\.\/|data:image)/i.test(s);
  }

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }

  function normalize(r) {
    if (r && typeof r === 'object') {
      var t = r.text || r.reply || r.message || '';
      return { text: String(t), suggestions: Array.isArray(r.suggestions) ? r.suggestions.map(String).slice(0, 4) : [] };
    }
    return { text: String(r == null ? '' : r), suggestions: [] };
  }

  /* ---------- estilos ---------- */
  /* ---------- ícones ---------- */
  var ICON = {
    chat: '<svg class="i-chat" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-7.5-4.6-9.6-9.3C.9 8.3 2.7 4.5 6.3 4.5c2.1 0 3.7 1.1 4.7 2.7h2c1-1.6 2.6-2.7 4.7-2.7 3.6 0 5.4 3.8 3.9 7.2C19.5 16.4 12 21 12 21Z" transform="translate(0 -.3)"/></svg>',
    close: '<svg class="i-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    down: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>',
    reset: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>',
    send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>',
    smile: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8.5 14.2a4.2 4.2 0 0 0 7 0M9 9.5h.01M15 9.5h.01" stroke-width="2.4"/></svg>',
    copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2.5"/><path d="M5 15V6.5A2.5 2.5 0 0 1 7.5 4H15"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>'
  };

  /* ---------- widget ---------- */
  function create(userOpts) {
    var o = Object.assign({}, DEFAULTS, userOpts || {});
    var history = [];
    var busy = false;
    var generation = 0;
    var isOpen = false;
    var chipList = [];
    var teaserTimer = null;
    var unread = 0;
    var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    var fxOn = o.effects && !reduce;

    var host = document.createElement('div');
    host.setAttribute('data-chatwidget', '');
    host.id = 'nosso-amor-chat';
    var shadow = host.attachShadow({ mode: 'open' });

    var style = document.createElement('link');
    style.rel = 'stylesheet'; style.href = o.stylesheet;
    shadow.appendChild(style);

    var root = el('div', 'root ' + (o.position === 'left' ? 'left' : 'right'));
    var onAcc = o.onAccent || ((lum(o.accent) + lum(o.accent2)) / 2 > 0.55 ? '#3a1e26' : '#ffffff');
    root.style.setProperty('--accent', o.accent);
    root.style.setProperty('--accent2', o.accent2);
    root.style.setProperty('--ar', rgbOf(o.accent).join(','));
    root.style.setProperty('--br', rgbOf(o.accent2).join(','));
    root.style.setProperty('--on', onAcc);
    root.style.setProperty('--ox', o.offsetX + 'px');
    root.style.setProperty('--oy', o.offsetY + 'px');

    var avatarHtml = isUrl(o.avatar) ? '<img alt="" src="' + esc(o.avatar) + '">' : '<span class="ch">' + esc(o.avatar) + '</span>';

    root.innerHTML =
      '<div class="teaser" role="status"></div>' +
      '<section class="panel" role="dialog" aria-label="Chat ' + esc(o.name) + '" aria-modal="false">' +
      '  <header class="head">' +
      '    <div class="avatar">' + avatarHtml + '<span class="dot"></span></div>' +
      '    <div class="who"><b>' + esc(o.name) + '</b><span>' + esc(o.subtitle) + '</span></div>' +
      '    <button class="hbtn" data-act="reset" title="Nova conversa" aria-label="Nova conversa">' + ICON.reset + '</button>' +
      '    <button class="hbtn" data-act="close" title="Fechar" aria-label="Fechar chat">' + ICON.down + '</button>' +
      '  </header>' +
      '  <div class="stage">' +
      '    <div class="msgs" aria-live="polite"></div>' +
      '    <button class="jump" aria-label="Ir para a última mensagem">' + ICON.down + '</button>' +
      '  </div>' +
      '  <div class="chips"></div>' +
      '  <footer class="foot">' +
      '    <div class="tray" role="menu" aria-label="Emojis"></div>' +
      '    <div class="box">' +
      '      <button class="emo" aria-label="Emojis" aria-expanded="false">' + ICON.smile + '</button>' +
      '      <textarea maxlength="2000" rows="1" aria-label="Mensagem" placeholder="' + esc(o.placeholder) + '"></textarea>' +
      '      <button class="send" disabled aria-label="Enviar">' + ICON.send + '</button>' +
      '    </div>' +
      (o.brandLine ? '    <div class="brand">' + esc(o.brandLine) + '</div>' : '') +
      '  </footer>' +
      '</section>' +
      '<button class="launcher" aria-label="Abrir chat" aria-expanded="false">' + ICON.chat + ICON.close + '<span class="badge" aria-hidden="true"></span></button>';
    shadow.appendChild(root);

    var fx = el('div', 'fx');
    shadow.appendChild(fx);

    var $ = function (s) { return root.querySelector(s); };
    var msgs = $('.msgs');
    var chips = $('.chips');
    var input = $('textarea');
    var sendBtn = $('.send');
    var launcher = $('.launcher');
    var teaser = $('.teaser');
    var jump = $('.jump');
    var tray = $('.tray');
    tray.inert=true;
    var emoBtn = $('.emo');
    var badge = $('.badge');
    function resizeViewport(){root.style.setProperty('--chat-height',(window.visualViewport?.height||window.innerHeight)+'px');}
    resizeViewport();window.visualViewport?.addEventListener('resize',resizeViewport);
    panelHidden(true);
    function panelHidden(value){$('.panel').inert=value;$('.panel').setAttribute('aria-hidden',String(value));}
    function receive(items){items.forEach(function(m){var text=m.role==='admin'?'**Equipe Nosso Amor**\n'+m.text:m.role==='system'?'**Atendimento**\n'+m.text:m.role==='context'?'**Contexto enviado**\n'+m.text:m.text;addMsg(m.role==='user'?'user':'bot',text);history.push({role:m.role==='user'?'user':'assistant',content:text});if(m.role==='admin'&&!isOpen)setBadge(unread+1);});}


    /* tema */
    var mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
    function applyTheme() {
      var t = o.theme;
      if (t === 'auto') t = mq && mq.matches ? 'dark' : 'light';
      root.classList.remove('dark', 'light');
      root.classList.add(t === 'light' ? 'light' : 'dark');
    }
    applyTheme();
    if (mq && o.theme === 'auto' && mq.addEventListener) mq.addEventListener('change', applyTheme);

    /* ---------- efeitos ---------- */
    function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

    function burst(x, y, chars, n) {
      if (!fxOn) return;
      for (var i = 0; i < n; i++) {
        var s = el('span', 'p');
        s.textContent = pick(chars);
        s.style.color = pick(SPARK_COLORS);
        var ang = -Math.PI / 2 + (Math.random() - 0.5) * 2.4;
        var dist = 46 + Math.random() * 78;
        s.style.cssText += ';left:' + x + 'px;top:' + y + 'px;--dx:' + (Math.cos(ang) * dist).toFixed(1) + 'px;--dy:' + (Math.sin(ang) * dist - 24).toFixed(1) +
          'px;--r:' + (Math.random() * 90 - 45).toFixed(0) + 'deg;font-size:' + (12 + Math.random() * 12).toFixed(0) + 'px;animation-delay:' + (Math.random() * 0.09).toFixed(2) + 's';
        s.addEventListener('animationend', function (e) { e.target.remove(); });
        fx.appendChild(s);
      }
    }

    function burstAt(node, chars, n) {
      var r = node.getBoundingClientRect();
      burst(r.left + r.width / 2, r.top + r.height / 2, chars, n);
    }

    function rain() {
      if (!fxOn) return;
      var w = window.innerWidth;
      for (var i = 0; i < 36; i++) {
        var s = el('span', 'f');
        s.textContent = pick(['♥', '♥', '✦', '❤️', '🌹']);
        s.style.color = pick(SPARK_COLORS);
        s.style.cssText += ';left:' + (Math.random() * w).toFixed(0) + 'px;font-size:' + (14 + Math.random() * 20).toFixed(0) + 'px;--r:' +
          (Math.random() * 360 - 180).toFixed(0) + 'deg;animation-duration:' + (2.6 + Math.random() * 2.4).toFixed(2) + 's;animation-delay:' + (Math.random() * 1.1).toFixed(2) + 's';
        s.addEventListener('animationend', function (e) { e.target.remove(); });
        fx.appendChild(s);
      }
    }

    /* ---------- mensagens ---------- */
    function nearBottom() {
      return msgs.scrollHeight - msgs.scrollTop - msgs.clientHeight < 120;
    }
    function scrollDown() { msgs.scrollTop = msgs.scrollHeight; }
    function updateJump() { jump.classList.toggle('show', !nearBottom()); }

    function setReact(row, col, em, btns) {
      var cur = col.querySelector('.react');
      var same = cur && cur.textContent === em;
      btns.forEach(function (b) { b.classList.remove('on'); });
      if (same || !em) {
        if (cur) cur.remove();
        row.classList.remove('has-react');
        return false;
      }
      if (!cur) { cur = el('span', 'react'); col.appendChild(cur); }
      cur.textContent = em;
      row.classList.add('has-react');
      btns.forEach(function (b) { if (b.dataset.em === em) b.classList.add('on'); });
      return true;
    }

    function buildActs(row, col, text) {
      var acts = el('div', 'acts');
      var rbtns = [];
      REACTIONS.forEach(function (em) {
        var b = el('button', 'ra', em);
        b.dataset.em = em;
        b.setAttribute('aria-label', 'Reagir com ' + em);
        b.addEventListener('click', function (e) {
          e.stopPropagation();
          var added = setReact(row, col, em, rbtns);
          if (added) burstAt(b, em === '❤️' ? ['♥', '❤️'] : [em, '✦'], 8);
        });
        rbtns.push(b);
        acts.appendChild(b);
      });
      var cp = el('button', 'ra', ICON.copy);
      cp.setAttribute('aria-label', 'Copiar resposta');
      cp.title = 'Copiar';
      cp.addEventListener('click', function (e) {
        e.stopPropagation();
        var done = function () {
          cp.innerHTML = ICON.check;
          setTimeout(function () { cp.innerHTML = ICON.copy; }, 1400);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done, done);
        } else {
          var ta = document.createElement('textarea');
          ta.value = text; document.body.appendChild(ta); ta.select();
          try { document.execCommand('copy'); } catch (er) { /* ignora */ }
          ta.remove(); done();
        }
      });
      acts.appendChild(cp);
      return acts;
    }

    function addMsg(role, text, extraClass) {
      var user = role === 'user';
      var stick = nearBottom();
      var row = el('div', 'row ' + (user ? 'user' : 'bot') + (extraClass ? ' ' + extraClass : ''));
      var col = el('div', 'col');
      var b = el('div', 'bubble');
      b.innerHTML = user ? '<p>' + esc(text).replace(/\n/g, '<br>') + '</p>' : md(text);
      col.appendChild(b);
      if (!user && !extraClass) {
        col.appendChild(buildActs(row, col, text));
        b.addEventListener('click', function (e) {
          if (e.target.closest && e.target.closest('a')) return;
          row.classList.toggle('tap');
        });
      }
      row.appendChild(col);
      msgs.appendChild(row);
      if (stick || user) scrollDown(); else updateJump();
      return row;
    }

    function showTyping() {
      var row = el('div', 'row bot', '<div class="col"><div class="bubble typing" aria-label="Digitando"><i></i><i></i><i></i></div></div>');
      msgs.appendChild(row);
      scrollDown();
      return row;
    }

    function renderChips() {
      chips.innerHTML = '';
      chipList.forEach(function (s, i) {
        var c = el('button', 'chip');
        c.style.animationDelay = (0.12 + i * 0.07) + 's';
        c.textContent = s;
        c.addEventListener('click', function () { send(s); });
        chips.appendChild(c);
      });
    }

    function save() {
      if (!o.persist) return;
      try { localStorage.setItem(o.storageKey, JSON.stringify(history.slice(-60))); } catch (e) { /* ignora */ }
    }

    function load() {
      if (!o.persist) return;
      try {
        var raw = localStorage.getItem(o.storageKey);
        var arr = raw ? JSON.parse(raw) : [];
        if (Array.isArray(arr)) {
          history = arr.filter(function (m) { return m && typeof m.content === 'string' && (m.role === 'user' || m.role === 'assistant'); });
        }
      } catch (e) { history = []; }
    }

    function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

    function ask(text) {
      if (typeof o.onMessage === 'function') {
        return Promise.resolve(o.onMessage(text, history.slice())).then(normalize);
      }
      if (!o.endpoint) return Promise.resolve(normalize(o.noBackendMessage));
      var ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
      var t = setTimeout(function () { if (ctrl) ctrl.abort(); }, 45000);
      return fetch(o.endpoint, {
        method: 'POST',
        headers: Object.assign({ 'Content-Type': 'application/json' }, o.headers),
        body: JSON.stringify({ messages: history.slice(-30) }),
        signal: ctrl ? ctrl.signal : undefined
      })
        .then(function (r) {
          clearTimeout(t);
          if (!r.ok) throw new Error('HTTP ' + r.status);
          return r.json();
        })
        .then(function (d) {
          var n = normalize(d);
          if (!n.text) throw new Error('Resposta vazia');
          return n;
        });
    }

    function refreshSend() { sendBtn.disabled = busy || !input.value.trim(); }
    function setBusy(v) { busy = v; refreshSend(); }

    function setBadge(n) {
      unread = n;
      badge.textContent = n > 9 ? '9+' : String(n);
      badge.classList.toggle('show', n > 0 && !isOpen);
    }

    function send(text) {
      text = (text || '').trim();
      if (!text || busy || text.length > 2000) return;
      closeTray();
      chipList = [];
      renderChips();
      var userRow = addMsg('user', text);
      history.push({ role: 'user', content: text });
      save();
      burstAt(sendBtn, SPARK, 6);
      if (/te amo|ti amo|i love you/i.test(text)) rain();
      input.value = '';
      autosize();
      setBusy(true);

      var typing = showTyping();
      var started = Date.now();
      var sendingGeneration = generation;

      ask(text)
        .then(function (reply) {
          return wait(Math.max(0, o.typingDelay - (Date.now() - started))).then(function () { return reply; });
        })
        .then(function (reply) {
          if(sendingGeneration !== generation)return;
          typing.remove();
          if(reply.text){addMsg('bot', reply.text);history.push({ role: 'assistant', content: reply.text });}
          save();
          chipList = reply.suggestions;
          renderChips();
          if (!isOpen) setBadge(unread + 1);
        })
        .catch(function () {
          if(sendingGeneration !== generation)return;
          typing.remove();
          var row = addMsg('bot', o.errorMessage, 'err');
          var btn = el('button', 'retry');
          btn.textContent = 'Tentar de novo';
          btn.addEventListener('click', function () {
            row.remove();
            userRow.remove();
            history.pop();
            save();
            send(text);
          });
          row.querySelector('.bubble').appendChild(btn);
          scrollDown();
        })
        .then(function () {
          if(sendingGeneration !== generation)return;
          setBusy(false);
          if (isOpen && !window.matchMedia('(hover:none)').matches) input.focus();
        });
    }

    function autosize() {
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 120) + 'px';
    }

    function renderAll() {
      msgs.innerHTML = '';
      if (o.greeting) addMsg('bot', o.greeting);
      history.forEach(function (m) { addMsg(m.role === 'user' ? 'user' : 'bot', m.content); });
      chipList = history.length === 0 ? (o.suggestions || []).slice() : [];
      renderChips();
      scrollDown();
    }

    function reset() {
      if(busy)return;
      if(o.onReset)o.onReset();
      history = [];
      save();
      renderAll();
      burstAt($('[data-act="reset"]'), ['✦', '♥'], 5);
    }
    function clear() {generation++;history=[];input.value='';setBusy(false);setBadge(0);renderAll();}

    /* bandeja de emojis */
    EMOJIS.forEach(function (em) {
      var b = el('button', '', em);
      b.setAttribute('role', 'menuitem');
      b.addEventListener('click', function () {
        var s = input.selectionStart == null ? input.value.length : input.selectionStart;
        var e = input.selectionEnd == null ? s : input.selectionEnd;
        input.value = input.value.slice(0, s) + em + input.value.slice(e);
        input.selectionStart = input.selectionEnd = s + em.length;
        autosize(); refreshSend(); input.focus();
      });
      tray.appendChild(b);
    });
    function closeTray() {
      tray.inert=true;
      tray.classList.remove('show');
      emoBtn.classList.remove('on');
      emoBtn.setAttribute('aria-expanded', 'false');
    }
    emoBtn.addEventListener('click', function () {
      var on = !tray.classList.contains('show');
      tray.inert=!on;
      tray.classList.toggle('show', on);
      emoBtn.classList.toggle('on', on);
      emoBtn.setAttribute('aria-expanded', on ? 'true' : 'false');
    });

    /* abrir / fechar */
    function hideTeaser() {
      teaser.classList.remove('show');
      clearTimeout(teaserTimer);
    }

    function open() {
      if (isOpen) return;
      isOpen = true; panelHidden(false); if(o.onOpen)o.onOpen();
      root.classList.add('open');
      launcher.setAttribute('aria-expanded', 'true');
      launcher.setAttribute('aria-label', 'Fechar chat');
      hideTeaser();
      setBadge(0);
      burstAt(launcher, SPARK, 7);
      setTimeout(function () {
        if (!window.matchMedia('(hover:none)').matches) input.focus();
        scrollDown();
      }, 380);
    }

    function close() {
      if (!isOpen) return;
      isOpen = false; panelHidden(true);
      closeTray();
      root.classList.remove('open');
      launcher.setAttribute('aria-expanded', 'false');
      launcher.setAttribute('aria-label', 'Abrir chat');
      launcher.focus();
    }

    function toggle() { isOpen ? close() : open(); }

    /* eventos */
    launcher.addEventListener('click', toggle);
    teaser.addEventListener('click', open);
    jump.addEventListener('click', scrollDown);
    msgs.addEventListener('scroll', updateJump);
    root.querySelector('[data-act="close"]').addEventListener('click', close);
    root.querySelector('[data-act="reset"]').addEventListener('click', reset);
    sendBtn.addEventListener('click', function () { send(input.value); });
    input.addEventListener('input', function () { autosize(); refreshSend(); });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
        e.preventDefault();
        send(input.value);
      }
    });
    root.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (tray.classList.contains('show')) { closeTray(); e.stopPropagation(); return; }
      if (isOpen) close();
    });
    root.addEventListener('click', function (e) {
      if (!tray.classList.contains('show')) return;
      var path = e.composedPath ? e.composedPath() : [];
      if (path.indexOf(tray) === -1 && path.indexOf(emoBtn) === -1) closeTray();
    });

    /* início */
    load();
    renderAll();
    document.body.appendChild(host);

    if (o.teaser && history.length === 0) {
      teaser.textContent = o.teaser;
      teaserTimer = setTimeout(function () {
        if (isOpen) return;
        teaser.classList.add('show');
        setBadge(1);
      }, o.teaserDelay);
    }

    return {
      open: open, close: close, toggle: toggle, reset: reset, send: send, rain: rain, receive: receive, clear: clear,
      suggest: function(items){chipList=items;renderChips();},
      destroy: function () { clearTimeout(teaserTimer);window.visualViewport?.removeEventListener('resize',resizeViewport);host.remove(); }
    };
  }

  /* ---------- API pública ---------- */
  var instance = null;
  var api = {
    init: function (opts) {
      if (instance) instance.destroy();
      var start = function () { instance = create(opts); return instance; };
      if (document.body) return start();
      document.addEventListener('DOMContentLoaded', start);
    },
    receive: function (items) { instance && instance.receive(items); },
    clear: function () { instance && instance.clear(); },
    suggest: function (items) { instance && instance.suggest(items); },
    open: function () { instance && instance.open(); },
    close: function () { instance && instance.close(); },
    toggle: function () { instance && instance.toggle(); },
    reset: function () { instance && instance.reset(); },
    send: function (t) { instance && instance.send(t); },
    rain: function () { instance && instance.rain(); },
    destroy: function () { if (instance) { instance.destroy(); instance = null; } }
  };
  window.ChatWidget = api;

  /* auto-init via atributos data-* na tag <script> */
  var cs = document.currentScript;
  if (cs && (cs.hasAttribute('data-auto') || cs.dataset.endpoint || cs.dataset.name)) {
    var d = cs.dataset;
    var opts = {};
    ['name', 'subtitle', 'avatar', 'accent', 'accent2', 'theme', 'position', 'greeting', 'teaser',
      'placeholder', 'endpoint', 'brandLine'].forEach(function (k) {
      if (d[k] !== undefined) opts[k] = d[k];
    });
    if (d.suggestions) opts.suggestions = d.suggestions.split('|').map(function (s) { return s.trim(); }).filter(Boolean);
    api.init(opts);
  }
})();
