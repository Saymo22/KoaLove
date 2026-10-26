# Desenvolvimento

- Backend exclusivamente Laravel 13 / PHP >=8.5.12 <8.6. PostgreSQL 18 recomendado.
- Leia docs/DEVELOPMENT.md, docs/API.md e docs/SECURITY.md antes de alterar os contratos.
- Views em resources/views, CSS em resources/css, JS em resources/js. Nenhum CSS/JS inline em Blade.
- resources/assets.json registra páginas, rotas e ordem dos scripts. Vite preserva escopo compartilhado dos scripts clássicos por página; mudar para módulos separados requer migrar seus consumidores.
- Preserve as URLs .html, os 13 temas, referências estáveis @media e o formato {ok,data}/{ok:false,error}.
- Pagamentos e QR passam por adapters. Simulação somente local; nunca afirmar cobrança real.
- Nunca semear, sobrescrever, excluir ou versionar server/data, .env, backups e arquivos privados. Importação legada é opt-in, em banco vazio e a partir de cópia.
- Não colocar senhas ou dados pessoais em logs, fixtures, commits ou respostas JSON.
- Fluxo: branch codex/*, commits coerentes, testes verdes, PR; merge somente após CI verde.
- Verificações: composer test; php vendor/bin/phpunit -c phpunit.pgsql.xml; npm test; npm run build; php vendor/bin/pint --test. Banco de testes sempre separado, com sufixo _test.

## Banco (resumo)

- plans, promotions, coupons: catálogo privado gerenciado pelo admin, valores em centavos, limites de mídia e descontos percentuais ou fixos em centavos com validade e exclusão lógica. coupons inclui usage_limit; usos são reservados no checkout, com trava do cupom. purchases guarda plan_id/plan_snapshot; payment_checkouts guarda pricing_details. Ver docs/PRICING.md.
- purchases registra first_shared_opened_at e share_tracking_started_at; refunds guarda request_kind e eligibility_snapshot. Garantia comercial de 72h sem abertura pública, com análise de direitos legais independente. Ver docs/REFUNDS.md. Não inventar histórico de acessos anteriores à ativação do registro.
- users: nome, email único normalizado, senha hash, role user/admin, deletion_requested_at, admin_level (owner/manager/support, null legado equivale ao acesso integral existente), admin_note e admin_preferences JSON.
- purchases: ID textual, user FK, chave idempotente única por usuário, share_token único, status, content/manifest JSON, versão, valores em centavos, timestamps, soft delete.
- media_assets: purchase FK, asset_id único por compra, tipo, MIME, bytes, disk e caminho privado.
- media_uploads: UUID, compra/asset, MIME, bytes reservados, disk/caminho privado e expiração; controla uploads diretos em quarentena. Bytes zero preserva marcadores de limpeza para reservas concluídas/canceladas e arquivos abandonados; seleção autenticada não remove arquivos do manifesto salvo.
- refunds: compra/usuário FK, motivo, status, decisão e datas.
- payment_checkouts: UUID e compra única/FK, provider, snapshot de valor/cupom/método e live_mode, preferência/URL, expiração, estado e ID do pagamento aprovado. Pix manual guarda payload/recebedor, referência bancária única e admin/data da conferência, rejection_reason para recusa manual. pricing_details inclui coupon_id para contagem estável de usos. Conteúdo e preço ficam congelados após iniciar checkout.
- payment_receipts: ID Mercado Pago único, checkout FK indexada, estado, valor bruto e estornado em centavos, datas; sem cartão ou payload bruto.
- tickets: usuário FK, assunto, status open/answered/closed, priority low/normal/high, mensagens JSON. Chat autenticado e triagem em docs/CHATBOT.md; mensagens com UUID, role/text/at, dono selecionado no servidor, respostas na central admin e polling privado sem cache.
- admin_settings: chave/JSON privado, configurações globais e temas desativados. admin_activities: autor FK anulável, categoria, ação, referência sem conteúdo pessoal, data e exclusão lógica; retenção 30 dias, separado de audit_events. admin_invitations: UUID, e-mail, função, autor FK, expiração/aceite/revogação; aceite autenticado pela mesma conta. Ver docs/ADMIN-UI.md.
- audit_events: usuário FK anulável, rota sem parâmetros, IP HMAC, status e data; retenção 30 dias.
- sessions, password_reset_tokens, cache/cache_locks, jobs/job_batches/failed_jobs: infraestrutura Laravel.

Atualize este resumo junto com mudanças no esquema.

## Supabase
- O mesmo esquema Laravel pode residir em app_private (DB_SCHEMA), fora da Data API. Não exponha esse schema nem crie políticas públicas para as tabelas de contas/sessões/compras.
- A autenticação continua Laravel; auth.users do Supabase não substitui users e não deve receber cópias das senhas.
- O disco supabase usa bucket privado e S3 com chaves somente no backend, sem ACLs de objeto. Plano Free: teto conservador de 50.000.000 bytes por arquivo, anunciado pela API e aplicado antes/depois da normalização.
- Não executar supabase db reset/push para reconstruir as tabelas Laravel; database/migrations é a fonte do esquema. supabase/bootstrap.sql prepara somente role/schema/permissões de um projeto novo.
