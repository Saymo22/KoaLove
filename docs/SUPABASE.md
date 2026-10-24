# Supabase e Vercel

A API continua Laravel/PHP na Vercel. O Supabase fornece PostgreSQL persistente e Storage privado para fotos, vídeos e músicas. As rotas `.html`, os 13 temas, a sessão, as senhas existentes, os perfis administrativos e os contratos JSON continuam os mesmos. Não há uma segunda API de compras em Edge Functions nem migração das contas para Supabase Auth.

## Criar a infraestrutura

1. Crie um projeto no plano escolhido e confira os limites no painel. O projeto desta implantação se chama **ProjetoNA**, organização **Nosso Amor**, região `us-east-1`. O projeto anterior da organização não é alterado.
2. Inspecione as tabelas antes de qualquer DDL. Em um projeto novo, aplique [bootstrap.sql](../supabase/bootstrap.sql) pelo administrador: cria o schema `app_private` e o role limitado `projetona_app`, sem senha padrão, superusuário ou permissão de administrar outros roles.
3. Configure uma senha aleatória para esse role em um canal administrativo seguro. Copie o host real do pooler pelo diálogo **Connect**; não deduza o índice do host pela região. Use usuário `projetona_app.<project-ref>`, banco `postgres`, TLS obrigatório. Porta `5432` (Session pooler) para migrations e cópia; `6543` (Transaction pooler) para a aplicação serverless, com prepared statements emulados.
4. Execute `php artisan migrate --force` com `DB_SCHEMA=app_private`, como `projetona_app`. As migrations Laravel são a fonte das tabelas e índices. Nunca use `migrate:fresh`, `db reset` ou seeds em banco com dados reais.
5. Não adicione `app_private` aos schemas expostos pela Data API. `anon`, `authenticated` e `service_role` não têm USAGE nesse schema. As tabelas são acessadas pela conexão PostgreSQL do backend e pelas policies Laravel. Nenhuma senha/chave de banco vai para JavaScript.
6. Crie um bucket **privado** `gift-media` pela API/painel Storage. Configure limite global e do bucket de `50000000` bytes. Tipos aceitos: imagens JPEG/PNG/WebP/GIF/AVIF; áudio MPEG/WAV/OGG/MP4/WebM; vídeo MP4/WebM/QuickTime. Permita também `application/octet-stream` para o diagnóstico sintético privado. Não crie policies de acesso anônimo ou autenticado ao bucket: a autenticação dos usuários do site continua no Laravel.
7. Em **Storage → S3 → Access keys**, gere uma chave exclusiva para o backend e salve os dois valores diretamente nas variáveis secretas da Vercel. Chaves S3 administrativas ignoram RLS; nunca use prefixo `VITE_`, envie para o navegador ou inclua em commits. O nome da chave pode ser `ProjetoNA Vercel`.

## Variáveis da Vercel

Configure em cada ambiente desejado, sem trocar as chaves Laravel existentes:

| Variável | Valor |
| --- | --- |
| `DB_CONNECTION` | `pgsql` |
| `DB_URL` | URI secreta do Transaction pooler, com role dedicado e `sslmode=require` |
| `DB_SCHEMA` | `app_private` |
| `DB_SSLMODE` | `require` |
| `DB_EMULATE_PREPARES` | `true` |
| `FILESYSTEM_DISK` | `supabase` |
| `SUPABASE_REGION` | Região real do projeto (`us-east-1` nesta implantação) |
| `SUPABASE_S3_ENDPOINT` | Endpoint exibido no painel; prefira `https://<project-ref>.storage.supabase.co/storage/v1/s3` |
| `SUPABASE_S3_ACCESS_KEY_ID` | Access Key ID secreto do backend |
| `SUPABASE_S3_SECRET_ACCESS_KEY` | Secret access key secreta do backend |
| `SUPABASE_STORAGE_BUCKET` | `gift-media` |
| `SUPABASE_STORAGE_MAX_FILE_BYTES` | `50000000` |
| `SESSION_DRIVER` / `CACHE_STORE` | `database` |
| `APP_MAINTENANCE_DRIVER` / `APP_MAINTENANCE_STORE` | `cache` / `database` |

Preserve `APP_KEY`, `CRON_SECRET`, domínio, cookies seguros, SEO e variáveis de correio. Use bancos/projetos separados para testes e produção quando disponíveis; não execute a suíte destrutiva de testes no projeto de uso. A mudança de variáveis exige nova implantação. A presença das variáveis não confirma permissões nem acesso ao bucket: faça o diagnóstico e o teste real abaixo.

## Upload e entrega

O navegador pede uma reserva à API com sessão/CSRF e envia por PUT assinado diretamente ao Storage, sem cookies. Isso evita o limite de corpo de 4,5 MB da função Vercel. A URL vale até 5 minutos; a reserva dura 20 minutos. A API verifica dono, tamanho, MIME real e limites, normaliza imagens para PNG e valida áudio/vídeo pelo FFprobe. Só então cria o asset definitivo. Reservas concluídas permanecem com bytes zero até expirar para limpar reenvios da URL ainda válida.

O adapter remove `ACL` antes de assinar/enviar, pois o Supabase não implementa ACLs S3. A privacidade é definida no bucket. Não use `setVisibility` para publicar objetos. Downloads passam pela API autorizada e redirecionam para GET assinado de 1 minuto; o Storage atende Range. Uma URL emitida permanece utilizável até expirar.

No Free, o teto do aplicativo é 50 MB decimais por arquivo; fotos continuam em até 15 MiB/16 MP e músicas em até 25 MiB. A cota por compra continua 300 MiB/80 assets e o manifesto 12 fotos/4 vídeos/1 música. A API publica os limites efetivos e o cliente recusa arquivos maiores antes de reservar/transmitir. Imagens normalizadas também precisam caber nesse teto. Nenhum upgrade é automático. Monitore armazenamento total, egress, conexões e pausas do plano gratuito; um limite por arquivo não garante capacidade total ilimitada.

O CSP calcula a origem pelo endpoint S3, sem seu caminho. Verifique o preflight OPTIONS no endpoint real e um PUT no navegador; a API S3 do Supabase não implementa `PutBucketCors`. Não tente aplicar a configuração de CORS de um bucket AWS ao Supabase. Não afrouxe o CSP ou acrescente credenciais ao PUT para contornar falhas.

## Migração de dados existentes

Faça uma cópia criptografada do Neon e preserve o recurso original. Programe uma janela curta de manutenção: use manutenção Laravel em cache compartilhado, confirme que o domínio recusou mutações e aguarde requisições anteriores terminarem. Copie em transações e preserve IDs, hashes, roles, conteúdo/manifesto, datas, sessões, tokens e registros de migrations. Compare contagens e hashes dos registros sem imprimir dados pessoais. Ajuste as sequências numéricas depois da cópia. Nunca restaure roles/schemas internos `auth`/`storage` de outro provedor.

Não troque `DB_URL` antes da comparação e do teste da aplicação no destino. Preserve `APP_KEY` para manter sessões e dados criptografados compatíveis. Se houver assets, copie também seus objetos, verifique tamanho/conteúdo e só depois altere o disco de origem de cada registro. O banco por si só não transporta binários. Uma migração com mídias locais exige acesso ao volume original; não finja que o deploy transporta esses arquivos.

Em caso de falha, restaure as variáveis e a implantação anteriores e remova a manutenção no banco original. Depois de reabrir a aplicação no novo banco, um rollback precisa reconciliar novas gravações: não promova uma cópia antiga descartando usuários/presentes criados após a troca. Mantenha backups com retenção máxima de 30 dias e teste a restauração. Não remova o Neon automaticamente.

## Verificação e operação

- Execute `php artisan media:check --probe` com a configuração do ambiente; grava/lê/remove somente `healthchecks/<uuid>`.
- Confira `/api/config`: `media_upload=direct`, `media_storage.configured=true` e limite de vídeo `50000000`. Esse indicador verifica configuração, não substitui o probe.
- Valide login de conta anterior, permissões de admin, cadastro, rascunho e os 13 temas. Confira que a Data API e um GET público do bucket não revelam contas ou objetos.
- No navegador, envie foto, áudio, vídeo e um arquivo válido acima de 4,5 MB. Confirme upload, normalização, download/Range e bloqueio de outro usuário/quarentena. Use somente fixtures sintéticas em verificações automáticas.
- O cron Vercel `/api/internal/prune` continua às 04:00 UTC, com bearer `CRON_SECRET`: expira reservas, remove reenvios e aplica retenção. Monitore falhas no Supabase e na Vercel.
- Pagamento real e SMTP continuam sendo integrações independentes. Supabase não ativa cobrança nem correio de recuperação do Laravel automaticamente.

Fontes: [conexões PostgreSQL](https://supabase.com/docs/guides/database/connecting-to-postgres), [S3 e credenciais](https://supabase.com/docs/guides/storage/s3/authentication), [compatibilidade S3](https://supabase.com/docs/guides/storage/s3/compatibility), [limites](https://supabase.com/docs/guides/storage/uploads/file-limits) e [proteção da Data API](https://supabase.com/docs/guides/database/hardening-data-api).
