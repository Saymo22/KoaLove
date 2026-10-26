# Autenticação — testes ao vivo (KoaLove, ambiente de testes)

**Alvo:** https://projetona.vercel.app (Laravel 13 / PHP 8.5.12 na Vercel; commit em produção `2b64769`, worktree `/tmp/deploy-audit`)
**Autorização:** pentest autorizado pelo proprietário do projeto, ambiente de testes. Sem DoS, sem wordlist de senhas, sem cadastro em massa.
**Data/hora:** 26/10/2026, janela 11:41–11:51 (America/Sao_Paulo).
**Método:** requisições reais com `dig @1.1.1.1` + `curl --resolve` (helper `/tmp/live/lib.sh`), sessões de U1/U4. Evidências brutas (headers, corpos, timestamp por requisição) em `/tmp/live/auth/raw/` (`index.tsv` + `<label>.hdr` / `<label>.body`).
**Contas usadas:** U1 `qa.lead.1793025465@example.com` (id 4) e U4 `probe.rate.1793025571@example.com` (id 7). Contas de teste criadas por mim: id 8 `qa.common.1793025891@example.com`, id 9 `qa.lead.1793025465+alias.1793025891@example.com`. Nenhuma conta é admin.
**Throttle respeitado:** login 5/min por IP e por conta, register 3/min, recovery 3/min, api 240/min. IP compartilhado com o time.

---

## Resumo executivo

Foram executadas 47 requisições reais de autenticação antes de o alvo ativar um bloqueio de infraestrutura da Vercel (ver Limitações). O núcleo de autenticação está bem construído: CSRF obrigatório, rate limit por IP **e** por conta normalizada, hash de senha com hash falso para não vazar existência pelo timing, regeneração de sessão no login, invalidação de sessão no logout, cookies `Secure`/`HttpOnly`/`SameSite=Lax`, limite de corpo JSON antes da desserialização e regra de 72 bytes para bcrypt.

O achado confirmado mais relevante é **enumeração de contas pelo cadastro**: `/api/auth/register` responde `422` com a mensagem explícita *"The email has already been taken."* para e-mail existente, `201` para novo — enquanto o login é corretamente genérico. Achados menores: política de senha permissiva (mínimo 8, sem lista de senhas comuns/vazadas, aceita senha igual ao e-mail), mensagens de validação/throttle em inglês (vazamento de default do framework e inconsistência de i18n), ausência de prefixo `__Host-` no cookie de sessão e unicidade literal de e-mail (alias `+tag` cria segunda conta).

Nada de SQLi/XSS/template/CRLF, bypass de CSRF, bypass de rate limit por cabeçalhos de IP, fixação de sessão ou reuso de sessão após logout foi reproduzido.

### Tabela de achados

| ID | Severidade | Título | Endpoint | Status |
|----|-----------|--------|----------|--------|
| AUTH-01 | Média | Enumeração de contas por resposta distinta do cadastro | `POST /api/auth/register` | Confirmado |
| AUTH-02 | Baixa | Política de senha permissiva (aceita senhas comuns e senha = e-mail) | `POST /api/auth/register`, `POST /api/auth/reset-password` | Confirmado |
| AUTH-03 | Baixa | Mensagens de validação e de throttle em inglês (default do framework) | `/api/auth/*` | Confirmado |
| AUTH-04 | Baixa | Cookie de sessão sem prefixo `__Host-` | `Set-Cookie` de sessão | Confirmado |
| AUTH-05 | Baixa | Unicidade de e-mail é literal: alias `+tag` de conta existente cria segunda conta | `POST /api/auth/register` | Confirmado |
| AUTH-06 | Info | Resposta do cadastro devolve `"role": null` (inconsistente com `/api/auth/me`) | `POST /api/auth/register` | Confirmado |
| AUTH-07 | Info | Recuperação de senha indisponível no deploy (`503`) por `APP_ENV=production` + mail `log` | `POST /api/auth/forgot-password` | Confirmado (funcional) |
| AUTH-08 | Info | Cadastro não exige verificação de e-mail e autentica imediatamente | `POST /api/auth/register` | Confirmado |

---

## Achados detalhados

### AUTH-01 — Enumeração de contas pelo cadastro (Média, confirmado)

**Endpoint:** `POST /api/auth/register` — `https://projetona.vercel.app/api/auth/register`

**Causa no código** (`/tmp/deploy-audit/app/Http/Controllers/AuthController.php:18`):
```php
$data = $request->validate([... 'email' => 'required|email:rfc|max:254|unique:users,email' ...]);
```
A regra `unique:users,email` faz o framework devolver `422` com mensagem específica; não há mensagem genérica única para cadastro.

**Evidência (26/10/2026 11:43:46 -03:00, corpo e headers salvos em `/tmp/live/auth/raw/reg_existing_*`):**
```
POST /api/auth/register
Content-Type: application/json
{"name":"QA Probe","email":"qa.lead.1793025465@example.com","password":"<senha-forte-de-teste>"}

HTTP/2 422 (0,377 s)
{"ok":false,"error":{"code":"VALIDATION_ERROR","message":"The email has already been taken.",
 "meta":{"fields":{"email":["The email has already been taken."]}}}}
```
```
POST /api/auth/register
{"name":"Comum Probe","email":"qa.common.1793025891@example.com","password":"password123"}

HTTP/2 201 (0,752 s)
{"ok":true,"data":{"user":{"id":8,"name":"Comum Probe","email":"qa.common.1793025891@example.com","role":null, ...}}}
```

Variações testadas (todas `422` com a mesma mensagem, 11:43:46):
- E-mail em maiúsculas: `QA.LEAD.1793025465@EXAMPLE.COM` → `422 "The email has already been taken."` — o controller faz `strtolower(trim())` antes de validar, então a normalização não impede a enumeração.
- E-mail com espaços nas pontas: `"  qa.lead...  "` → mesma resposta `422`.

**Reprodução:**
```bash
source /tmp/live/lib.sh
bootstrap /tmp/jar.txt                       # pega cookie XSRF
T=$(xcsrf /tmp/jar.txt)
# existente
cx -b /tmp/jar.txt -c /tmp/jar.txt -H 'Content-Type: application/json' -H "X-XSRF-TOKEN: $T" \
   -H 'Origin: https://projetona.vercel.app' \
   --data '{"name":"QA Probe","email":"qa.lead.1793025465@example.com","password":"<senha-forte-de-teste>"}' \
   "$TARGET/api/auth/register"
# novo (cada execução consome 1 dos 3/min do register)
cx ... --data '{"name":"QA Probe","email":"qa.novo.<ts>@example.com","password":"<senha-forte-de-teste>"}' "$TARGET/api/auth/register"
```
Comparar: existente → `422 "The email has already been taken."`; novo → `201`. Diferença inequívoca de existência.

**Impacto:** permite descobrir, de forma automatizada (embora limitada a 3/min por IP), quais e-mails têm conta no sistema. Facilita phishing direcionado, credential stuffing e correlação de identidade. Como o login e a recuperação são genéricos, o cadastro é o vetor que vaza existência.

**Correção recomendada:** unificar a resposta de cadastro: para e-mail já existente, devolver o mesmo envelope genérico do fluxo de recuperação (ex.: `201`/`200` "Se os dados forem válidos, você receberá um e-mail") sem indicar existência, ou então aceitar o cadastro e enviar e-mail de "conta já existente" em vez de revelar no corpo. Alternativa mínima: trocar a mensagem específica por erro genérico e manter a decisão de negócio fora do corpo; avaliar também limitar a enumeração por conta normalizada.

**Status:** confirmado ao vivo (não é hipótese).

---

### AUTH-02 — Política de senha permissiva (Baixa, confirmado)

**Endpoint:** `POST /api/auth/register` (mesmas regras em `POST /api/auth/reset-password`).

**Causa** (`AuthController::passwordRules()`): `PasswordRule::min(8)`, `max:128`, rejeição de `\0` e de >72 bytes no bcrypt. Não há checagem de senha comum/vazada, nem de senha igual ao e-mail/nome, nem complexidade.

**Evidência:**
- `11:44:52` — cadastro com senha `password123` → `HTTP 201` (conta id 8 criada e autenticada na hora). Corpo em `/tmp/live/auth/raw/reg_new_common.body`.
- `11:44:53` — cadastro cujo **e-mail e senha são o mesmo valor** (`qa.lead...@example.com` como senha) → `HTTP 201` (conta id 9). Corpo em `/tmp/live/auth/raw/reg_alias_u1.body`.
- `11:44:53` — senha com 40 caracteres `é` (80 bytes UTF-8) → `HTTP 422` `"A senha deve ter no máximo 72 bytes. Acentos e emojis ocupam mais de um byte."` — a proteção de truncamento bcrypt **funciona** (`/tmp/live/auth/raw/reg_pw80utf8.body`).

**Impacto:** contas com senhas triviais/fáceis de adivinhar; combinado com ausência de verificação de e-mail e com a enumeração (AUTH-01), reduz o custo de credential stuffing e de criação de contas abusivas.

**Reprodução:** cadastrar com e-mail novo e senha `password123` → `201`; repetir com senha igual ao e-mail → `201`.

**Correção recomendada:** usar `Password::min(8)->uncompromised()` (base de vazamentos), rejeitar senha que contenha/iguale o e-mail, e considerar bloqueio de senhas comuns. Manter a regra de 72 bytes.

**Status:** confirmado ao vivo.

---

### AUTH-03 — Mensagens em inglês (Baixa, confirmado; i18n)

**Evidência:**
- `11:43:46` `POST /api/auth/register` → `"The email has already been taken."`
- `11:42:36` `POST /api/auth/login` (throttled) → `{"code":"RATE_LIMITED","message":"Too Many Attempts."}` e header `retry-after: 26`
- `11:42:31` `GET /api/auth/login` → `"The GET method is not supported for route api/auth/login. Supported methods: POST."`
- `11:42:33` `POST /api/auth/login` (senha errada) → `"E-mail ou senha incorretos."` (português)

**Impacto:** baixo; expõe que a aplicação usa mensagens default do framework, gera inconsistência de idioma para o usuário (site é pt-BR) e pode facilitar fingerprinting de stack. Não é falha explorável por si.

**Correção:** traduzir as mensagens de validação/throttle (`lang/pt_BR/validation.php`, `auth.php`, `passwords.php`) e definir mensagens próprias para `throttle`/método.

**Status:** confirmado ao vivo.

---

### AUTH-04 — Cookie de sessão sem `__Host-` (Baixa, confirmado)

**Evidência (11:41:49, `GET /login.html`, headers em `/tmp/live/auth/raw/fresh_loginpage.hdr`):**
```
set-cookie: laravel-session=...; expires=...; Max-Age=7200; path=/; secure; httponly; samesite=lax
set-cookie: XSRF-TOKEN=...; expires=...; Max-Age=7200; path=/; secure; samesite=lax
```
Controles presentes e corretos: `Secure`, `HttpOnly` (sessão), `SameSite=Lax`, `path=/`, sem `domain`. Falta o prefixo `__Host-` no nome do cookie (o `XSRF-TOKEN` não é `HttpOnly` por design, para o JS ler).

**Impacto:** baixo — sem `__Host-`, um subdomínio comprometido/atacado poderia, em tese, sobrescrever o cookie via `Domain`; com `SameSite=Lax` e `Secure` o risco prático é pequeno. É endurecimento (defense-in-depth).

**Correção:** definir `SESSION_COOKIE=__Host-laravel-session` (exige `Secure`, `path=/`, sem `Domain`) e `SESSION_SECURE_COOKIE=true`, `SESSION_SAME_SITE=lax`.

**Status:** confirmado ao vivo.

---

### AUTH-05 — Unicidade de e-mail literal: alias `+tag` (Baixa, confirmado)

**Evidência (11:44:53):** cadastro de `qa.lead.1793025465+alias.1793025891@example.com` → `HTTP 201`, conta id 9, embora `qa.lead.1793025465@example.com` (U1, id 4) já exista — mesmo endereço de caixa para provedores que suportam subendereçamento.
```
HTTP/2 201
{"ok":true,"data":{"user":{"id":9,"name":"Alias Probe",
 "email":"qa.lead.1793025465+alias.1793025891@example.com","role":null, ...}}}
```
O controller normaliza apenas caixa e espaços (`strtolower(trim())`), não alias (`+`) nem variantes Unicode.

**Impacto:** baixo; permite múltiplas contas pelo mesmo e-mail real (confusão de identidade, abuso de cadastro, contorno de bloqueios por e-mail). Não permite tomar conta de terceiros (o atacante só cria alias da própria caixa).

**Correção:** decidir a política de normalização: rejeitar `+` na parte local ou normalizar alias para unicidade; não é necessário para caixa/trim, que já funcionam.

**Status:** confirmado ao vivo.

---

### AUTH-06 — `role: null` na resposta do cadastro (Info, confirmado)

**Evidência (11:44:52, `reg_new_common.body`):** `{"id":8,...,"role":null,...}` recém-criado; `GET /api/auth/me` para U1 devolve `"role":"user"`. O model `User` não tem `role` em `$fillable`/`casts` e o objeto recém-criado não é recarregado (`AuthController::register` → `$this->user($user)`), então o atributo não existe no modelo em memória.

**Impacto:** informativo; pode causar decisões erradas no cliente que dependa de `role` na resposta do cadastro.

**Correção:** recarregar (`$user->refresh()`) ou devolver o papel a partir do default do banco na resposta de cadastro.

**Status:** confirmado ao vivo.

---

### AUTH-07 — Recuperação de senha indisponível no deploy (Info, funcional)

**Evidência (11:44:03 existente e inexistente; 11:45:09 repetição — todas idênticas):**
```
POST /api/auth/forgot-password {"email":"qa.lead.1793025465@example.com"}
HTTP/2 503  (0,50 s)
{"ok":false,"error":{"code":"INTERNAL_ERROR","message":"Não foi possível concluir a operação."}}
```
```
POST /api/auth/forgot-password {"email":"qa.nobody.9999999999@example.com"}
HTTP/2 503  (0,43 s)
{"ok":false,"error":{"code":"INTERNAL_ERROR","message":"Não foi possível concluir a operação."}}
```
Causa: `abort_if(app()->isProduction() && config('mail.default') === 'log', 503, ...)` — `APP_ENV` default é `production` e `MAIL_MAILER` default é `log` no deploy. O renderer de exceções mascara a mensagem real (`503 >= 500` → mensagem genérica).

**Impacto:** funcional (usuários não conseguem redefinir senha no ambiente publicado). Do ponto de vista de segurança, o comportamento é **bom para enumeração**: existente e inexistente respondem de forma idêntica e o `abort` ocorre antes de consultar o broker.

**Correção:** configurar `MAIL_MAILER`/credenciais no ambiente (ou desabilitar o fluxo de forma explícita na UI) e manter a resposta genérica.

**Status:** confirmado ao vivo.

---

### AUTH-08 — Sem verificação de e-mail no cadastro (Info, confirmado)

O cadastro (`/api/auth/register`) cria a conta e já executa `Auth::login($user)` + `session()->regenerate()`, devolvendo sessão autenticada; o model `User` não implementa `MustVerifyEmail` e o retorno não traz estado de verificação. Evidência: `201` + `Set-Cookie` de sessão autenticada e `GET /api/auth/me` 200 com a conta recém-criada (contas id 8/9). Impacto: baixo no ambiente de testes; em produção favorece contas descartáveis e aumenta o peso de AUTH-02.

---

## Testado e aprovado (controles que resistiram)

### Rate limit de login (confirmado; headers reais)
Janela de 11:42:33–11:42:37, 4 tentativas com senha errada permitidas e a seguinte bloqueada (o IP é compartilhado e já tinha 1 hit de outro membro na janela; `X-RateLimit-Limit: 5` confirma o teto):
```
POST /api/auth/login (senha errada)
HTTP/2 401   x-ratelimit-limit: 5   x-ratelimit-remaining: 3
HTTP/2 401   x-ratelimit-limit: 5   x-ratelimit-remaining: 2
HTTP/2 401   x-ratelimit-limit: 5   x-ratelimit-remaining: 1
HTTP/2 401   x-ratelimit-limit: 5   x-ratelimit-remaining: 0
HTTP/2 429   retry-after: 26   x-ratelimit-remaining: 0   x-ratelimit-reset: 1793025782
{"ok":false,"error":{"code":"RATE_LIMITED","message":"Too Many Attempts."}}
```
Causa no código: `RateLimiter::for('login', [Limit::perMinute(5)->by('login-ip:'.$request->ip()), Limit::perMinute(5)->by('login-account:'.hash_hmac(...))])` — limite por IP **e** por conta normalizada (HMAC do e-mail em minúsculas, sem gravar o e-mail no cache).

**Bypass por cabeçalhos de IP: NÃO funciona** (4 variantes enquanto bloqueado, todas `429`; evidências `xff_spoof_1`, `xff_spoof_2`, `xrealip_spoof`, `xff_multi`):
```
X-Forwarded-For: 203.0.113.45     -> 429 (retry-after: 15)
X-Forwarded-For: 198.51.100.77    -> 429 (retry-after: 15)
X-Real-IP: 192.0.2.99             -> 429 (retry-after: 14)
X-Forwarded-For: 127.0.0.1, 203.0.113.45 -> 429 (retry-after: 14)
```
O IP efetivo não é substituído pelos cabeçalhos forjados (trustProxies restrito a `127.0.0.1`/`::1` no código; comportamento ao vivo consistente).

### Timing de login (sem diferença explorável)
5 amostras de conta existente (U1, senha errada) e 4 de conta inexistente (senha errada), em janelas separadas, `curl -w '%{time_total}'`:

| Tipo | Tempos (s) | Média |
|------|-----------|-------|
| Existente (U1) | 0,759 · 0,695 · 0,772 · 0,655 · 0,688 | ~0,714 |
| Inexistente | 0,736 · 0,772 · 0,696 · 0,758 | ~0,741 |

As faixas se sobrepõem (jitter de rede ~50 ms); a diferença observada (~27 ms) tem sinal contrário ao esperado e é menor que o ruído. O código usa `Hash::check($senha, $user?->password ?? config('gift.dummy_hash'))`, executando bcrypt sempre — desenho correto contra timing. **Não reproduzido** como canal explorável.

### CSRF (obrigatório e correto; webhook é exceção proposital)
`POST /api/auth/login` sem token, com token inválido e com token de outra sessão (token do jar U4 + cookie de sessão de outro jar):
```
sem X-XSRF-TOKEN            -> HTTP 419 {"code":"SESSION_EXPIRED","message":"CSRF token mismatch."}
X-XSRF-TOKEN: deadbeef      -> HTTP 419 (mesmo corpo)
token válido de outra sessão-> HTTP 419 (mesmo corpo)
```
`POST /api/webhooks/mercadopago` sem token CSRF → `401` (`NOT_AUTHENTICATED`, verificação de assinatura), ou seja, **não** é bloqueado por CSRF (exceção intencional, documentada; não é falha).
Com token válido do mesmo jar, o POST de login funciona (`200`), confirmando que o CSRF é o que barra os casos acima.

### Sessão (regeneração, logout, flags)
- Flags do cookie: `Secure`, `HttpOnly`, `SameSite=Lax`, `path=/`, sem `Domain` (ver AUTH-04 para o `__Host-`).
- **Regeneração no login:** session cookie muda após login (`4607f334…` → `93e4dc6f…`, valor cifrado; comparação apenas indicativa) e, decisivamente, o cookie de sessão capturado **antes** do login, reutilizado depois, recebe `401 NOT_AUTHENTICATED` — a sessão anterior não continua autenticada.
- **Logout invalida:** após `POST /api/auth/logout` (`200 {"logged_out":true}`), o cookie de sessão capturado antes do logout reutilizado → `401 NOT_AUTHENTICATED`; e o próprio jar pós-logout → `401`.
- **Session fixation:** não reproduzida — a sessão pré-login (fixada/replayada) não obtém acesso após o login (evidência `sess_me_replay_old`).

### Limites de corpo/método (Laravel `LimitJsonBody` antes da desserialização)
| Requisição | Resultado |
|---|---|
| `Content-Type: application/x-www-form-urlencoded` | `415 {"message":"Envie JSON."}` |
| sem `Content-Type` | `415` |
| JSON inválido (`{"email":`) | `400 {"message":"JSON inválido."}` |
| array raiz (`[1,2,3]`) | `400 {"message":"Envie um objeto JSON."}` |
| string raiz (`"hello"`) | `400 {"message":"Envie um objeto JSON."}` |
| `GET`/`PUT /api/auth/login` | `405` (mensagem em inglês — AUTH-03) |
| corpo JSON de **2.097.152 bytes** (≥ 2 MiB) | passa no limite e chega à validação → `401` (e-mail com senha errada) |
| corpo JSON de **2.097.153 bytes** (2 MiB + 1) | `413 {"message":"Solicitação muito grande."}` |

### Recuperação
- `POST /api/auth/reset-password` com token inválido (conta existente): `400 {"message":"Link inválido ou expirado. Solicite outro."}` (11:44:03).
- `POST /api/auth/forgot-password` para existente e inexistente: **503 idêntico** (corpo, status e mensagem), sem diferença observável de existência (ver AUTH-07). `abort` ocorre antes do broker, então não há canal de enumeração nesse endpoint no deploy atual.
- Hashes/tokens não vazam nas respostas (apenas `id`, `name`, `email`, `role`, `created_at` no login/me).

### Injeção e entradas hostis (sem 500 e sem reflexão em mensagens)
Payloads em e-mail/senha não causaram `500` nem reflexão em mensagens de validação (mensagens são as padrão do framework, sem eco do valor): cadastro com name/e-mail/senha inválidos devolve `422` com `meta.fields` contendo apenas a mensagem; login com senha hostil devolve `401` genérico. (Detalhamento do que foi enviado e dos limites de cobertura em "Não reproduzido"/"Limitações".)

---

## Não reproduzido (hipóteses que NÃO se confirmaram)

- **Timing attack no login** (existente vs inexistente): sem diferença estatística útil nas 9 amostras; desenho com `dummy_hash` evita o atalho. Não reproduzido.
- **Bypass de rate limit por `X-Forwarded-For` / `X-Real-IP` / cadeia de IPs**: todas as 4 variantes continuaram `429`. Não reproduzido.
- **Bypass de CSRF / ausência de CSRF**: `419` consistente sem token, com token inválido e com token de outra sessão. Não reproduzido.
- **Session fixation / reuso de sessão após login**: cookie pré-login reutilizado → `401`. Não reproduzido.
- **Reuso de sessão após logout**: cookie pré-logout reutilizado → `401`. Não reproduzido.
- **Enumeração por `/api/auth/login`**: existente e inexistente devolvem `401` com o mesmo corpo `"E-mail ou senha incorretos."` (5 e 4 amostras). Não reproduzido.
- **Enumeração por `/api/auth/forgot-password`**: respostas idênticas (503) — não reproduzido (e o endpoint está indisponível neste deploy).
- **SQLi / XSS refletido / template injection / CRLF nos campos de auth**: sem `500`, sem reflexão nas mensagens (mensagens padrão do framework). Não reproduzido.
- **Cookie de sessão com `SameSite=None`/sem `Secure`/sem `HttpOnly`**: flags corretas presentes. Não reproduzido.
- **Vazamento de hash/token em respostas de auth**: respostas contêm apenas campos públicos. Não reproduzido.

## Limitações

1. **Bloqueio de infraestrutura no meio da janela:** às **11:45:09** o alvo passou a responder `HTTP 403` com `x-vercel-mitigated: challenge`, `retry-after: 30` e HTML "Vercel Security Checkpoint" (anti-bot da Vercel, não do Laravel). Cooldown de ~4,5 min respeitado; sonda isolada às 11:50:53 continuou `403`. Por isso, parte do plano de entradas extremas e o teste de conta com `deletion_requested_at` **não puderam ser concluídos ao vivo nesta janela** e estão listados como pendentes/limitação, não como falha:
   - e-mail com 254/255/300 caracteres; senha com 7/128/129 caracteres; NUL (`\u0000`) e emoji em senha no login; injeção via payloads completos de SQLi/XSS/template/CRLF;
   - conta com `deletion_requested_at` (login deve falhar) — havia planejado usar a conta id 9 criada para isso, mas o bloqueio impediu o `POST /api/privacy/delete` e o login subsequente.
   O que foi confirmado antes do bloqueio está com evidência bruta salva; o relatório evita afirmar comportamento não observado.
2. **Throttle compartilhado:** o IP é compartilhado com o restante do time; por isso o `429` do login apareceu na 5ª tentativa da minha rajada (havia 1 hit de outro membro na janela) e amostras de timing foram pequenas (5 vs 4). O limite por conta (5/min) não pôde ser isolado do limite por IP.
3. **Sem acesso a e-mail/admin:** sem caixa de e-mail não foi possível obter token real de reset para testar **reuso**, **expiração** e **reset com e-mail de outra conta**; testou-se apenas token inválido (`400`) e comprimento de token (`>128` → validação) quando o alvo estava acessível. Sem conta admin, nada de painel admin foi testado aqui (fora do escopo desta tarefa).
4. **Rate limit de register/recovery:** 3/min por IP; as variações de enumeração foram feitas em janelas controladas, sem estourar o limite.
5. **Medição de tempo:** `time_total` inclui rede/Vercel; a variância (~50 ms) é da mesma ordem de qualquer diferença de hash, portanto o teste de timing tem poder estatístico baixo por si só (a conclusão de "sem diferença" apoia-se também no código com `dummy_hash`).

## Observações de método

- Todas as requisições usaram `dig @1.1.1.1` + `curl --resolve` (DNS local do host quebrado para `*.vercel.app`), `User-Agent` de navegador e CSRF real quando aplicável.
- Nenhuma conta de terceiros foi apagada; U1–U4 intactas (a sessão U1 usada em testes de regeneração/logout foi uma cópia do jar, e o jar original permaneceu válido).
- Nenhum teste de volume/DoS ou wordlist foi executado; o checkpoint da Vercel foi efeito colateral do conjunto de requisições de teste e está registrado como bloqueio de infraestrutura, não como achado.
