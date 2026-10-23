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
- users: nome, email único normalizado, senha hash, role user/admin, deletion_requested_at.
- purchases: ID textual, user FK, chave idempotente única por usuário, share_token único, status, content/manifest JSON, versão, valores em centavos, timestamps, soft delete.
- media_assets: purchase FK, asset_id único por compra, tipo, MIME, bytes e caminho privado.
- refunds: compra/usuário FK, motivo, status, decisão e datas.
- tickets: usuário FK, assunto, status, mensagens JSON.
- audit_events: usuário FK anulável, rota sem parâmetros, IP HMAC, status e data; retenção 30 dias.
- sessions, password_reset_tokens, cache/cache_locks, jobs/job_batches/failed_jobs: infraestrutura Laravel.

Atualize este resumo junto com mudanças no esquema.
