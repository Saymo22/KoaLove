# Laravel na Vercel

O backend continua Laravel/PHP. `api/index.php` usa o runtime comunitário `vercel-php@0.9.0` (PHP 8.5.12), com Node 22 para o builder. A Vercel não fornece disco persistente para a função: PostgreSQL guarda contas, sessões, cache e compras; um bucket S3 privado guarda as mídias. `/tmp` contém somente arquivos temporários e caches compilados.

## Recursos e variáveis

Crie recursos separados para prévia e produção. A instalação via Marketplace exige aceite pessoal dos termos de cada provedor. Consulte os limites e preços vigentes antes de ativar os recursos; não presuma uso ilimitado gratuito.

Configure no ambiente correspondente da Vercel:

- `APP_KEY`: chave independente por ambiente, gerada com `php artisan key:generate --show`. Preserve a chave após a primeira implantação.
- `APP_ENV=production`, `APP_DEBUG=false`, `APP_URL` com a URL HTTPS definitiva.
- `DB_CONNECTION=pgsql` e `DB_URL` com SSL. `DATABASE_URL` e `POSTGRES_URL` também são aceitas. Alternativamente, configure `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`, `DB_SSLMODE=require`.
- `SESSION_DRIVER=database`, `SESSION_SECURE_COOKIE=true`, `CACHE_STORE=database`.
- `FILESYSTEM_DISK=s3`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_DEFAULT_REGION`, `AWS_BUCKET`. Credenciais temporárias também precisam de `AWS_SESSION_TOKEN`. Para outro provedor S3, configure `AWS_ENDPOINT` e `AWS_USE_PATH_STYLE_ENDPOINT` conforme o serviço.
- `CRON_SECRET`: segredo aleatório de pelo menos 32 caracteres para o cron diário de limpeza.
- `MAIL_*`, `PRIVACY_EMAIL` e os dados do controlador antes do lançamento público.

Somente para prévia isolada, use `APP_ENV=staging` e `SIMULATED_PAYMENTS=true` para testar o fluxo. A simulação é recusada em produção; não há gateway de pagamento real configurado.

Nunca versione `.env*`, credenciais, diretórios `.vercel` ou exports de banco. `vercel env pull` pode gravar segredos locais: mantenha o arquivo ignorado e fora dos uploads.

## Upload e acesso às mídias

A função tem limite de payload de 4,5 MB; o navegador envia arquivos diretamente ao S3 por PUT assinado, com validade de 5 minutos. O backend reserva a cota, mantém o objeto em quarentena e, na confirmação, baixa, valida e normaliza a mídia antes de incluí-la na compra. As reservas expiram em 20 minutos e o cron remove os objetos pendentes expirados.

Mantenha o bucket privado, com bloqueio de acesso público. Configure CORS no bucket para as origens HTTPS exatas do projeto (prévia e domínio usado): métodos PUT, GET e HEAD, cabeçalhos Content-Type e os cabeçalhos x-amz necessários ao PUT assinado. Não configure cookies no upload direto. `MEDIA_UPLOAD_ORIGINS` permite informar as origens HTTPS do armazenamento para o CSP, separadas por vírgulas; normalmente elas são calculadas pelo bucket e região.

Downloads passam pela autorização Laravel e redirecionam para GET assinado com validade de 1 minuto. Quem obtiver essa URL pode usá-la até expirar. Range e entrega de vídeos ficam a cargo do S3. A mídia local existente mantém seu disco de origem; migrar um banco de outra hospedagem exige copiar também os arquivos privados.

## Implantação

1. Conecte o repositório ao projeto Vercel. Framework Other, Node 22; remova comandos antigos de instalação/build/output do painel, pois `vercel.json` define os builders.
2. Configure as variáveis e o CORS para a origem da prévia. Execute `php artisan migrate --force` contra o banco vazio correto, usando as credenciais desse ambiente em um terminal seguro. Nunca use `migrate:fresh` em banco de uso.
3. Implante uma prévia e verifique cadastro, sessão persistente, os 13 temas, upload de imagem/áudio/vídeo, retomada do formulário e acesso compartilhado. Teste um arquivo acima de 4,5 MB para confirmar o caminho direto.
4. Confira os logs e o cron `/api/internal/prune`, executado diariamente às 04:00 UTC. O endpoint exige o bearer `CRON_SECRET` e não deve ser chamado pelo navegador.
5. Promova para produção somente após CI verde, configuração dos serviços de produção e validação da prévia.

O build não cria chaves, não semeia dados e não executa migrations. Instala dependências PHP, verifica requisitos, compila Vite e um FFprobe mínimo a partir do código-fonte oficial fixado por SHA-256. O build Linux precisa de compilador C, make e tar/xz. Os arquivos estáticos publicados são somente os assets compilados e o favicon. O pacote PHP exclui segredos, dados legados e ferramentas locais.

`npm run vercel-build` verifica a parte estática. `node tools/vercel-build.mjs --function` verifica o pacote de assets/FFprobe em Linux x64. A CI executa esse build, testes PHP em SQLite/PostgreSQL e integração HTTP. Esses testes não substituem a verificação real das permissões, CORS e credenciais do provedor.

Monitore falhas, uso, expiração/rotação de credenciais, backups e restauração. O agendamento diário não substitui um worker para tarefas contínuas. Uma implantação sem chave ou conexão de banco retorna 503 sem expor a configuração.
