# Fotos, vídeos e músicas no servidor

O diagnóstico do envio tardio, do bloqueio CORS observado e da medição de capacidade do volume está em [UPLOAD_INVESTIGATION.md](UPLOAD_INVESTIGATION.md).

## Supabase na Vercel e alternativa local

Para Vercel, a integração [Supabase](SUPABASE.md) usa PostgreSQL e bucket privado, com `FILESYSTEM_DISK=supabase`. Mídias vão diretamente ao Storage por URL assinada e são validadas pelo Laravel antes de entrar no presente. O limite no plano Free é de 50 MB por arquivo (fotos e músicas mantêm limites menores). A ativação exige configurar as chaves S3 e verificar o provedor real.

Este documento também descreve a alternativa `FILESYSTEM_DISK=local`, para hospedar no próprio servidor com disco persistente. PostgreSQL mantém contas, compras e referências; não recebe os bytes das mídias.

O destino padrão é:

```text
storage/app/private/
  gifts/
    <id-da-compra>/
      <uuid-do-arquivo>
```

Fotos, vídeos e músicas da compra ficam nessa mesma estrutura, identificados no banco por `kind`, MIME, tamanho, disco e caminho. O nome original enviado pelo usuário não é usado como caminho. O navegador e os temas utilizam referências estáveis de mídia, independentemente do diretório físico.

Não grave presentes em `public/` e não crie `storage:link` para a pasta privada. Um arquivo público poderia ser aberto sem a autorização da conta ou do link de presente. A entrega das mídias deve passar pelas rotas Laravel existentes.

## Hospedagem com disco persistente

1. Use Laravel/PHP-FPM em um servidor, VM ou contêiner com volume persistente. Preserve o diretório nas atualizações de código e em reinícios.
2. Defina `FILESYSTEM_DISK=local`. Para um volume separado, defina `MEDIA_STORAGE_PATH=/dados/nosso-amor/private`; sem essa variável, vale `storage/app/private`.
3. Crie o diretório privado e dê ao usuário do PHP permissão de leitura/gravação/remoção. Não use permissões universais `777`.
4. Configure o servidor web para servir somente `public/`. O volume privado deve ficar fora da raiz pública.
5. Execute `php artisan migrate --force` e mantenha a `APP_KEY` existente. Não recrie a chave em cada deploy.
6. Execute `php artisan media:check` para revisar a configuração. `php artisan media:check --probe` grava um arquivo sintético em `healthchecks/`, lê seu conteúdo e o remove; não toca em mídias de usuários. Em caso de erro, confira permissões, espaço e eventuais resíduos de diagnóstico.
7. Ajuste os limites HTTP do Nginx/Apache/proxy e PHP para comportar vídeo de 100 MiB mais o envelope da requisição. A aplicação transmite o corpo em blocos e valida os limites novamente.
8. Teste uma foto, um áudio e um vídeo em uma conta de teste; atualize a página, reinicie a aplicação e confirme que os três continuam disponíveis. Confira também outro usuário sem acesso e um link de presente revogado.

Se usar múltiplas instâncias, todas precisam do mesmo volume privado montado no mesmo caminho. Um disco separado por instância não atende um link que cair em outro servidor.

## Limitação do modo local na Vercel

As funções da Vercel não fornecem um diretório local persistente para arquivos enviados pelos usuários. `/tmp` é temporário e o pacote publicado não funciona como um volume gravável permanente. Colocar uploads em `public/` ou trocar o nome do diretório para `storage/` não resolve essa limitação.

Se a Vercel estiver configurada com disco local ou com credenciais Supabase ausentes, **o upload permanece indisponível**. `GET /api/config` informa `media_storage.configured=false`; o cliente preserva o rascunho e a API recusa a gravação com `503 MEDIA_UNAVAILABLE`. Não há simulação de upload salvo nem fallback silencioso para `/tmp`.

Para ativar upload na Vercel, conclua a configuração [Supabase](SUPABASE.md). Para usar disco local em produção, hospede o backend em um servidor com volume persistente, conforme a seção anterior. A mudança de variável não transporta arquivos existentes entre os discos.

## Envio, validação e entrega

1. O usuário autenticado cria um rascunho. A sessão e o token CSRF protegem as mutações.
2. O cliente envia o corpo binário a `POST /api/purchases/{purchase}/media/{asset}`. O backend verifica propriedade e estado editável.
3. Um arquivo temporário recebe o corpo em blocos. MIME real, tamanho e conteúdo são validados. Imagens são decodificadas e recodificadas em PNG; áudio e vídeo passam por FFprobe.
4. A mídia validada é gravada no disco privado. A transação registra a referência na compra, respeitando a cota do tipo definida no plano (`plan_snapshot`): novas fotos, vídeos ou músicas acima do limite são recusadas com 422 antes de consumir espaço, mas a substituição de mídias já referenciadas no manifesto continua permitida. Falhas removem arquivos sem referência; tentativas repetidas com o mesmo ID não duplicam a mídia.
5. A finalização grava o manifesto com as mídias selecionadas e revalida as cotas do plano; o upload direto também conta reservas pendentes. Os temas consomem as referências estáveis. IndexedDB continua sendo um rascunho/cache do navegador, e não substitui a cópia no servidor.
6. O dono usa a rota autenticada de mídia; um destinatário usa o link de um presente pago, ativo e finalizado. Somente mídias do manifesto são entregues. A resposta local suporta Range para reprodução de vídeo/áudio e usa o MIME validado.

| Tipo | Formatos aceitos | Limite por arquivo |
| --- | --- | --- |
| Foto | JPEG, PNG, WebP, GIF, AVIF, conforme os decodificadores GD instalados | 15 MiB e 16 megapixels; saída normalizada também precisa caber |
| Música | MP3, WAV, Ogg, MP4/M4A e WebM com faixa de áudio | 25 MiB |
| Vídeo | MP4, WebM e QuickTime com faixa de vídeo | 100 MiB |

Cota por compra: 80 assets e 300 MiB, além da cota de mídia de cada plano. O cadastro de planos aceita no máximo 1–12 fotos, 0–4 vídeos e 0–1 música; compras antigas sem `plan_snapshot` usam o padrão 12/4/1. O manifesto final e cada upload respeitam essa cota, e o formulário/home/admin exibem os limites vindos da API. GIF animado torna-se uma imagem estática. O upload não adiciona suporte a documentos PDF/Word ou outros anexos.

## Operação, backups e exclusão

Antes do envio, `/media/selection` libera a cota de arquivos abandonados por uma tentativa interrompida. O manifesto salvo continua íntegro até a substituição ser finalizada. Reservas diretas canceladas e caminhos descartados conservam marcadores com bytes zero para o `privacy:prune`, inclusive se uma URL PUT ainda válida for reutilizada ou o armazenamento estiver temporariamente indisponível.

- Mantenha GD e FFprobe atualizados, espaço livre, limites de memória e monitoramento de falhas. Não exponha caminhos privados nem credenciais em mensagens da API.
- Execute o scheduler diariamente para `privacy:prune`. Links são revogados ao excluir um presente; os arquivos e os registros são purgados conforme os prazos de retenção em `SECURITY.md`.
- Faça backups criptografados do banco **e** do diretório privado. Preserve a associação entre referências e arquivos; restauração apenas do banco não recupera mídias. O prazo máximo de backups definido para o projeto é 30 dias.
- Copie o volume antes de uma migração. Depois de restaurar, reaplique exclusões pendentes e valide a reprodução antes de reabrir o acesso.
- Ao trocar o diretório, copie os arquivos mantendo `gifts/<compra>/<uuid>` e só então altere `MEDIA_STORAGE_PATH`. A mudança de variável não move arquivos automaticamente.
- Uma futura mudança de provedor deve manter o campo `disk` de cada mídia e as referências do manifesto; não reescreva os IDs usados pelos temas. Valide privacidade, CORS, URLs temporárias e o provedor real antes de ativar outro adapter.

## Testes

`LocalMediaStorageTest` verifica upload de PNG, WAV sintético e WebM sintético, arquivos privados no disco local, leitura autorizada, Range de vídeo, isolamento de usuário, diagnóstico com limpeza e recusa de disco local serverless. As suítes completas também cobrem retenção, compartilhamento, cotas, validação e rascunhos recuperáveis.

Referência da plataforma: [sistema de arquivos das funções Vercel](https://vercel.com/docs/functions/runtimes#file-system-support).
