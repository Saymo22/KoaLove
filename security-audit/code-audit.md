# Auditoria estática de código — deploy `2b64769`

**Alvo do deploy:** https://projetona.vercel.app (ambiente de testes, autorização do proprietário registrada em `README.md`)
**Código auditado:** worktree de leitura `/tmp/deploy-audit` — commit `2b64769557eb0c949be1c20dec064ef81866c0b2`, branch `origin/codex/account-and-gift-ui-fixes` (**não** o `main` local, desatualizado).
**Data:** 26/10/2026
**Método:** revisão estática arquivo:linha (PHP/Laravel 13, JS, config, migrations, tooling de deploy), `composer audit --locked`, `npm audit --package-lock-only`, reprodução local de comportamento do hasher no PHP 8.5.4 e comparação com `security-audit/live-access.md` (evidência ao vivo do time). Nenhum arquivo do worktree foi editado.

**Todos os caminhos `arquivo:linha` abaixo são relativos a `/tmp/deploy-audit`.** O `main` local em `/home/maicom/.../KoaLove` não foi usado como fonte de verdade do deploy.

## Sumário executivo

- Os controles centrais de autorização, IDOR, preço/status/owner vindos do corpo, CSRF, links compartilhados, upload privado, webhook assinado e escape de saída resistiram à revisão estática e, em sua maioria, também aos testes ao vivo (`live-access.md`).
- Foram identificados **1 achado de severidade média condicionada** (fronteira de autorização entre níveis de admin) e **7 achados de baixa severidade/informativos** de robustez, observabilidade e configuração. **Nenhuma vulnerabilidade crítica ou alta foi confirmada estaticamente.**
- Não há CVE conhecida nas versões travadas em `composer.lock`/`package-lock.json` segundo as auditorias executadas nesta data (ver seção 5).
- Achados que já têm correspondência ao vivo: `CODE-05` ≡ `ACL-01`, `CODE-06` ≡ `ACL-02`, `CODE-07` ≡ `ACL-03` (o time ao vivo confirmou os três; ver seção 7).

## 1. Tabela de achados

| ID | Severidade | Título | Local (arquivo:linha) | Impacto | Correção |
|----|------------|--------|-----------------------|---------|----------|
| CODE-01 | **Média (condicionada a conta `role=admin` nível `support`)** | Nível `support` de administrador consegue ler conteúdo e `share_token` de qualquer presente, contornando as restrições do próprio painel | `app/Policies/PurchasePolicy.php:10-13`; `app/Http/Middleware/Administrator.php:15-17`; `app/Http/Controllers/AdminController.php:39-44`; `app/Http/Controllers/PurchaseController.php:193-205`; `routes/web.php:54,88` | Um admin de suporte (perfil restrito a atendimento) pode obter `GET /api/purchases/{id}` e `GET /api/admin/clients/{user}` com o conteúdo privado do presente e o `share_token` (link público do presente), apesar de `workspace`/`/api/admin/purchases` esconderem compras desse nível. Exposição de dados pessoais e possibilidade de o suporte distribuir o link do presente. | Aplicar o nível também na leitura: `view` só para dono ou admin `owner`/`manager`; para `support`, remover `purchases`/`share_token`/conteúdo de `AdminController::detail` e não permitir `GET /api/purchases/{id}` de terceiros. |
| CODE-02 | Baixa | Auditoria global grava em `audit_events` em **toda** requisição, sem limite por ação/IP e sem tratamento de falha | `app/Http/Middleware/SecurityHeaders.php:34` | GET público (`/home.html` etc.) passa a escrever no banco; um cliente anônimo pode inflar `audit_events` até a retenção de 30 dias (`PrunePrivateData` roda 1×/dia), gerando custo/lentidão. Se o INSERT falhar (DB indisponível/limite), o erro sobe depois do efeito da requisição e a resposta vira 500 mesmo quando a ação já foi concluída. | Mover para listener/login e ações sensíveis, com amostragem/limite por IP, `try/catch` com log sem PII e exclusão explícita de assets/health. |
| CODE-03 | Baixa | Webhook Mercado Pago verifica assinatura mas **não valida a janela temporal** do `ts` (replay de notificação legítima capturada) | `app/Services/MercadoPagoCheckout.php:97-109`; `app/Http/Controllers/PaymentWebhookController.php:10-15` | Uma notificação HMAC válida capturada pode ser reenviada indefinidamente (reassinada não é possível). O dano é limitado porque `synchronize()` reconsulta o pagamento na API autenticada e faz *upsert* idempotente (`payment_receipts`), mas permite reexecução ilimitada de chamadas ao provedor e escritas no banco até a rotação do segredo. | Exigir `abs(now - ts) <= 300s`, cache de `data.id`/`x-request-id` já processados e manter a idempotência atual. |
| CODE-04 | Baixa | Guarda de 72 bytes do bcrypt é código morto: `config/hashing.php` não existe no deploy, então `config('hashing.driver') === 'bcrypt'` nunca é verdadeiro | `app/Http/Controllers/AuthController.php:94-104` (linha 100); ausência de `config/hashing.php`; `tests/Feature/SecurityReviewTest.php:150` (teste define a config em runtime) | A documentação de segurança promete rejeitar >72 bytes, mas o deploy aceita senhas de até 128 caracteres. Com o hasher padrão do framework (bcrypt), o PHP 8.5 **trunca em 72 bytes**: reproduzido localmente — `password_hash()` de 80 bytes é aceito e `password_verify()` de uma senha diferente nos últimos bytes retorna `true`. Contas com senhas longas passam a ter equivalência nos 72 primeiros bytes. | Versionar `config/hashing.php` com `driver=bcrypt`/`rounds` **ou** trocar a condição para o hasher realmente efetivo (`Hash::driver()`/config explícita); adicionar teste de configuração real do app, não só `config(['hashing.driver' => ...])`. |
| CODE-05 | Baixa / Informativa | Render de exceções 4xx devolve `getMessage()` interno, expondo classe do model, ID e padrão de rota; diferença entre recurso existente×inexistente permite enumeração | `bootstrap/app.php:41-52` (linha 49) | Ao vivo (`live-access.md` ACL-01): `404 "No query results for model [App\\Models\\Purchase] p_AAAA..."` e `404 "The route api/shared/<token> could not be found."`. *Fingerprinting* de framework/estrutura e enumeração de IDs, sem dados de terceiros. | Mapear 404/403 para mensagens genéricas (`NOT_FOUND`), mantendo classe/rota/ID apenas no log interno; preservar `meta.fields` em 422. |
| CODE-06 | Baixa | `complete-upload` de reserva sem objeto enviado devolve **500 INTERNAL_ERROR** (exceção do storage não tratada) | `app/Http/Controllers/CloudUploadController.php:79-80` | Ao vivo (`live-access.md` ACL-02): reserva `200`, conclusão antes do PUT → `500`. O dono consegue gerar erros 500 sintéticos (ruído/alerta/custo de log), sem vazamento ou efeito cross-account. | Capturar `UnableToCheckFileExistence`/`UnableToReadFile` e responder 409/422 ("objeto ainda não enviado"), opcionalmente marcando a reserva como inválida. |
| CODE-07 | Informativa (risco aceito/documentado) | URL PUT assinada continua utilizável após a conclusão do upload e recria objeto não referenciado em `incoming/` | `app/Http/Controllers/CloudUploadController.php:54-62,92-97`; limpeza em `app/Console/Commands/PrunePrivateData.php:21-24` | Ao vivo (`live-access.md` ACL-03): após `complete` (`bytes=0`), novo `PUT` na mesma URL assinada → `200`; objeto fica no bucket privado, não é entregue nem validado, e só é removido pelo prune na expiração da reserva (20 min). Impacto: overwrite temporário + uso de storage; sem cruzar contas. | Consumir a reserva no primeiro `complete` (deletar `MediaUpload` e recusar novo `complete`), invalidar a URL assinada após uso único ou encurtar a validade do PUT. |
| CODE-08 | Baixa / Informativa | Artefatos de build do Vite são publicados como estáticos e o `manifest.json` (com caminho absoluto do builder, ex. `/vercel/path1`) fica alcançável | `tools/publish-static-assets.mjs:5-10`; `tools/vercel-build.mjs:36`; `vercel.json:35-45` | Mecanismo estático confirmado: `public/build/` inteiro é copiado para `dist/build/` e a rota `handle: filesystem` serve `/build/*`. O Lead já obteve ao vivo `GET /build/manifest.json` expondo `/vercel/path1`. Divulga estrutura/caminho interno do build (baixo valor ofensivo), sem segredos nem source maps (Vite sem `sourcemap` no config). | Não publicar `manifest.json` (allowlist só `assets/`), fixar `base` relativo e/ou negar `/build/manifest.json` na rota do Vercel. |

## 2. Detalhamento dos achados

### CODE-01 — Autorização de leitura ignora `admin_level` (`support`)

Evidência de código:

```php
// app/Policies/PurchasePolicy.php:10-13
public function view(User $user, Purchase $purchase): bool
{
    return $purchase->user_id === $user->id || $user->role === 'admin';
}
```

```php
// app/Http/Middleware/Administrator.php:15-17
if (($request->user()->admin_level ?? 'owner') === 'support') {
    abort_unless($request->is('api/admin/workspace', 'api/admin/clients', 'api/admin/clients/*',
        'api/admin/tickets', 'api/admin/tickets/*', 'api/admin/settings'), 403, 'Sua função permite somente atendimento e consulta de clientes.');
}
```

```php
// app/Http/Controllers/AdminController.php:39-44  (rota GET /api/admin/clients/{user}, routes/web.php:88)
public function detail(User $user, PurchaseController $gifts)
{
    abort_unless($user->role === 'user', 404);
    return $this->ok(['client' => $this->client($user), 'purchases' => Purchase::withTrashed()->where('user_id', $user->id)
        ->get()->map(fn ($p) => $gifts->project($p)), ...]);
}
```

`PurchaseController::project()` devolve, para uso não-compartilhado, `share_token`, conteúdo (`carta`, `themeData`, nomes), preços e status (`app/Http/Controllers/PurchaseController.php:204`). O `workspace` esconde compras de `support` (`AdminWorkspaceController.php:29-30`) e o `Administrator` bloqueia `/api/admin/purchases`, mas **duas rotas fora desse allowlist entregam os mesmos dados**:

1. `GET /api/purchases/{purchase}` (com `->withTrashed()`, `routes/web.php:54`) é protegida apenas por `api.auth` + policy `view`, que aceita qualquer `role === 'admin'` **sem olhar `admin_level`**. Tendo o ID aleatório, um `support` lê o presente de qualquer cliente.
2. `GET /api/admin/clients/{user}` está no allowlist de `support` e retorna a lista de compras do cliente com `project()` completo (incluindo `share_token`).

**Impacto:** quebra da separação pretendida entre níveis administrativos; exposição de conteúdo privado de presentes (fotos/carta/homenagens) e do token do link compartilhado a um perfil que o painel trata como não autorizado a ver compras. Requer conta `role=admin` (não é ataque anônimo), por isso a severidade é média condicionada. **Não foi possível testar ao vivo** porque nenhuma conta do time é admin (`live-access.md`, limitação 2).

**Correção:** na policy, `view` para admin somente quando `admin_level` ∈ {`owner`, `manager`} (definir `support` como não autorizado a `purchases.show` de terceiros); em `AdminController::detail`, para `support`, omitir `purchases` e qualquer `share_token`/conteúdo — ou remover `api/admin/clients/*` do allowlist e expor um endpoint específico de suporte (notas, tickets) sem dados do presente. Adicionar teste de regressão com admin `support`.

### CODE-02 — `audit_events` no middleware global

```php
// app/Http/Middleware/SecurityHeaders.php:34
DB::table('audit_events')->insert(['user_id' => $request->user()?->id,
    'action' => $request->method().' '.($request->route()?->uri() ?? 'unmatched'),
    'ip_hash' => hash_hmac('sha256', (string) $request->ip(), config('app.key')),
    'status' => $response->getStatusCode(), 'created_at' => now()]);
```

`SecurityHeaders` é `prepend` global (`bootstrap/app.php:27`), então **toda** requisição Laravel grava uma linha — incluindo GETs públicos sem autenticação (`/home.html`, `/robots.txt`) e 404. As throttles (`pages` 1200/min por IP, `AppServiceProvider.php:53`) apenas limitam a taxa por IP, não o volume total; não há filtro por método/rota sensível nem `try/catch`. A linha em si está bem minimizada (rota como **padrão** `api/shared/{token}`, sem query string; IP com HMAC; sem corpo/credenciais), o problema é volume e acoplamento disponibilidade→auditoria. Observação: o teste `AdminWorkspaceTest::test_clearing_panel_history...` mostra que `audit_events` é intencionalmente separado de `admin_activities`.

**Correção:** registrar apenas mutações/ações de segurança (login, falha de login, admin, webhook, download), com amostragem e `now()->subDays(retention)`; envolver o insert em `try/catch` (log interno) para não derrubar a resposta; considerar `insertOrIgnore`/fila.

### CODE-03 — Replay de webhook sem janela de `ts`

```php
// app/Services/MercadoPagoCheckout.php:103-107
$ts = $signature['ts'] ?? '';
$digest = $signature['v1'] ?? '';
abort_unless(preg_match('/\A[0-9]{10,13}\z/', $ts) && preg_match('/\A[a-f0-9]{64}\z/', $digest), 401);
$expected = hash_hmac('sha256', "id:$id;request-id:$requestId;ts:$ts;", config('payments.mercadopago.webhook_secret'));
abort_unless(hash_equals($expected, $digest), 401);
```

A assinatura, a leitura do `data.id` via `QUERY_STRING` crua (contra a conversão de `.` em `_` do PHP), o `hash_equals` e a reconsulta autenticada (`synchronize()` valida `collector_id`, moeda, `live_mode`, valor em centavos e usa `payment_receipts` como idempotência) estão corretos. Falta somente a validade temporal do `ts` (e um cache de `x-request-id`/pagamento já processado): sem isso, uma notificação legítima capturada é reutilizável para sempre. **Não testado ao vivo** (não há segredo de webhook; `live-access.md` limitação 4).

**Correção:** `abort_unless(abs(now()->timestamp - intdiv((int) $ts, 1000)) <= 300, 401)` (ou 13 dígitos em ms) e `Cache::add("mp-webhook:{$id}:{$requestId}", true, 3600)` antes de sincronizar.

### CODE-04 — Guarda de 72 bytes inativa (config ausente)

```php
// app/Http/Controllers/AuthController.php:94-104
if (config('hashing.driver') === 'bcrypt' && strlen($value) > 72) {
    $fail('A senha deve ter no máximo 72 bytes. Acentos e emojis ocupam mais de um byte.');
}
```

O deploy não possui `config/hashing.php` (nem no histórico do worktree). `config('hashing.driver')` resolve `null`, a condição é sempre falsa; o `HashManager` do framework cai no driver padrão `bcrypt`. O teste que cobre o limite define `config(['hashing.driver' => 'bcrypt'])` **em runtime** (`tests/Feature/SecurityReviewTest.php:150`), por isso passa sem reproduzir a configuração de produção. Reprodução local (PHP 8.5.4, mesmo runtime alvo `<8.6`):

```text
php -r '$p=str_repeat("a",80); $h=password_hash($p,PASSWORD_BCRYPT,["cost"=>12]);
        var_dump(password_verify($p,$h), password_verify(str_repeat("a",72)."ZZZZZZZZ",$h));'
// bool(true) bool(true)  -> bcrypt trunca em 72 bytes
```

**Impacto:** os 72 primeiros bytes definem a senha; a promessa de `docs/SECURITY.md` não é cumprida e um eventual limite de 8–128 caracteres deixa de ser verdadeiro para o hasher. **Correção:** versionar `config/hashing.php` (`driver`, `bcrypt.rounds`), usar a config efetiva no `AuthController` e adicionar um teste que carregue a configuração real do app (sem override de teste) para senhas >72 bytes.

### CODE-05 — Mensagens 404 internas (confirmado ao vivo, ACL-01)

```php
// bootstrap/app.php:45-52
$status = $error instanceof ValidationException ? 422 : ($error instanceof HttpExceptionInterface ? $error->getStatusCode() : 500);
$code = match ($status) { 401 => 'NOT_AUTHENTICATED', 403 => 'FORBIDDEN', 404 => 'NOT_FOUND', ... };
$message = $status >= 500 ? 'Não foi possível concluir a operação.' : ($error->getMessage() ?: 'Revise sua solicitação.');
```

Para 4xx a mensagem vem da exceção. `ModelNotFoundException`/`NotFoundHttpException` carregam classe do model, ID solicitado e padrão/rota. Ao vivo (`live-access.md` ACL-01) isso foi reproduzido com `GET /api/purchases/00000000-...` e `GET /api/shared/<token>` inválido, permitindo diferenciar/enumerar. Não há XSS (a resposta é JSON e o frontend usa `textContent`/erro estruturado), o impacto é *fingerprinting*/enumeração. **Correção:** em 404/403/419 devolver mensagem genérica fixa; manter o detalhe apenas no log interno do `report()`.

### CODE-06 — `complete-upload` sem objeto → 500 (confirmado ao vivo, ACL-02)

```php
// app/Http/Controllers/CloudUploadController.php:79-80
$disk = Storage::disk($upload->disk);
abort_unless($disk->size($upload->path) === $upload->bytes, 422, 'O tamanho enviado não corresponde à reserva.');
```

`size()` lança `UnableToCheckFileExistence`/`UnableToReadFile` quando o objeto não existe (PUT não feito), virando 500 no render de exceções. Ao vivo: reserva 200 → `complete-upload` sem PUT → `500 INTERNAL_ERROR` (ACL-02). O dono pode gerar 500s sintéticos; nenhum dado vazado. **Correção:** checar `$disk->exists()`/capturar as exceções de storage e responder 409/422, invalidando a reserva.

### CODE-07 — Replay da URL PUT assinada (confirmado ao vivo, ACL-03)

`reserve()` retorna URL PUT assinada por 5 min (`CloudUploadController.php:54`); `complete()` copia/valida e marca `bytes=0` (linha 97) para liberar cota e permitir limpeza, mas **não invalida a URL**. Um novo PUT para `gifts/{purchase}/incoming/{uuid}` depois do `complete` recria o objeto; o `complete` repetido cai no retorno antecipado (`bytes===0`, linhas 74-78) e não valida nem remove o objeto. A remoção depende do cron `privacy:prune` na expiração da reserva (`PrunePrivateData.php:21-24`). O bucket é privado e o objeto não é referenciado/entregue (ao vivo: GET anônimo → 403), então o impacto é uso temporário de storage e reenvio de objeto não validado, sem cross-account. **Correção:** consumir a reserva no primeiro `complete` (deletar `MediaUpload` após uso) e/ou recusar `complete`/invalidação para reservas com `bytes=0`; reduzir a validade do PUT.

### CODE-08 — Artefatos de build publicados

`tools/vercel-build.mjs:36` chama `publishStaticAssets()`; `tools/publish-static-assets.mjs:5-10` copia **todo** `public/build` (incluindo `manifest.json`) para `dist/build`, e `vercel.json:35-45` serve o `dist` via `handle: filesystem`. O `vite.config.js` não habilita `build.sourcemap` (sem `.map`) e o allowlist exclui `public/index.php`, mas o manifest referencia os caminhos internos do builder (o Lead observou `/vercel/path1` em evidência ao vivo; detalhe deve constar no `live-*.md` de infra). Impacto: divulgação de caminho/estrutura do build, sem segredos. **Correção:** publicar apenas `build/assets/**` (ou remover `manifest.json` do static build) e usar `base` relativo.

## 3. Controles corretos identificados

Estes pontos foram revisados e estão corretos (evitam achados que seriam esperados nesse tipo de app):

**Sessão, autenticação e CSRF**
- CSRF do framework em todas as mutações; única exceção exata é o webhook (`bootstrap/app.php:26`), que exige HMAC próprio.
- Sessão em banco, `http_only=true`, `Secure` em produção (`bootstrap/vercel.php:40`; `config/session.php:172,185`), `SameSite=lax`, serialização `json`; `regenerate()` no login/cadastro (`AuthController.php:29,41`), `invalidate()`+`regenerateToken()` no logout/exclusão, e revogação de todas as sessões ao redefinir senha (`AuthController.php:86`) e ao excluir conta/admin (`PrivacyController.php:39`; `AdminWorkspaceController.php:136`).
- Login/reset usam erro genérico e `dummy_hash` para nivelar tempo de resposta contra enumeração (`AuthController.php:37-39`; `config/gift.php:30`). Recuperação responde igual para conta inexistente/inativa (`AuthController.php:60-68`); URL de reset vem de `APP_URL` e o token vai no fragmento, fora do servidor/referrer (`AppServiceProvider.php:79`; `resources/js/pages/login.js:15`).
- Limites: login 5/min por IP **e** por conta normalizada com HMAC (`AppServiceProvider.php:56-64`), recuperação por conta + IP (65-70), escrita/criação/suporte/sensível por chave separada; `sensitive` usa `$request->user()->id` (71-74).
- `api.auth` bloqueia sessão de conta com `deletion_requested_at` (`ApiAuthentication.php:12`); reset/exclusão também recusam conta desativada (`AuthController.php:80`; `PrivacyController.php:36`).

**Compras, mídia e compartilhamento**
- `PurchasePolicy`: `update` exige dono e não-excluído (sem admin); preço, `status`, `owner`, `share_token` nunca vêm do corpo — `store` fixa preço do plano no servidor e gera token com `random_bytes(32)` (`PurchaseController.php:73`); `PurchaseRequest::content()` remove `plan_id`/`media`/`client_request_id` (`PurchaseRequest.php:56-59`).
- `withTrashed` confinado: `show` com política de dono/admin; `index` filtra `user_id` da sessão; `sharedPurchase()` exige `paid` + `content_version=1` e o escopo global de soft delete revoga links na exclusão (confirmado ao vivo PASS-07/PASS-09).
- Download de mídia valida dono (`update` policy) ou token de compra paga/finalizada e exige `asset_id` presente no manifesto (`MediaController.php:66-80`); `Cache-Control: private,no-store` nos endpoints e `nosniff` global (confirmado ao vivo PASS-11/PASS-15); 302 usa URL assinada de 1 minuto com `response-content-type`/`response-cache-control`.
- Upload: caminho 100% gerado no servidor (`gifts/{purchase}/{uuid}`), nunca derivado do cliente (`GiftMedia.php:21`); MIME declarado × conteúdo via `finfo`; imagens decodificadas com limite de 16 MP e recodificadas em PNG (remove metadados/payloads); áudio/vídeo por `ffprobe` com `protocol_whitelist`/`format_whitelist` fixos e timeout de 15 s — sem SSRF (`MediaValidator.php:20-63`); cotas por compra (80 arquivos/300 MB) e por tipo; disco privado (`config/filesystems.php:33-84`) e driver Supabase sem ACL removido (`AppServiceProvider.php:37-47`).
- Upload direto: reserva autenticada com dono/estado, `mime` restrito à lista, `bytes` limitado por tipo, URL PUT curta para caminho do servidor com `ContentType` assinado, tamanho conferido no storage e **conteúdo revalidado no servidor** antes de entrar no manifesto (`CloudUploadController.php:18-105`); replay residual é CODE-07 (sem entrega).
- Cotas/limites de requisição: JSON obrigatório para API, `Content-Length` **e** bytes reais limitados a 2 MiB (não burla com Content-Length mentiroso/chunked) (`LimitJsonBody.php:12-27`); uploads têm detecção de tamanho incremental e `Content-Length` mentiroso não é confiado (`MediaController.php:22-43`).

**Pagamento e preço**
- Webhook: HMAC-SHA256 com `hash_equals`, leitura do `data.id` pela query crua, exige `type=payment`, `x-request-id` com formato, valor/`currency_id`/`live_mode`/`collector_id` conferidos contra a API e o checkout, não confia em valor/status do payload; `payment_receipts` por ID do provedor dá idempotência e evita regressão de status (`MercadoPagoCheckout.php:112-162`).
- Preço/desconto/cupom: cálculo 100% no servidor a partir de `plans`/`promotions`/`coupons` ativos, com piso de 1 centavo e teto de desconto (`Pricing.php:29-59`); cotação congelada quando já existe checkout (`Pricing.php:82-98`); limite de uso de cupom serializado por `lockForUpdate` (`Pricing.php:73-80`); `expected_amount_cents` só serve para detectar mudança, jamais para definir preço (`PurchaseController.php:127-155`); gateway simulado recusa em produção (`SimulatedPaymentGateway.php:12`) e `PaymentGateway` nunca aceita "pago" do cliente. Pix manual só é confirmado por admin com valor exato e referência bancária única (`AdminController.php:53-76`).
- Refunds: elegibilidade calculada no servidor (72 h, link não aberto), `status`/`note`/decisão fora do `validate()` do usuário, aprovação de Mercado Pago exige estorno confirmado por webhook e Pix manual exige `refund_sent` (`PurchaseController.php:23-45`; `AdminController.php:87-111`; `RefundEligibility.php:9-27`).

**Admin e privacidade**
- `admin` middleware exige `role=admin` (`Administrator.php:13`); ações sensíveis (settings globais, excluir cliente, limpar histórico, convidar/revogar/remover admin) têm checagem `owner()` (`AdminWorkspaceController.php:99-100,130,211,221,269,279,296-299`); convites usam URL assinada temporária, exigem o **mesmo e-mail autenticado** e não elevam outra conta (`AdminWorkspaceController.php:240-265`; confirmado ao vivo PASS-22 e testes).
- `GET /api/privacy/export` exporta somente o titular da sessão e oculta `share_token` (`PrivacyController.php:16-27`; confirmado ao vivo PASS-32); exclusão exige senha atual dentro de transação, revoga sessões/tokens e mantém link revogado (`PrivacyController.php:30-47`; `Purchase` soft delete + escopo global).
- Suporte consulta sempre pelo `user_id` da sessão (`SupportController::current`), sem rota por ID de ticket; mensagens/textos são armazenados como texto e renderizados com `textContent`/`esc()` no admin (`resources/js/admin/support-conversation.js:17`; `resources/js/admin/workspace.js:375`) e com `esc()`+markdown seguro no widget (`resources/js/chat/widget.js:70-98,329`); XSS armazenado não reproduzido ao vivo (PASS-27).
- CSV do painel neutraliza injeção de fórmula (`resources/js/admin/workspace.js:101-109`: prefixa `'` para `=+-@`), então nome/motivo vindos do usuário não viram fórmula no Excel.

**XSS / CSP / frontend**
- Nenhum `{!! ... !!}` e nenhum `<script>` inline em `resources/views` (grep completo); não há `eval`, `new Function`, `document.write` nos caminhos de dados; `resources/js/pages/ver.js` escapa com `E()`/`cleanLabel`/`safeMedia`; temas usam `NATheme.escape`, `esc()` ou `textContent` para textos de usuário; iframes de tema exigem `event.origin === location.origin` e `event.source === parent` (`theme-runtime.js:159-162`); `themeData` bloqueia `__proto__`/`constructor`/`prototype` e limita profundidade/tamanho (`PurchaseRequest.php:27-48`).
- CSP efetiva: `script-src 'self'`, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, `frame-ancestors 'self'` e `connect-src` limitado às origens de upload configuradas (`SecurityHeaders.php:29-30`); `style-src 'unsafe-inline'` é necessário pelos estilos dinâmicos dos temas (documentado em `docs/SECURITY.md`); `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: no-referrer`, `nosniff`, HSTS quando a requisição é TLS e `no-store` em `/api/*` (`SecurityHeaders.php:21-33`).

**Configuração, segredos e logs**
- `APP_DEBUG` forçado `false` no entrypoint serverless (`bootstrap/vercel.php:29`); sem `.env` versionado (`.gitignore`/`.vercelignore`; grep do git) e `.env.example` sem segredos; `storage/`, `.env*`, `vendor`, `tests` excluídos do pacote Vercel (`vercel.json:12-27`) e do ignore; disco de mídia privado, `serve=false` no local (`config/filesystems.php:33-39`).
- Logger: o `report()` global **não** registra mensagem original, bindings SQL, trace ou request, apenas tipo/arquivo/linha/rota (`bootstrap/app.php:29-40`), e o log de setup não inclui valores, só nomes ausentes (`api/index.php:13-14`). Nenhum `Log::`/`logger()` em controllers/serviços que receba senha, token, corpo ou URL assinada.
- Auditoria pseudonimizada: rota como padrão sem parâmetros/query e IP via HMAC-SHA256 com `APP_KEY` (`SecurityHeaders.php:34`; `docs/SECURITY.md`).
- `/api/internal/prune` exige Bearer com `CRON_SECRET` de ≥32 caracteres comparado por `hash_equals` (`routes/web.php:33-40`; confirmado ao vivo PASS-35); retenção implementada em `PrunePrivateData.php` (rascunhos 30 d, conta 30 d com mídias, auditoria 30 d, sessões/tokens).
- Contas: role/owner nunca aceitos do corpo (PASS-05); `User` tem `Fillable` restrito e `Hidden` para campos internos (`Models/User.php:13-14`).

## 4. Não confirmado / hipótese

| ID | Hipótese | Por que não é fato / como verificar |
|----|----------|--------------------------------------|
| H-01 | **Spoof de `X-Forwarded-For` para burlar rate limit por IP** | `bootstrap/app.php:22-24` confia em `127.0.0.1`/`::1` quando `VERCEL`. Se o front controller PHP do runtime Vercel vê `REMOTE_ADDR=127.0.0.1` e repassa a cadeia `X-Forwarded-For` sem normalizar, o `ip()` poderia refletir valor do cliente — o que anularia o limite por IP (o limite por conta/HMAC continua valendo). Não verificado: não há evidência ao vivo de spoof de XFF (os testes de rotação de IP usam `REMOTE_ADDR` em teste unitário). **Verificação:** 6 tentativas de login com `X-Forwarded-For` distintos e e-mail fixo; se a 6ª ainda for 401 (e não 429), o limite por IP está sendo burlado; se 429, o proxy normaliza e está correto. |
| H-02 | Caminho do manifest Vite expõe `/vercel/path1` | Mecanismo estático confirmado (CODE-08), mas o conteúdo exato do manifest do deploy atual não foi lido nesta auditoria (o worktree não contém `public/build` gerado; não editei o worktree para buildar). O Lead já observou ao vivo; a confirmação final deve citar o `live-*.md` de infra e o `GET /build/manifest.json`. |
| H-03 | Headers de segurança do objeto servido pelo Supabase (signed GET) | O 302 do app tem `nosniff`/`no-store` (confirmado ao vivo PASS-15) e a URL assinada carrega `response-content-type`/`response-cache-control`, mas os headers da **resposta do storage** (nosniff/Content-Disposition) não foram observados diretamente. Mídia validada e recodificada reduz o risco. **Verificação:** `curl -I` na URL assinada. |
| H-04 | `/api/config` expõe metadados operacionais | `routes/web.php:32` devolve ao público `media_storage` (`configured`, `mode`, `limits`), `payments` (`provider`, `configured`, `live`) e `server_time_ms`; é informação de configuração sem credenciais (baixo valor). Não classifiquei como achado; se a política quiser ocultar, limitar `payments.provider/live`. |
| H-05 | Enumeração de e-mail no cadastro | `POST /api/auth/register` devolve 422 "E-mail já cadastrado." via `unique:users` (`AuthController.php:21-27`); permite enumerar contas em ~3 req/min/IP. Tradeoff comum de UX; não classificado como achado. |
| H-06 | `SESSION_ENCRYPT=false` e `SESSION_LIFETIME=120` | Defaults do deploy; sessão fica em banco (`database`), cookie `HttpOnly`/`Secure`/`SameSite=Lax`. Não é vulnerabilidade; endurecimento sugerido: criptografar payload de sessão se o banco for multi-tenant. |
| H-07 | Página `/reset-password/{token}` (rota padrão Laravel) descarta o token e redireciona para `/recuperar-senha.html` sem fragmento (`routes/web.php:30`) | O e-mail gerado pela aplicação usa a URL com fragmento (`AppServiceProvider.php:79`), então o fluxo real funciona; links antigos no formato de path perderiam o token (funcional, não segurança). Confirmar com exemplos de e-mails antigos. |

## 5. Dependências — CVEs e versões

Comandos executados no worktree (`/tmp/deploy-audit`, 26/10/2026) com rede disponível:

```text
composer audit --locked --no-interaction   -> "No security vulnerability advisories found."
npm audit --package-lock-only --json       -> 0 vulnerabilidades (info/low/moderate/high/critical = 0)
```

Versões efetivas relevantes (de `composer.lock` / `package-lock.json`, não do `composer.json`):

| Componente | Versão travada |
|------------|----------------|
| laravel/framework | **v13.38.0** (`composer.json` pede `^13.17`; o lock resolveu 13.38.0) |
| PHP exigido | `>=8.5.12 <8.6` (`composer.json`; runtime local 8.5.4 usado só no teste do bcrypt) |
| symfony/* | 8.1.9 (console/http-foundation/http-kernel), 8.1.8 (error-handler), 8.1.7 (mailer/mime) |
| league/flysystem / aws-s3-v3 | 3.36.0 / 3.35.3 |
| aws/aws-sdk-php | 3.402.0 |
| guzzlehttp/guzzle / psr7 / promises | 8.3.0 / 3.2.0 / 3.1.0 |
| league/commonmark | 2.10.4 |
| monolog/monolog | 3.12.1 |
| nesbot/carbon | 3.15.0 |
| vlucas/phpdotenv | 5.7.0 |
| phpunit/phpunit (dev) | 12.5.40 |
| vite / esbuild / rollup / laravel-vite-plugin | 7.3.7 / 0.28.2 / 4.65.0 / 2.1.0 |
| qrcode (dev, e também **vendorizado** em `resources/js/vendor/qrcode.js`) | 1.5.4 |

**Nenhuma CVE foi reportada pelas auditorias nesta data.** Observações de escopo:
- `composer audit --locked` consulta o repositório de advisories do Composer com as versões **travadas** — adequado, mas o `vendor/` não está presente no worktree (auditoria não inspecionou o código instalado, apenas o lock).
- `npm audit` cobre o `package-lock.json` (96 dependências dev; só `qrcode` é dependência de runtime, mas é gerada para `vendor/qrcode.js` pelo build). O arquivo vendorizado foi verificado como `node-qrcode 1.5.4` (mesma versão auditada) e não recebe dados não confiáveis além do texto do link/QR — sem achado.
- O `laravel/framework` real do deploy é **13.38.0**, não 13.17 como mencionado no pedido; se o relatório final citar "Laravel 13.17", convém corrigir para "Laravel 13 (lock 13.38.0)".

## 6. Artefatos e superfície de build

- `public/build/`, `dist/`, `bin/`, `vendor/`, `.env*`, `storage/*.log` **não são versionados** (`.gitignore`; `git ls-files` só contém `.env.example` e `supabase/bootstrap.sql` entre os nomes sensíveis). Nenhum `.env` ou log real aparece no worktree.
- `vercel.json` exclui `.env*`, `storage/`, `tests/`, `resources/js`, `resources/css`, `public/build/assets/**` do pacote da função; o static build publica `build/`, `media/`, `branding/`, `favicon.svg` (`tools/publish-static-assets.mjs`). `public/media/home-preview.mp4` (5,6 MB) é público por design.
- Source maps: `vite.config.js` não define `build.sourcemap` (default `false`), e não há `.map` versionado — não há exposição de código-fonte por source map no artifact previsto; confirmar ao vivo que `/build/assets/*.map` responde 404.
- Manifest: ver CODE-08; o manifest pode expor caminho absoluto do builder (`/vercel/path1`) e nomes das entradas. Não contém segredos, mas é superfície desnecessária.
- `/.env`, `/.git/HEAD` e `storage/` foram testados somente em rodada anterior (`docs/SECURITY_REVIEW_2026-10-24.md`) e não nesta; vale incluir no fechamento ao vivo (o `.vercelignore`/`excludeFiles` já impede a inclusão no pacote, e o roteamento `/(.*)` manda para o PHP, que não serve `storage/`).

## 7. Comparação com as evidências ao vivo (`security-audit/live-access.md`)

| Meu achado | Evidência ao vivo | Situação |
|------------|-------------------|----------|
| CODE-05 (mensagens 404 internas) | ACL-01 — `404` com `No query results for model ... p_...` e rota interna | **Confirmado ao vivo**; mesma causa (`bootstrap/app.php:49`). |
| CODE-06 (`complete-upload` sem objeto → 500) | ACL-02 — reserva 200 → complete → 500 | **Confirmado ao vivo**; causa `CloudUploadController.php:80`. |
| CODE-07 (replay da URL PUT) | ACL-03 — PUT pós-complete 200, objeto órfão, GET anônimo 403 | **Confirmado ao vivo**; já documentado como risco aceito; recomendo consumir a reserva. |
| CODE-01 (leitura por admin `support`) | PASS-22/23 apenas provam que usuário comum recebe 403/401 (não há conta admin) | **Não testável ao vivo**; achado estático com caminho exato para regressão quando houver admin de teste. |
| CODE-02 (audit em toda requisição) | Não medido ao vivo | **Pendente**; verificar contagem de `audit_events` após N GETs públicos e comportamento com DB indisponível. |
| CODE-03 (replay webhook) | PASS-34 só testou assinatura ausente/inválida (401) | **Pendente**; precisa do segredo HMAC para capturar/replays de notificação legítima. |
| CODE-04 (bcrypt >72 bytes) | Não testado ao vivo | **Pendente**; 2 requisições (`register` com 80 bytes + `login` com cauda diferente) confirmam truncamento em produção; cadastro é aberto. |
| CODE-08 (manifest público) | Evidência do Lead (caminho `/vercel/path1`) | **Confirmado pelo Lead**; incluir o arquivo `live-*.md` correspondente. |

Também validei que os controles ao vivo coincidem com o código: PASS-05 (owner/preço/status/token do corpo ignorados) ↔ `PurchaseRequest`/`PurchaseController`; PASS-07/PASS-09 (soft delete revoga link) ↔ `sharedPurchase()` + escopo global; PASS-12/PASS-14/PASS-19 (IDOR de mídia e path traversal) ↔ policy + regex de `asset` + path gerado no servidor; PASS-17/PASS-18 (MIME/tamanho) ↔ `MediaValidator`/quotas; PASS-20 (bucket privado) ↔ `MediaStorage` + driver Supabase sem ACL; PASS-27 (XSS armazenado renderizado como texto) ↔ `esc()`/`textContent`; PASS-32/33 (privacidade) ↔ `PrivacyController`; PASS-35 (prune) ↔ `cron_secret` com `hash_equals`. Nada nessas evidências contradiz os achados acima.

## 8. Recomendações priorizadas

1. **CODE-01 (média, primeiro):** aplicar `admin_level` na leitura de compras (`PurchasePolicy::view` e `AdminController::detail`) e criar teste de regressão com admin `support`; se o suporte não deve ver compras, remover também `api/admin/clients/*` de dados de compra.
2. **CODE-04:** versionar `config/hashing.php` (ou usar a config efetiva) — é uma divergência direta entre `docs/SECURITY.md`/teste e o deploy, de correção barata e efeito de segurança real (truncamento bcrypt confirmado no runtime).
3. **CODE-05/CODE-06/CODE-07:** padronizar 404 genérico, tratar storage ausente como 4xx e consumir a reserva no primeiro `complete` (fecha os três achados ao vivo).
4. **CODE-03:** janela de timestamp + cache de `data.id`/`x-request-id` no webhook.
5. **CODE-02:** restringir `audit_events` a eventos de segurança/mutação com `try/catch` e limite por IP.
6. **CODE-08:** publicar apenas `build/assets/**` e remover `manifest.json` do estático.
7. Endurecimento opcional: testar H-01 (XFF) e H-03 (headers do storage); considerar `COOP`/`CORP`/`COEP`, HSTS com `includeSubDomains`, `SESSION_ENCRYPT=true`, e mensagem neutra no cadastro para reduzir enumeração (H-05).

## Anexo — comandos e verificações executadas

```bash
cd /tmp/deploy-audit && git rev-parse HEAD            # 2b64769557eb0c949be1c20dec064ef81866c0b2
git branch --show-current                               # codex/account-and-gift-ui-fixes
composer audit --locked --no-interaction                # sem advisories
npm audit --package-lock-only --json                    # 0 vulnerabilidades
php -r '...password_hash/password_verify...'            # bcrypt trunca em 72 bytes (PHP 8.5.4)
grep -rnE "innerHTML|insertAdjacentHTML|document.write|eval\(|new Function|srcdoc" resources/js
grep -rnE '\{!!' resources/views                        # nenhum resultado
grep -rnE "<script|on[a-z]+=" resources/views          # sem scripts inline
git ls-files | grep -iE '\.env|log$|manifest|\.map$|backup|\.sql'  # só .env.example e supabase/bootstrap.sql
grep -rhoE "config\('[a-z0-9_.]+'" app routes bootstrap | sort -u  # chaves de config × config/*.php
```

Nenhuma hipótese foi promovida a achado; o que não pôde ser confirmado está nas seções 4 e 7. Não houve execução de `phpunit`/`npm test` no worktree (sem `vendor/`/`node_modules` e por ser worktree de leitura proibido para edição) — a cobertura de testes foi avaliada por inspeção de `tests/`, e o veredito de vulnerabilidade não depende dela.

---

## ERRATA do Lead (26/10/2026) — CODE-04 refutado por evidência ao vivo

O achado **CODE-04** acima foi **refutado** pelo teste ao vivo do módulo de autenticação:

- `POST /api/auth/register` com senha de **40 caracteres `é` (80 bytes UTF-8)** retornou
  `HTTP 422` com a mensagem exata da guarda: *"A senha deve ter no máximo 72 bytes. Acentos e emojis ocupam mais de um byte."*
  Evidência bruta: `/tmp/live/auth/raw/reg_pw80utf8.body` e `.hdr` (ver `live-auth.md`, AUTH-02).
- Ou seja, em produção `config('hashing.driver') === 'bcrypt'` é verdadeiro (há default efetivo do framework/config cache),
  o código não é morto e a proteção contra truncamento bcrypt **funciona**.

**Classificação final:** CODE-04 = **não reproduzido / refutado ao vivo (Informativo)**. Mantido aqui apenas como registro
metodológico: o teste `SecurityReviewTest` realmente não prova a configuração de produção, mas o comportamento ao vivo prova
que a guarda atua. Recomendação residual: versionar `config/hashing.php` explicitamente para tornar a configuração auditável.
