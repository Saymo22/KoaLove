# Investigação do envio de mídias no criador

## Evidência observada em 28/10/2026

As capturas fornecidas mostram `POST .../upload-url` com HTTP 200 e um `PUT` assinado para `*.storage.supabase.co` bloqueado pelo navegador por CORS. A linha do PUT registra **0 bytes transferidos** e ausência de status HTTP. Portanto, esse caso falha antes da transferência do arquivo; as capturas não demonstram lentidão da rede nem falta de espaço no servidor. O navegador apresenta a mensagem genérica de falha de conexão e mantém o rascunho. Os erros de `file:///` na prévia são separados do upload.

O código atual confirma outro problema de experiência: `resources/js/pages/criar.js` chama `NAGift.sync` apenas no envio da revisão. `resources/js/core/gift-sync.js` declara a seleção e envia todas as fotos, depois todos os vídeos e por fim a música, um arquivo por vez. Somente após a validação e a atualização do manifesto navega para `/pagamento`. Com vídeos longos, o usuário espera no último botão por toda a transferência, leitura, FFprobe e gravação. O upload direto também faz o servidor baixar o objeto da quarentena, validar e gravar uma cópia final; portanto, ele não elimina essa etapa de processamento.

## Decisão para hospedagem de baixo custo

Para manter aplicação e mídias no mesmo servidor, use Laravel/PHP-FPM em uma VM ou servidor com **volume privado persistente** e `FILESYSTEM_DISK=local`. O caminho pode ser definido por `MEDIA_STORAGE_PATH`. A rota binária autenticada já existe e usa a mesma origem; esse modo elimina a requisição CORS ao Supabase. A mudança exige migração dos objetos existentes e conferência de referências antes de trocar o disco padrão: cada asset registra seu disco e os arquivos antigos continuam dependendo dele. A implantação atual não pode simplesmente trocar a variável se estiver em funções Vercel, pois o disco local dessas funções não persiste entre execuções ([Vercel](https://vercel.com/kb/guide/how-can-i-use-files-in-serverless-functions)).

O primeiro ajuste inicia o envio ao sair da etapa de mídias, depois de salvar uma cópia local. A compra rascunho é criada cedo para associar os arquivos ao titular; `/media/selection` reconcilia a seleção. O botão final aguarda o envio em curso e confirma o manifesto. Arquivos confirmados durante esta sessão não são retransmitidos na revisão. O status do rascunho informa envio, conclusão ou pendência recuperável. Uma evolução posterior pode mostrar estado e retentativa por arquivo; o envio segue serial para não saturar um servidor pequeno.

Para vídeos grandes, considerar envio em partes retomáveis **somente após** medir a taxa de interrupção: a rota binária atual exige o corpo inteiro e uma falha perto do fim reinicia o arquivo. Uma implementação em partes precisa de reservas, limite agregado, expiração, montagem atômica, hash de integridade, limpeza e validação de MIME/FFprobe após montagem; simplesmente dividir `fetch` não cria retomada segura. Limites de 100 MiB e 300 MiB por compra permanecem os atuais para disco local.

## CORS no ambiente atual

O PUT assinado é para outra origem. Antes de mudar código ou política, reproduzir no navegador e registrar a resposta **OPTIONS** da mesma URL assinada, sem divulgar a URL completa: status, `Access-Control-Allow-Origin`, `Access-Control-Allow-Methods`, `Access-Control-Allow-Headers`, `Vary: Origin` e cabeçalhos solicitados. A requisição precisa permitir a origem exata `https://www.koalove.site`, método `PUT` e `content-type`. O POST 200 em `/api` comprova apenas que a reserva foi emitida. Um teste com `curl` do PUT não substitui o preflight do navegador. A [compatibilidade S3 do Supabase](https://supabase.com/docs/guides/storage/s3/compatibility) documenta URLs pré-assinadas; a configuração CORS do endpoint deve ser verificada no provedor efetivamente usado. Não abrir CORS globalmente nem adicionar cabeçalhos CORS apenas ao Laravel para tentar corrigir resposta de outra origem.

## Capacidade que o painel deve apresentar

O painel atual não mede o volume de mídias. Em servidor próprio, um card administrativo restrito a owner/manager pode consultar `disk_total_space` e `disk_free_space` **no caminho real do volume privado**, além de somar `media_assets.bytes` e reservas `media_uploads.bytes > 0` por disco. Exibir data da medição e `indisponível` se o caminho não estiver montado ou as funções não retornarem números válidos. Bytes do banco são uma estimativa lógica; arquivos temporários, quarentena, backups, logs e outros serviços também consomem o volume. A medida de `free` do sistema é a referência para aceitar novas gravações.

Capacidade operacional sugerida: `utilizável = livre - reserva de segurança - pico de temporários`. Definir a reserva conforme tamanho do volume, operação de backup e maior upload permitido. Alertar antes de cruzar o limite, e recusar **novas** mídias com erro recuperável quando a margem for insuficiente; nunca prometer uma quantidade fixa de presentes baseada só na soma dos assets. Exibir também contagem de arquivos e tamanho médio/percentis das mídias para planejar crescimento. A disponibilidade real requer backup do banco **e** do volume, restauração testada e alertas de disco/erros de gravação.

## Critérios para aceitar a alteração

1. Confirmar onde o domínio executa Laravel e onde reside o volume; medir capacidade real e teste de escrita/leitura/remoção com `php artisan media:check --probe`.
2. No ambiente Supabase ainda ativo, resolver o preflight OPTIONS e verificar foto, vídeo e áudio no Firefox e em outro navegador. Não interpretar a reserva 200 como upload concluído.
3. No servidor local, enviar mídias sintéticas com conexão lenta/interrompida, trocar/remover seleção durante o envio, retomar rascunho, atualizar a página e reproduzir via Range. Verificar autorização e ausência de acesso público ao diretório.
4. Medir tempo entre seleção e confirmação por arquivo e tempo entre botão final e `/pagamento`, além de pico de CPU, memória, disco e espaço temporário. Comparar antes/depois com arquivo de tamanho conhecido.

Nenhuma capacidade real do servidor de produção pode ser afirmada a partir das capturas ou do repositório; ela exige telemetria do host e do volume efetivos.

As novas capturas do painel Supabase mostram `0,10 / 1 GB` de File Storage no ciclo da organização. Esse indicador agregado não mede o volume privado de um servidor próprio nem demonstra que o preflight CORS funciona. O projeto que aparece na URL de PUT da falha é o projeto KoaLove, não o segundo projeto exibido nas capturas.
