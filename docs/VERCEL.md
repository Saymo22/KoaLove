# Laravel na Vercel

O recebimento escolhido é [Pix com conferência manual](PIX_MANUAL.md), com liberação pelo admin após conferir o crédito no banco.

O backend continua Laravel/PHP. `api/index.php` usa o runtime comunitário `vercel-php@0.9.0` (PHP 8.5.12), com Node 22 para o builder. PostgreSQL mantém contas, sessões, cache e compras; `/tmp` contém somente temporários e caches compilados.

A integração [Supabase](SUPABASE.md) fornece banco no schema privado e armazenamento persistente das mídias. Configure as variáveis e conclua os testes descritos nesse guia antes de considerar o upload disponível. `FILESYSTEM_DISK=local` continua recusado na Vercel, porque a função não oferece volume persistente.

## Configuração e implantação

1. Conecte o repositório ao projeto Vercel. Use Framework Other e Node 22, sem comandos antigos de instalação/build/output no painel; `vercel.json` define os builders.
2. Preserve `APP_KEY` e `CRON_SECRET`. Mantenha `APP_ENV=production`, `APP_DEBUG=false`, `APP_URL` com domínio HTTPS, cookies seguros, sessões/cache no banco e `SIMULATED_PAYMENTS=false`. Configure `MAIL_*` e identificação do controlador antes do lançamento. Para Mercado Pago, siga [PAYMENTS.md](PAYMENTS.md): migre as tabelas, configure segredos somente em Production e reimplante. Mantenha `PAYMENTS_ENABLED=false` em Preview com banco compartilhado; ative produção somente após configurar e verificar a conta.
3. Prepare o PostgreSQL privado e o bucket conforme [SUPABASE.md](SUPABASE.md). Execute migrations com Session pooler; a aplicação usa Transaction pooler com TLS e prepared statements emulados. Não altere DB_URL sem migrar e verificar os dados existentes.
4. Configure as chaves S3 diretamente nas variáveis secretas Production/Preview. Nunca publique `.env*`, `.vercel`, exports ou arquivos privados. O comando `vercel env pull` pode escrever segredos locais: mantenha o resultado ignorado pelo Git e excluído do pacote.
5. Publique uma implantação, valide cadastro/login anterior, permissões, criador/13 temas, SEO, mídia real acima de 4,5 MB, CORS, download/Range e isolamento. No modo indisponível, `/api/config` deve informar `configured=false` e preservar rascunhos.
6. Para a troca do banco, use manutenção Laravel em cache compartilhado (`APP_MAINTENANCE_DRIVER=cache`, `APP_MAINTENANCE_STORE=database`), copie/verifique sob manutenção e só reabra após testar o destino. Preserve o Neon original para contingência; rollback após novas gravações exige reconciliação.
7. Monitore o cron diário `/api/internal/prune`, às 04:00 UTC, protegido por bearer `CRON_SECRET`. Prévia com simulação só deve usar banco isolado de testes; não efetue pagamentos simulados no banco de produção.

O upload direto usa PUT assinado de até 5 minutos sem cookies; o backend reserva cota, mantém quarentena e valida a mídia na confirmação. Downloads autorizados redirecionam para GET privado de 1 minuto. O CSP calcula a origem pelo endpoint do armazenamento; configurações CORS AWS não podem ser aplicadas ao Supabase por `PutBucketCors`, que ele não implementa.

O build não cria chaves, não semeia dados e não executa migrations. Instala dependências PHP, verifica requisitos, compila Vite e um FFprobe mínimo a partir do código-fonte oficial fixado por SHA-256. O build Linux precisa de compilador C, make e tar/xz. Os arquivos estáticos publicados são somente os assets compilados e o favicon. O pacote PHP exclui segredos, dados legados e ferramentas locais.

`npm run vercel-build` verifica a parte estática. `node tools/vercel-build.mjs --function` verifica o pacote de assets/FFprobe em Linux x64. A CI executa esse build, testes PHP em SQLite/PostgreSQL e integração HTTP. Esses testes não substituem a verificação real das permissões, CORS e credenciais do provedor.

Monitore falhas, uso, expiração/rotação de credenciais, backups e restauração. O agendamento diário não substitui um worker para tarefas contínuas. Uma implantação sem chave ou conexão de banco retorna 503 sem expor a configuração.
