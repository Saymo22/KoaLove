# Testes ao vivo — autorização/IDOR, uploads, links compartilhados, admin, webhook e privacidade

**Alvo:** https://projetona.vercel.app (ambiente de testes; autorização do proprietário registrada em `README.md`)
**Código de produção auditado:** `/tmp/deploy-audit` — commit `2b64769`
**Data/hora dos testes:** 26/10/2026, entre 11:41 e 11:45 (America/Sao_Paulo), antes da pausa por *Vercel Security Checkpoint*; os testes ao vivo foram retomados após o cooldown (ver seção de limitações).
**Contas:** U2 (`id 5`, `qa.lead.1793025471@example.com`), U3 (`id 6`, `qa.idor.b.1793025563@example.com`), U1 (`id 4`) para cross-user; nenhuma conta é admin.
**Método:** requisições reais via `curl` com `--resolve` (helper `/tmp/live/lib.sh`), sessão/cookies e CSRF reais, sem intervenção no servidor. Evidências brutas em `/tmp/live/ev/` (arquivos citados por seção). Nenhum pagamento real foi iniciado e nenhuma conta de terceiro foi apagada.

## Sumário executivo

- **Nenhum achado de severidade crítica, alta ou média foi confirmado** nos controles de autorização/IDOR, uploads diretos, links compartilhados, admin, suporte, privacidade e webhook.
- Foram confirmados **3 achados de baixa severidade / informativos**, todos de robustez/observabilidade, sem bypass de autorização: mensagens 404 que expõem a classe interna do modelo/rota; `complete-upload` de reserva sem objeto devolvendo HTTP 500; URL PUT assinada permanecer utilizável após a conclusão do upload (risco aceito/documentado, gera objeto órfão até a limpeza).
- Os controles centrais de IDOR funcionaram: compra, mídia, reembolso, suporte, privacidade e admin negam acesso cruzado com **403** (usuário) e **401** (anônimo), e recursos inexistentes/soft-deleted devolvem **404**.
- Upload direto: SVG/HTML/PHP/EXE renomeados, MIME *spoof* e tamanho acima do limite foram **rejeitados**; o bucket Supabase não é público (403/401 sem credencial).
- **Limitação principal:** sem credencial administrativa e sem compra paga (pagamento real proibido; `PAYMENTS` live), não foi possível exercitar o caminho positivo de `/api/shared/{token}` de uma compra paga nem as ações internas de admin. O caminho negativo e a revogação por *delete* foram testados.

## Tabela de achados

| ID | Severidade | Título | Endpoint | Evidência (resumo) | Impacto | Repro | Correção |
|----|-----------|--------|----------|--------------------|---------|-------|----------|
| ACL-01 | Baixa / Informativa | Mensagens 404 expõem classe interna do model e padrão de rota | `GET /api/purchases/{id}`, `GET /api/shared/{token}` (rota não casada) | `404 {"ok":false,"error":{"code":"NOT_FOUND","message":"No query results for model [App\\Models\\Purchase] p_AAAA..."}}`; `"The route api/shared/0123... could not be found."` | *Fingerprinting* de framework/estrutura interna e enumeração de IDs por mensagem diferente (recurso existente×inexistente), sem dados de terceiros. | `curl -b jar-u2 https://projetona.vercel.app/api/purchases/00000000-0000-4000-8000-0000000000ff` | Retornar mensagem 404 genérica no render de exceções (`NOT_FOUND`), mantendo classe/rota apenas no log interno. |
| ACL-02 | Baixa | `complete-upload` de reserva cujo objeto não existe devolve 500 (INTERNAL_ERROR) | `POST /api/purchases/{id}/media/{asset}/complete-upload` | Reserva `200` (`upload_id`); conclusão antes do PUT → `500 {"ok":false,"error":{"code":"INTERNAL_ERROR","message":"Não foi possível concluir a operação."}}` | Nenhum dado vazado, mas permite ao dono gerar erros 500 (ruído, alertas, custo de log). Não afeta outras contas. | Reservar `upload-url` (`{"mime":"image/png","bytes":69}`) e chamar `complete-upload` sem enviar o objeto. | Tratar `UnableToCheckFileExistence` como 422/409 ("objeto não enviado") antes de `size()`/`readStream`. |
| ACL-03 | Informativa (risco aceito/documentado) | URL PUT assinada continua utilizável após a conclusão e recria objeto órfão no bucket privado | `PUT <signed-url>` (storage Supabase) + `complete-upload` | Após conclusão, `PUT` na URL original → `200`; `complete-upload` repetido → `200`; GET anônimo S3 → `403 AccessDenied`. Comentário no código: “a signed PUT can be replayed until its URL expires”. | Reenvio/overwrite do objeto em `incoming/` (não referenciado pela API) até a URL expirar (≈5 min); aumenta temporariamente uso de storage até o *prune*. Não altera a mídia entregue nem cruza contas. | Concluir upload; repetir `PUT` na mesma URL assinada; repetir `complete-upload`. | Invalidar reserva no primeiro `complete` (deletar registro após uso) e/ou negar `complete` quando `bytes=0`/URL já consumida; limitar reenvio a um único PUT. |

## Evidências dos achados

### ACL-01 — mensagens 404 detalhadas

```
# GET /api/purchases/p_AAAAAAAAAAAAAAAAAAAAAAAA  (sessão U2)
HTTP/2 404
cache-control: no-store, private
content-type: application/json
{"ok":false,"error":{"code":"NOT_FOUND","message":"No query results for model [App\\Models\\Purchase] p_AAAAAAAAAAAAAAAAAAAAAAAA"}}

# GET /api/shared/0123456789abcdef  (anônimo)
HTTP/2 404
{"ok":false,"error":{"code":"NOT_FOUND","message":"The route api\/shared\/0123456789abcdef could not be found."}}
```
Evidência em `/tmp/live/ev/idor.txt` e `/tmp/live/ev/shared.txt` (26/10/2026 11:42).

### ACL-02 — 500 na conclusão sem objeto

```
# POST /api/purchases/p_b6uA.../media/idlphotos.../upload-url (U2)
HTTP/2 200 {"ok":true,"data":{"upload_id":"97d4757f-...","url":"https://qlvo...storage.supabase.co/...","headers":[]}}
# POST .../complete-upload {"upload_id":"97d4757f-..."} sem PUT válido
HTTP/2 500 {"ok":false,"error":{"code":"INTERNAL_ERROR","message":"N\u00e3o foi poss\u00edvel concluir a opera\u00e7\u00e3o."}}
```
Evidência em `/tmp/live/ev/reserve.json` e `/tmp/live/ev/complete.json` (26/10/2026 11:43). Causa no código: `CloudUploadController::complete()` chama `$disk->size()` sem tratar ausência do objeto.

### ACL-03 — replay de URL assinada

```
# PUT original (antes da conclusão) -> HTTP 200
# complete-upload -> 200 {"ok":true,"data":{"id":"idlphotos1793025471aaaaaaaa","kind":"photo"}}
# PUT repetido na mesma URL (pós-conclusão) -> HTTP 200
# complete-upload repetido -> 200 {"ok":true,"data":{"id":"idlphotos...","kind":"photo"}}
# GET anônimo https://qlvo...storage.supabase.co/storage/v1/s3/gift-media/gifts/.../incoming/<uuid> -> 403 AccessDenied
```
Evidência em `/tmp/live/ev/upload-spoof.txt` (26/10/2026 11:44).

## Testado e aprovado (controles que resistiram)

Legenda de evidência: arquivos em `/tmp/live/ev/`.

### Compras e IDOR (26/10/2026 11:42)

| ID | Controle | Resultado |
|----|----------|-----------|
| PASS-01 | `GET /api/purchases/{id}` de U2 com sessão U3 | **403** `FORBIDDEN` (`/tmp/live/ev/idor.txt`) |
| PASS-02 | `GET /api/purchases/{id}` de U2 anônimo e `GET /api/purchases` anônimo | **401** `NOT_AUTHENTICATED` |
| PASS-03 | `POST .../update`, `.../delete`, `.../pay`, `.../quote`, `.../refund`, `.../migrate` de U2 com sessão U3 | **403** em todas; `quote` do próprio dono **200** (controle positivo) |
| PASS-04 | ID inexistente / UUID inexistente com dono autenticado | **404** JSON, sem 500 |
| PASS-05 | Campos forçados no corpo do `POST /api/purchases` (`user_id:6`, `status:"paid"`, `price_cents:1`, `amount_paid_cents`,`share_token`,`deleted_at`) | **Ignorados**: compra criada 201 com `user_id:5`, `status:"pending"`, `price_cents:990`, `share_token` gerado pelo servidor (`/tmp/live/ev/idor.txt`, saída 11:42:28) |
| PASS-06 | `client_request_id` idempotente e recusa de recriação após exclusão | Mesma chave retorna a compra; após soft delete → **409** "Este rascunho foi excluído." |
| PASS-07 | Compra soft-deleted: dono `GET` (`withTrashed`) | **200** com `deleted:true`; U3 na mesma compra → **403**; update em compra excluída → **404** (binding sem trashed) (`/tmp/live/ev/shared.txt`) |

### Links compartilhados (26/10/2026 11:42)

| ID | Controle | Resultado |
|----|----------|-----------|
| PASS-08 | Token de 64 hex de compra **pendente** (não paga) acessado anonimamente (`/api/shared/{token}` e `/media`) | **404**, sem metadados da compra |
| PASS-09 | Token **revogado após soft delete** da compra | **404** imediato (compras usam soft delete + escopo global; `sharedPurchase()` exige `paid` e `content_version=1`) |
| PASS-10 | Token aleatório 64 hex, 63 hex, 16 hex, maiúsculas (fora da constraint `[a-f0-9]{64}`) | **404**; nenhuma diferença útil (todos 404, sem enumeração de tokens válidos) |
| PASS-11 | Cache/robots nos endpoints compartilhados | `Cache-Control: no-store, private` e `X-Robots-Tag: noindex, nofollow` nas respostas |

### Mídia privada (26/10/2026 11:43)

| ID | Controle | Resultado |
|----|----------|-----------|
| PASS-12 | `GET /api/purchases/{id}/media/{asset}` de U2 com sessão U3 | **403**; anônimo **401**; dono **302** para URL assinada |
| PASS-13 | Asset inexistente ou não selecionado no manifesto | **404** (`abort_unless(in_array($asset, $ids, true))`) |
| PASS-14 | Path traversal no `{asset}` (`%2e%2e%2f`, `..%2F..%2F.env`) | **404** de rota (Vercel/regex não aceita `/`); nenhum arquivo servido |
| PASS-15 | Headers do download autenticado | `302` com `Location` para URL S3 assinada de 1 min, `Cache-Control: no-store, private`, `X-Content-Type-Options: nosniff`; URL assinada carrega `response-content-type` e `response-cache-control=private,no-store` |
| PASS-16 | Upload direto para compra de outro usuário (`upload-url`, `complete-upload` de U2 com sessão U3) | **403**; compra inexistente/excluída → **404** |
| PASS-17 | Upload direto — MIME real × declarado | SVG, HTML, PHP e EXE enviados como `image/png` → `PUT` no bucket aceita o tipo declarado, mas `complete-upload` → **415** "O conteúdo do arquivo não corresponde ao formato."; PNG declarado `image/jpeg` → **415** (`/tmp/live/ev/upload-spoof.txt`) |
| PASS-18 | Limites de upload | Foto 15 MiB+1 → **413** na reserva; vídeo 50.000.001 bytes → **413**; `bytes` 104.857.601 → **422**; MIME fora da lista (`image/svg+xml`, `text/html`) → **422** |
| PASS-19 | Identificador de asset malicioso | `<16` chars → **422**; com ponto → **422**; nomes não viram caminho (path gerado no servidor como `gifts/{purchaseId}/{uuid}`) |
| PASS-20 | Objeto no Supabase sem credencial | S3 anônimo → **403 AccessDenied**; REST Storage `object/list`,`object/public` e `bucket` sem credencial → **400/404/401**, sem listagem; objeto recém-enviado não foi lido anonimamente |
| PASS-21 | Upload legítimo completo (controle positivo) | Reserva 200 → PUT assinado 200 → `complete-upload` 200 (`kind:photo`) → compra atualizada com `content_version:1` e mídia no manifesto (`/tmp/live/ev/complete2.json`, `update-manifest2.json`) |

### Admin (requer credencial de admin — apenas barreira de autorização testada)

| ID | Controle | Resultado |
|----|----------|-----------|
| PASS-22 | Todas as rotas `/api/admin/*` (summary, clients, clients/{user}, purchases, refunds, tickets, workspace, pricing, decisions/replies/confirm-pix/invite) com sessão de usuário comum | **403** `Acesso restrito.` (Laravel `Administrator` middleware) |
| PASS-23 | Mesmas rotas sem sessão | **401** `NOT_AUTHENTICATED` (middleware `api.auth` antes do `admin`) — ver observação de rate limit/limitação abaixo |
| PASS-24 | Páginas `/admin/*.html` sem sessão | Servem o *shell* estático (200) sem dados de clientes/pedidos; a proteção de dados é nas APIs; JS faz `protegerRotaAdmin()` e redireciona. Nenhum e-mail/id de cliente embutido no HTML |

### Suporte (26/10/2026 11:44)

| ID | Controle | Resultado |
|----|----------|-----------|
| PASS-25 | Leitura de conversa de outro usuário | Não há rota por ID de ticket no cliente; `GET /api/support` sempre usa `user_id` da sessão: U2 `user_id:5`, U3 `user_id:6` (`ticket:null`). Nenhum IDOR |
| PASS-26 | Mensagem para ticket de terceiro | Impossível: `messages` sempre no ticket da própria conta; U3 sem ticket → **409** "Inicie o atendimento antes..." |
| PASS-27 | Payload XSS armazenado | `<img src=x onerror=...><script>...` e `<svg onload=...>` armazenados **crus** no JSON (sem sanitização server-side), mas renderizados com escape: `textContent` no admin (`support-conversation.js`) e `esc()`/`md()` (que escapa primeiro) no widget do cliente. **Não reproduzido** como execução (sem browser/admin) |
| PASS-28 | Payload grande | `text` 2001 chars → **422**; corpo >2 MiB → `LimitJsonBody` **413** (ver observação) |
| PASS-29 | Idempotência `message_id` e UUID inválido | Repetição do mesmo `message_id` não duplica mensagem; `message_id` não-UUID → **422** |

### Reembolso / privacidade / webhook

| ID | Controle | Resultado |
|----|----------|-----------|
| PASS-30 | Reembolso de compra alheia (U3 → compra de U2) | **403** |
| PASS-31 | Campos `status`/`decision` forjados no reembolso | Fora do `validate()` (`reason`,`request_kind`) e ignorados; compra pendente → **409** `Somente compras pagas...` |
| PASS-32 | `GET /api/privacy/export` de outro usuário | Não aceita ID; exporta somente `user_id` da sessão (account/purchases/refunds/tickets/payments); `share_token` oculto (`makeHidden`) |
| PASS-33 | `POST /api/privacy/delete` com senha errada / sem senha | **422** `Senha incorreta.` / validação; conta permanece autenticada (não apaga). **Nenhuma conta U1–U4 foi apagada** |
| PASS-34 | Webhook Mercado Pago sem assinatura / assinatura inválida | **401** antes de qualquer mutação (`MercadoPagoCheckout::verify()` exige HMAC `ts`/`v1`, `data.id` numérico no query e `x-request-id`); sem segredo válido não há como forjar evento |
| PASS-35 | `/api/internal/prune` sem bearer `CRON_SECRET` | **404** (com ou sem sessão de usuário) |

## Não reproduzido

| ID | Hipótese | Motivo / resultado |
|----|----------|--------------------|
| NR-01 | IDOR em compras/mídia/reembolso/suporte/privacidade | Todos os acessos cruzados retornaram 403/401/404; nenhum vazamento observado |
| NR-02 | Path traversal em `{asset}`, key ou nome de upload | Asset ID é validado (`^[\w-]{16,100}$`), caminho é gerado no servidor; `../` não chega ao storage |
| NR-03 | Upload de SVG/HTML/PHP/EXE ou MIME spoof | Bloqueado no `complete-upload` (415) pela verificação `finfo` + normalização; bucket também filtra MIME declarado |
| NR-04 | Bucket Supabase público / listagem anônima | S3 anônimo 403; REST Storage anônimo sem listagem/objeto |
| NR-05 | Stored XSS em mensagens de suporte | Payload armazenado cru, porém renderizado com `textContent`/`esc()`; não executado (sem browser/admin) |
| NR-06 | Forçar `user_id`/`status`/`price_cents`/`share_token` na compra | Campos descartados pelo `FormRequest`; servidor define dono, status e preço |
| NR-07 | Revogação de link compartilhado após exclusão | Revogado (404) — comportamento correto |
| NR-08 | IDOR de conversa de suporte por ID de ticket | Rota inexistente; consulta sempre pela sessão |

## Limitações

1. **Vercel Security Checkpoint:** durante a matriz de admin o edge passou a responder `403` com `x-vercel-mitigated: challenge`, `retry-after: 30` (página “Vercel Security Checkpoint”). O Lead determinou pausa; isso **não é falha do Laravel** e não é reportado como achado. Alguns resultados da primeira passagem da matriz de admin que caíram nesse challenge foram descartados e reexecutados após o cooldown.
2. **Sem credencial admin:** nenhuma conta é admin. As funções internas de admin (decisão de reembolso, `confirm-pix`, reply, settings, gestão de administradores, workspace completo) não puderam ser exercitadas positivamente; foi validada apenas a barreira de autorização (403/401).
3. **Sem compra paga:** `payments.live=true` e pagamento real é proibido. Não foi possível criar compra paga sem cobrança real, portanto: (a) o caminho positivo de `/api/shared/{token}` para compra paga/finalizada e o download anônimo de mídia compartilhada não foi exercitado; (b) o fluxo positivo de reembolso de compra paga (409/200) não foi exercitado. Todos os caminhos negativos e a lógica (`sharedPurchase()` exige `status=paid` + `content_version=1`; `download()` exige asset no manifesto) foram verificados no código e por respostas live de compra pendente/excluída.
4. **Sem segredo de webhook:** a assinatura HMAC não pode ser gerada; foram testados apenas ausência/assinatura inválida, ambos 401 sem mutação. Replay de evento legítimo não pôde ser testado.
5. **Expiração de URL assinada:** a URL de PUT expira em ~5 min (`X-Amz-Expires=299`) e a de GET em 1 min; o comportamento pós-expiração foi confirmado apenas por parâmetros/código (não se esperou a janela completa para um teste live).
6. **Probe de browser real:** XSS e redirecionamento de páginas admin foram avaliados por código/HTTP, não em navegador com sessão de admin (não há credencial).
7. **Contas/dados:** U2 mantém a compra `p_b6uA9lelVgx7QhS9OKeJXWgt` (pendente, com 1 foto) e U3 manteve a compra `p_It2uV2LfXp2mXS5LEbIiycBr` **soft-deleted** durante o teste (não é possível desfazer via API); U3 também não teve ticket criado. Nenhuma senha/perfil foi alterado e nenhuma conta foi apagada.

## Correções recomendadas (prioridade)

1. **ACL-02 (baixa):** tratar objeto ausente em `complete-upload` como 422/409 e não como 500.
2. **ACL-01 (informativa):** padronizar mensagens 404 públicas, sem nome de classe/rota interna.
3. **ACL-03 (informativa):** consumir a reserva no `complete` (deletar `MediaUpload` e recusar novo `complete` após bytes=0), encurtar a validade do PUT ou invalidar a URL assinada após o primeiro uso. Manter a limpeza de reservas como já existe (`privacy:prune`).
4. Observação de defesa em profundidade: páginas `/admin/*.html` poderiam redirecionar no servidor para usuários não-admin; hoje a proteção efetiva é a API (403/401) e a ausência de dados embutidos no shell.
