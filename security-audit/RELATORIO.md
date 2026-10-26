# Relatório consolidado — auditoria de segurança do ambiente de testes

**Alvo:** https://projetona.vercel.app
**Stack observada:** Laravel 13 + PHP 8.5.12 (Vercel) + Supabase Storage (bucket privado) + Mercado Pago
**Código em produção:** commit `2b64769` — branch `origin/codex/account-and-gift-ui-fixes` (worktree `/tmp/deploy-audit`)
**Data:** 26/10/2026
**Autorização:** solicitada e confirmada pelo proprietário do projeto; escopo restrito ao ambiente de testes e ao Supabase do próprio projeto.
**Relatórios de módulo:** [live-auth.md](live-auth.md) · [live-access.md](live-access.md) · [code-audit.md](code-audit.md)

> **Critério de evidência:** cada linha tem status explícito. **Confirmado ao vivo** = reproduzido com request/resposta reais.
> **Estático** = lido no código do deploy, sem teste ao vivo. **Não testado** = bloqueado por infraestrutura/credencial — nunca é tratado como falha.

---

## 1. Sumário executivo

- **Nenhuma vulnerabilidade crítica ou alta foi confirmada.** Os controles centrais estão bem construídos: IDOR, CSRF, autorização de mídia, upload privado, preço/status/owner vindos do corpo, assinatura de webhook, rate limit e regeneração de sessão resistiram.
- **1 achado médio confirmado ao vivo:** enumeração de contas pelo cadastro (`/api/auth/register` devolve 422 para e-mail existente e 201 para novo).
- **1 achado médio operacional confirmado:** o ambiente de **testes** está com Mercado Pago em modo **live** (`/api/config` → `payments.live=true`), com risco de cobrança real.
- **1 achado médio condicionado (estático, não provado ao vivo):** um admin de nível `support` pode ler compras e `share_token` de terceiros por duas rotas fora do allowlist do painel.
- **1 achado médio de processo:** o deploy de produção/testes roda um branch **não mesclado** no `main` (2b64769 vs. 0c5dc36), contrariando o fluxo do próprio projeto.
- **Dependências:** `composer audit --locked` e `npm audit` → **zero CVEs** nas versões travadas em 26/10/2026.
- **~47 requisições de auth + ~60 de autorização/infra** foram executadas; nenhum dado de terceiros foi exposto e nenhuma conta de terceiros foi apagada. Contas descartáveis criadas estão listadas no Anexo B para limpeza.

---

## 2. Tabela consolidada de achados

| ID | Severidade | Status | Achado | Onde |
|----|-----------|--------|--------|------|
| **AUTH-01** | **Média** | **Confirmado ao vivo** | Enumeração de e-mails no cadastro: existente → `422 "The email has already been taken."`; novo → `201` | `POST /api/auth/register` |
| **OPS-01** | **Média** | **Confirmado ao vivo (config)** | Mercado Pago `live=true` e credenciais reais no ambiente de testes; risco de cobrança real | `/api/config` → `payments` |
| **CODE-01** | **Média (condicionada)** | Estático — **não testado ao vivo** | Admin `support` lê `project()` de qualquer compra via `GET /api/purchases/{id}` e `/api/admin/clients/{user}`, incluindo `share_token` | `PurchasePolicy.php:10-13`, `Administrator.php:15-17`, `AdminController.php:39-44` |
| **OPS-02** | **Média (processo)** | Confirmado (git) | Deploy não corresponde ao `main`; branch `codex/account-and-gift-ui-fixes` sem merge | `2b64769` × `0c5dc36` |
| **AUTH-02** | Baixa | **Confirmado ao vivo** | Política de senha permissiva: aceita `password123` e senha igual ao e-mail; sem checagem de vazamento | `register` / `reset-password` |
| **AUTH-03** | Baixa | **Confirmado ao vivo** | Mensagens de validação/throttle em inglês (default do framework) | `/api/auth/*` |
| **AUTH-04** | Baixa | **Confirmado ao vivo** | Cookie de sessão sem prefixo `__Host-` | `Set-Cookie` |
| **AUTH-05** | Baixa | **Confirmado ao vivo** | Unicidade de e-mail literal: `+alias` de conta existente cria segunda conta | `POST /api/auth/register` |
| **ACL-01** | Baixa | **Confirmado ao vivo** | 404 devolve classe interna do model e padrão de rota (`No query results for model [App\Models\Purchase] …`) | `bootstrap/app.php:49` |
| **ACL-02** | Baixa | **Confirmado ao vivo** | `complete-upload` sem objeto enviado → `500 INTERNAL_ERROR` | `CloudUploadController.php:79-80` |
| **CODE-02** | Baixa | Estático | `audit_events` grava em **toda** requisição (inclusive GET público), sem filtro/limite e sem `try/catch` | `SecurityHeaders.php:34` |
| **CODE-03** | Baixa | Estático | Webhook valida HMAC, mas não a janela temporal do `ts` → replay de notificação capturada | `MercadoPagoCheckout.php:97-109` |
| **AUTH-06** | Info | **Confirmado ao vivo** | Cadastro devolve `"role": null` (inconsistente com `/api/auth/me`) | `POST /api/auth/register` |
| **AUTH-07** | Info (funcional) | **Confirmado ao vivo** | Recuperação de senha indisponível no deploy (`503`, mail `log` + `APP_ENV=production`) | `POST /api/auth/forgot-password` |
| **AUTH-08** | Info | **Confirmado ao vivo** | Cadastro não exige verificação de e-mail e autentica na hora | `POST /api/auth/register` |
| **ACL-03** | Info | **Confirmado ao vivo** | URL PUT assinada continua válida após `complete-upload` e recria objeto órfão | `CloudUploadController.php:54-62` |
| **CODE-08** | Info | **Confirmado ao vivo** | `/build/manifest.json` público expõe caminho interno `/vercel/path1`; sem source maps | `tools/publish-static-assets.mjs` |
| **LEAD-01** | Info | **Confirmado ao vivo** | `Access-Control-Allow-Origin: *` em `/api/*` (inclusive respostas autenticadas) | CORS do framework |
| **LEAD-02** | Info | **Confirmado ao vivo** | `X-Powered-By: PHP/8.5.12` expõe versão exata | resposta HTTP |
| ~~CODE-04~~ | — | **Refutado ao vivo** | Guarda de 72 bytes do bcrypt **funciona**: senha de 80 bytes UTF-8 → `422` | `AuthController.php:100` |

---

## 3. Detalhes dos achados confirmados

### 3.1 AUTH-01 — Enumeração de contas no cadastro (Média, confirmado)

```http
POST /api/auth/register   (e-mail novo)
HTTP/2 201  {"ok":true,"data":{"user":{"id":4,...}}}

POST /api/auth/register   (mesmo e-mail)
HTTP/2 422  {"ok":false,"error":{"code":"VALIDATION_ERROR",
            "message":"The email has already been taken.",
            "meta":{"fields":{"email":["The email has already been taken."]}}}}
```

- Também confirmado com maiúsculas/espaços (normalização) e com `+alias` (AUTH-05).
- **Impacto:** permite descobrir se um e-mail tem conta sem autenticar, habilitando phishing direcionado e credential stuffing. Combinado com AUTH-02/AUTH-08, reduz o custo de ataque.
- **Correção:** responder sempre de forma genérica (ex.: `202 Accepted` com “Se o e-mail puder ser cadastrado, você receberá instruções”), enviar o e-mail de confirmação e manter o fluxo de verificação; não diferenciar status nem mensagem. Alinhar o tempo de resposta.
- Evidência: `/tmp/live/auth/raw/reg_*.body`; detalhes em [live-auth.md](live-auth.md#auth-01--enumeração-de-contas-pelo-cadastro-média-confirmado).

### 3.2 OPS-01 — Mercado Pago live no ambiente de testes (Média, confirmado via config)

`GET /api/config` retorna:

```json
"payments":{"provider":"mercadopago","configured":true,"live":true},"simulation":false
```

- **Impacto:** o ambiente de testes não está em modo sandbox. Qualquer pagamento concluído ali é **cobrança real**; além disso, o webhook de produção fica exposto no domínio de testes.
- **Correção antes de novos testes:** usar credenciais de sandbox (`MERCADOPAGO_*`/`PAYMENT_*` de teste) e/ou `SIMULATED_PAYMENTS=true`; manter `live=false` fora de produção de clientes. Restringir quem acessa o ambiente.
- **Relacionado:** a senha do admin fornecida é curta/numérica e o painel não exige MFA — rotacionar e habilitar 2FA antes de produção (sem registrar o valor aqui).

### 3.3 ACL-01 — 404 vaza estrutura interna (Baixa, confirmado)

```
GET /api/purchases/p_AAAA…   → 404 "No query results for model [App\Models\Purchase] p_AAAA…"
GET /api/shared/0123…        → 404 "The route api/shared/0123… could not be found."
```

- **Impacto:** *fingerprinting* de framework/rotas e diferença de mensagem entre recurso existente e inexistente; sem vazamento de dados de terceiros.
- **Correção:** em `bootstrap/app.php`, mapear 404/403 para mensagem genérica (`NOT_FOUND`), preservando detalhe só no log interno.

### 3.4 ACL-02 — 500 controlável no upload (Baixa, confirmado)

Reserva `upload-url` (`200`) → `complete-upload` sem PUT prévio → `500 INTERNAL_ERROR`.

- **Impacto:** o dono gera erros 500 sintéticos (ruído, alertas, custo de log). Sem vazamento ou efeito entre contas.
- **Correção:** capturar `UnableToCheckFileExistence`/`UnableToReadFile` e responder `409/422` (“objeto ainda não enviado”).

### 3.5 AUTH-02 — Política de senha fraca (Baixa, confirmado)

Cadastro com `password123` → `201`; senha igual ao e-mail → `201`. A regra de 72 bytes (bcrypt) **funciona** e rejeita 80 bytes UTF-8 com `422`.
**Correção:** `Password::min(8)->uncompromised()`, rejeitar senha contendo/igual ao e-mail e ao nome; manter o limite de bytes. (Sem MFA no admin — ver OPS-01.)

### 3.6 Demais confirmados (Baixa/Info)

- **AUTH-03:** mensagens padrão do framework em inglês (`Too Many Attempts.`, `The email has already been taken.`) em app pt-BR.
- **AUTH-04:** `laravel-session` sem prefixo `__Host-`; flags `Secure`/`HttpOnly`/`SameSite=Lax` corretas.
- **AUTH-05:** `conta+alias@dominio` cria segunda conta da mesma caixa de e-mail.
- **ACL-03:** replay do PUT assinado até expirar (~5 min) e novo `complete` → `200`; objeto órfão no bucket privado, sem acesso anônimo (S3 → `403`).
- **CODE-08:** `GET /build/manifest.json` → `200` com `/vercel/path1`; sem `.map`, sem `.env`, sem logs.
- **LEAD-01:** `Access-Control-Allow-Origin: *` nas APIs (sem `Allow-Credentials`; não permite leitura autenticada cross-origin, mas é endurecimento pendente).
- **LEAD-02:** `X-Powered-By: PHP/8.5.12`.

---

## 4. Achados estáticos que ainda precisam de prova (sem tratá-los como fato)

### CODE-01 (Média condicionada) — fronteira de autorização entre níveis de admin

- `PurchasePolicy::view()` aceita **qualquer** `role === 'admin'` sem olhar `admin_level`.
- `Administrator` bloqueia `api/admin/purchases`/`workspace` para `support`, mas **duas rotas fora do allowlist** entregam os mesmos dados:
  - `GET /api/purchases/{purchase}` (com `withTrashed()`) → `project()` com conteúdo e `share_token`;
  - `GET /api/admin/clients/{user}` (permitida para `support`) → lista de compras do cliente com `project()` completo.
- **Status:** não testado ao vivo (não havia conta `support`). **Não é falha anônima**; requer conta admin de nível suporte.
- **Correção:** aplicar `admin_level` na policy (somente `owner`/`manager` leem compras de terceiros) e remover `purchases`/`share_token` do detalhe de cliente para `support`; teste de regressão com admin `support`.
- **Repro para validar (quando houver conta support):** criar admin nível `support`; com ela, `GET /api/purchases/{id_de_outro_usuario}` e `GET /api/admin/clients/{id}` → se retornarem `share_token`/conteúdo, confirmado.

### CODE-03 (Baixa) — replay de webhook

- Assinatura HMAC (`hash_equals`), reconsulta autenticada e idempotência estão corretos; falta validar `abs(now - ts) ≤ 300s` e cachear `data.id`/`x-request-id`.
- **Status:** estático; sem segredo de webhook não foi possível forjar/replay ao vivo (ausência/assinatura inválida → `401` confirmado).

### CODE-02 (Baixa) — auditoria em toda requisição

- `DB::table('audit_events')->insert(...)` no middleware global, sem filtro, limite ou `try/catch`; GET público grava no banco e falha de DB viraria 500 após o efeito.
- **Status:** estático (comportamento evidente no código; volume não foi exercitado para não gerar carga).

### CODE-04 — **refutado**

O teste ao vivo com 80 bytes UTF-8 retornou a mensagem exata da guarda (`422`), provando que ela está ativa. Registrado como errata em [code-audit.md](code-audit.md).

---

## 5. O que foi testado e **passou** (controles que resistiram)

| Área | Evidência |
|------|-----------|
| IDOR em compras | U3 lendo/alterando compra de U2 → `403`; anônimo → `401`; UUID inexistente → `404` |
| Campos forçados no corpo | `user_id`, `status`, `price_cents`, `share_token`, `deleted_at` ignorados; servidor define dono/status/preço |
| Links compartilhados | token de compra pendente → `404`; revogação imediata após delete; tokens inválidos/truncados → `404` |
| Mídia privada | outro usuário `403`, anônimo `401`, asset fora do manifesto `404`, path traversal `404`, download `302` com URL de 1 min e `no-store` |
| Upload | SVG/HTML/PHP/EXE como `image/png` → `415`; MIME fora da lista → `422`; limites 15 MiB/50 MB → `413`; caminho gerado no servidor |
| Supabase | bucket privado; S3 anônimo `403`; REST Storage anônimo sem listagem; URL assinada expira |
| Admin (barreira) | todas as rotas `/api/admin/*` como usuário comum → `403`; anônimo → `401`; shell HTML sem dados de clientes |
| Suporte | sem IDOR por ticket (consulta sempre pela sessão); payload XSS armazenado cru, porém renderizado com `textContent`/`esc()`; sem execução observada |
| Privacidade | export só da própria conta; delete com senha errada → `422` e conta permanece |
| Webhook | sem assinatura/assinatura inválida → `401` antes de qualquer mutação |
| Auth | CSRF obrigatório (`419` sem/inválido/outra sessão); rate limit 5/min IP+conta com `429` e `Retry-After`; **XFF/X-Real-IP não burlam**; sessão regenera no login e é invalidada no logout; cookie pré-login/pré-logout → `401`; `dummy_hash` elimina timing útil |
| Limites | JSON 2 MiB passa, 2 MiB+1 → `413`; form-encoded → `415`; JSON inválido → `400`; GET/PUT em POST → `405` |
| Injeção | SQLi/XSS/template/CRLF em auth sem `500` e sem reflexão |
| Dependências | `composer audit` e `npm audit` → **0 advisories** |

---

## 6. Plano de correção priorizado

### P0 — antes de qualquer uso real / produção

1. **OPS-01:** tirar Mercado Pago de `live` no ambiente de testes (sandbox ou `SIMULATED_PAYMENTS=true`); rotacionar a credencial de admin compartilhada e habilitar MFA; revisar quem tem acesso ao deploy de testes.
2. **AUTH-01:** eliminar a diferença `201` × `422` no cadastro e adotar resposta genérica + verificação de e-mail.
3. **CODE-01:** aplicar `admin_level` na leitura de compras e remover `share_token`/conteúdo do detalhe para `support`; adicionar teste com admin `support`.
4. **OPS-02:** passar a publicar somente o `main` (ou tag) após PR e CI verde, como manda o `AGENTS.md`.

### P1 — próxima janela

5. **ACL-01:** mensagens 404/403 genéricas no render de exceções.
6. **ACL-02:** tratar storage sem objeto como `409/422`, não `500`.
7. **AUTH-02:** `Password::min(8)->uncompromised()`, bloquear senha igual ao e-mail/nome, MFA para admin.
8. **AUTH-05/AUTH-08:** decidir canonicalização de aliases +tag e exigir verificação de e-mail no cadastro.

### P2 — endurecimento

9. **CODE-02:** auditar só mutações/ações sensíveis, com amostragem e `try/catch`.
10. **CODE-03:** janela de `ts` no webhook e cache de evento processado.
11. **CODE-08:** não publicar `manifest.json` (allowlist de `assets/`).
12. **LEAD-01/02:** remover `Access-Control-Allow-Origin: *` das APIs e o `X-Powered-By`.
13. **AUTH-03/04/AUTH-06/07:** i18n das mensagens, cookie `__Host-`, `role` consistente, configurar recuperação de senha (SMTP) no deploy.

---

## 7. Limitações desta auditoria (e o que NÃO foi testado)

1. **Vercel Security Checkpoint (Attack Challenge Mode):** a partir de ~11:45 o edge passou a responder `403`/`429` com `x-vercel-mitigated: challenge` a todo tráfego automatizado (inclusive `web_fetch` de outra rede), impedindo a segunda metade dos testes. Tentativas de browser headless/headful e reuso do cookie `_vcrcs` não passaram. Não é falha do Laravel. Itens bloqueados: inputs extremos de auth (e-mail 254/255/300, senha 7/129, NUL/emoji no login, payloads completos), conta com `deletion_requested_at`, e a maior parte do teste positivo do painel admin.
2. **Sem teste positivo de admin ao vivo:** as credenciais de admin chegaram após o bloqueio; só a barreira de autorização foi exercitada. CODE-01 permanece condicionado.
3. **Sem compra paga:** pagamento real é proibido; caminho positivo de `/api/shared/{token}` de compra paga e fluxo positivo de reembolso não foram exercitados (todos os negativos foram).
4. **Sem segredo de webhook:** replay de notificação legítima não testado (só ausência/assinatura inválida → `401`).
5. **Timing de login:** amostras pequenas (5×4) por causa do rate limit compartilhado; conclusão apoiada também no código (`dummy_hash`).
6. **XSS:** renderização avaliada por código (`textContent`/`esc()`) e HTTP; não houve execução em browser com sessão admin.

---

## 8. Anexos

### A. Metodologia

- Reconhecimento de headers, artefatos e bundle; identificação do commit real do deploy via `manifest.json`/assets e comparação com o git.
- Testes ao vivo com `dig @1.1.1.1` + `curl --resolve` (DNS local quebrado para `*.vercel.app`), CSRF real e sessões isoladas por conta.
- 4 agentes em paralelo (auth, autorização/IDOR/upload, código estático, infraestrutura), com escopos de escrita disjuntos e evidência bruta por requisição.
- Nenhum teste de volume/DoS, wordlist, pagamento real ou exclusão de contas de terceiros.

### B. Contas descartáveis criadas no ambiente (limpar antes de produção)

| id | e-mail | observação |
|----|--------|------------|
| 4 | qa.lead.1793025465@example.com | U1 |
| 5 | qa.lead.1793025471@example.com | U2 (dona de compra de teste `p_b6uA9…`) |
| 6 | qa.idor.b.1793025563@example.com | U3 (compra de teste soft-deleted `p_It2uV2…`) |
| 7 | probe.rate.1793025571@example.com | U4 |
| 8 | qa.common.1793025891@example.com | teste de senha fraca |
| 9 | qa.lead.1793025465+alias.1793025891@example.com | teste de alias |
| 10 | (conta `ADEMIN` vista no painel) | verificar se é seed/admin legítimo |
| — | `qa.idor.a…` | tentativa bloqueada por rate limit (não criada) |

> Uma conta administrativa adicional foi observada; identidade omitida. Sua legitimidade deve ser conferida pelo proprietário, sem exclusão automática.

### C. Evidência bruta

Arquivos de request/response ficam em `/tmp/live/auth/raw/` e `/tmp/live/ev/` (temporários). Os relatórios de módulo reproduzem os trechos essenciais. Nenhum token, senha ou cookie foi gravado nos arquivos versionados em `security-audit/`.

### D. Observação de segurança operacional

O Vercel Security Checkpoint **funcionou como proteção** durante o teste (bloqueou automação agressiva). Para futuras auditorias, o caminho recomendado é um **bypass de automação controlado** (token/regra de firewall restrita ao IP do auditor) ou janela combinada de liberação, e reativação imediata depois — em vez de desligar a proteção globalmente.
