# Laravel na Vercel

O backend continua Laravel/PHP. `api/index.php` usa o runtime comunitário `vercel-php@0.9.0` (PHP 8.5.12), com Node 22 para o builder. PostgreSQL guarda contas, sessões, cache e compras; `/tmp` contém somente arquivos temporários e caches compilados.

A decisão atual é guardar mídias no próprio servidor, em `storage/app/private`, sem serviço externo de arquivos. A função Vercel não fornece disco persistente para esses uploads, portanto **o upload fica indisponível na Vercel nessa configuração**. Páginas, SEO e contas continuam funcionando. Para ativar upload local, hospede o backend em um servidor com volume persistente, conforme [MEDIA_STORAGE.md](MEDIA_STORAGE.md).

## Recursos e variáveis

Prefira bancos separados para prévia e produção. Por autorização do mantenedor, a implantação atual compartilha o Neon entre ambos; as chaves da aplicação são diferentes. Não apague dados reais ao testar esse banco compartilhado. Nenhum armazenamento externo de arquivos está sendo contratado. Novos serviços via Marketplace exigem aceite dos termos e conferência dos limites/preços.

Configure no ambiente correspondente da Vercel:

- `APP_KEY`: chave independente por ambiente, gerada com `php artisan key:generate --show`. Preserve a chave após a primeira implantação.
- `APP_ENV=production`, `APP_DEBUG=false`, `APP_URL` com a URL HTTPS definitiva.
- `DB_CONNECTION=pgsql` e `DB_URL` com SSL. `DATABASE_URL` e `POSTGRES_URL` também são aceitas. Alternativamente, configure `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`, `DB_SSLMODE=require`.
- `SESSION_DRIVER=database`, `SESSION_SECURE_COOKIE=true`, `CACHE_STORE=database`.
- `FILESYSTEM_DISK=local`, conforme a decisão atual. O servidor com volume persistente pode definir `MEDIA_STORAGE_PATH`; definir essa variável na Vercel não cria um volume persistente.
- `CRON_SECRET`: segredo aleatório de pelo menos 32 caracteres para o cron diário de limpeza.
- `MAIL_*`, `PRIVACY_EMAIL` e os dados do controlador antes do lançamento público.

Somente para prévia isolada, use `APP_ENV=staging` e `SIMULATED_PAYMENTS=true` para testar o fluxo. A simulação é recusada em produção; não há gateway de pagamento real configurado.

Nunca versione `.env*`, credenciais, diretórios `.vercel` ou exports de banco. `vercel env pull` pode gravar segredos locais: mantenha o arquivo ignorado e fora dos uploads.

## Armazenamento externo: opção futura, não habilitada

Caso o mantenedor decida mudar a estratégia, o adapter S3 existente pode ser configurado com `FILESYSTEM_DISK=s3`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_DEFAULT_REGION` e `AWS_BUCKET`. Credenciais temporárias também precisam de `AWS_SESSION_TOKEN`. Outro provedor compatível pode exigir `AWS_ENDPOINT` e `AWS_USE_PATH_STYLE_ENDPOINT`. Valide as particularidades do provedor real antes de ativar esse modo.

A função tem limite de payload de 4,5 MB; o navegador envia arquivos diretamente ao S3 por PUT assinado, com validade de 5 minutos. O backend reserva a cota, mantém o objeto em quarentena e, na confirmação, baixa, valida e normaliza a mídia antes de incluí-la na compra. As reservas expiram em 20 minutos e o cron remove os objetos pendentes expirados.

Mantenha o bucket privado, com bloqueio de acesso público. Configure CORS no bucket para as origens HTTPS exatas do projeto (prévia e domínio usado): métodos PUT, GET e HEAD, cabeçalhos Content-Type e os cabeçalhos x-amz necessários ao PUT assinado. Não configure cookies no upload direto. `MEDIA_UPLOAD_ORIGINS` permite informar as origens HTTPS do armazenamento para o CSP, separadas por vírgulas; normalmente elas são calculadas pelo bucket e região.

Downloads passam pela autorização Laravel e redirecionam para GET assinado com validade de 1 minuto. Quem obtiver essa URL pode usá-la até expirar. Range e entrega de vídeos ficam a cargo do S3. A mídia local existente mantém seu disco de origem; migrar um banco de outra hospedagem exige copiar também os arquivos privados.

## Implantação

1. Conecte o repositório ao projeto Vercel. Framework Other, Node 22; remova comandos antigos de instalação/build/output do painel, pois `vercel.json` define os builders.
2. Configure as variáveis. Execute `php artisan migrate --force` no banco correto, usando as credenciais desse ambiente em um terminal seguro. Nunca use `migrate:fresh` em banco de uso. O Neon atual já possui as tabelas e contas.
3. Implante uma prévia e verifique cadastro, sessão persistente, os 13 temas, retomada do formulário e os endpoints SEO. No modo local, confirme que `/api/config` informa armazenamento indisponível na Vercel e que nenhum upload é informado como salvo. Se futuramente ativar um adapter externo, valide também CORS, compartilhamento e um arquivo acima de 4,5 MB.
4. Confira os logs e o cron `/api/internal/prune`, executado diariamente às 04:00 UTC. O endpoint exige o bearer `CRON_SECRET` e não deve ser chamado pelo navegador.
5. Publique somente após as verificações apropriadas e informe que o upload local exige um servidor com volume persistente. Não anuncie entrega de mídia como disponível na Vercel enquanto essa limitação permanecer.

O build não cria chaves, não semeia dados e não executa migrations. Instala dependências PHP, verifica requisitos, compila Vite e um FFprobe mínimo a partir do código-fonte oficial fixado por SHA-256. O build Linux precisa de compilador C, make e tar/xz. Os arquivos estáticos publicados são somente os assets compilados e o favicon. O pacote PHP exclui segredos, dados legados e ferramentas locais.

`npm run vercel-build` verifica a parte estática. `node tools/vercel-build.mjs --function` verifica o pacote de assets/FFprobe em Linux x64. A CI executa esse build, testes PHP em SQLite/PostgreSQL e integração HTTP. Esses testes não substituem a verificação real das permissões, CORS e credenciais do provedor.

Monitore falhas, uso, expiração/rotação de credenciais, backups e restauração. O agendamento diário não substitui um worker para tarefas contínuas. Uma implantação sem chave ou conexão de banco retorna 503 sem expor a configuração.
