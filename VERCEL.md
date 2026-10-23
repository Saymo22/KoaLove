# Backend e site na Vercel

O projeto está preparado para servir `public/` pela Vercel e encaminhar `/api/*` para uma função Node.js. O modo local continua disponível com `node server/index.js`.

## 1. Importar o repositório

Na Vercel, importe este repositório e escolha:

- **Root Directory:** raiz do repositório; deixe vazio. Não selecione `public` nem `server`.
- **Framework Preset:** Other.
- **Node.js:** 22.x.

O `vercel.json` já define instalação, build, pasta pública, cabeçalhos e rotas. Não é necessário configurar um servidor permanente nem executar `seed.js` na Vercel.

## 2. Conectar PostgreSQL

Na área Storage/Marketplace do projeto, conecte um PostgreSQL, por exemplo o serviço Neon. Guarde a conexão na variável **`DATABASE_URL`**. A integração também aceita **`POSTGRES_URL`** quando esse for o nome fornecido pelo serviço. Use a conexão recomendada para funções/serverless, com pool e TLS conforme o provedor.

O backend cria as tabelas `na_state` e `na_rate_limits` na primeira execução. A configuração inicial contém os 13 temas, preço inicial de R$ 19,90 e nenhum cupom. Contas e presentes novos são persistidos no PostgreSQL; não ficam em JSON no disco da função.

## 3. Conectar Blob privado

Em Storage, crie um **Vercel Blob com acesso Private** e conecte-o ao mesmo projeto. Confirme que a variável **`BLOB_READ_WRITE_TOKEN`** está disponível no ambiente que será implantado.

Não use um store público. O navegador envia arquivos diretamente ao Blob, com autorização limitada ao usuário, arquivo e tamanho. Depois, a função verifica o conteúdo e confirma a mídia no pedido. A leitura continua pelas rotas autenticadas ou pelo link do presente; não se divulga uma URL pública permanente da mídia. Os limites de 15 MB por foto, 25 MB por música, 100 MB por vídeo e 300 MB por presente continuam aplicáveis.

Os uploads diretos evitam enviar fotos e vídeos grandes no corpo da função. Arquivos temporários de validação usam `/tmp` e são removidos ao final. Não há fallback para um banco temporário quando faltam os serviços: a API responde 503 com orientação de configuração.

Envios abandonados são removidos das reservas na próxima preparação de upload daquele pedido, após expirar a reserva. Blobs de pedidos nunca retomados podem exigir limpeza administrativa no armazenamento; não há tarefa agendada de limpeza nesta entrega.

## 4. Variáveis do projeto

Cadastre em Settings → Environment Variables, conforme os ambientes desejados:

| Variável | Uso |
| --- | --- |
| `DATABASE_URL` ou `POSTGRES_URL` | Conexão PostgreSQL. |
| `BLOB_READ_WRITE_TOKEN` | Token do store Blob **privado**. |
| `PUBLIC_ORIGIN` | Endereço HTTPS final, por exemplo `https://seu-projeto.vercel.app`. |
| `ADMIN_EMAIL` | E-mail do administrador inicial. |
| `ADMIN_PASS` | Senha exclusiva com pelo menos 12 caracteres. |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | Envio de recuperação de senha, quando você contratar/configurar SMTP. |

Na Vercel, o modo PostgreSQL e o cookie HTTPS são automáticos. `NA_STORAGE=postgres` é necessário somente para testar esse modo fora da Vercel. Não cadastre a variável reservada `VERCEL` manualmente. `TRUSTED_PROXIES` não precisa ser preenchida para a borda da Vercel.

O administrador só é criado quando há e-mail explícito, senha de pelo menos 12 caracteres e nenhum administrador no banco. As credenciais padrão do servidor local não criam um administrador na nuvem. Uma redefinição de senha posterior não é sobrescrita pela inicialização.

Use serviços/bancos separados para Preview e Production se quiser evitar que testes e compras reais compartilhem os mesmos registros. Essas conexões precisam existir nos ambientes onde a API for utilizada. Nunca coloque tokens ou senhas em HTML, JavaScript público ou no Git.

## 5. Implantar e conferir

Depois de conectar os serviços e salvar as variáveis, faça **Redeploy**. Confira:

1. `/home.html` e `/criar.html` abrem.
2. `/api/config` responde com `ok: true`, os 13 temas e `media_upload: "blob"`.
3. Cadastro e login funcionam; a sessão permanece ao abrir outra página.
4. Um presente com foto é salvo e aparece na página de pagamento.
5. Uma mídia maior que 4,5 MB é enviada pelo fluxo direto do Blob.
6. O link do presente abre em janela sem login; mídia de um rascunho não abre para terceiros.

O checkout permanece **simulado**, conforme o funcionamento atual do projeto.

Os registros e arquivos do seu computador **não são migrados automaticamente** para os novos serviços. A instalação na nuvem começa com seus próprios registros e preserva o banco local. Não execute o seed de demonstração em Production.

## Verificação feita nesta entrega

- `node tools/build-cloud.cjs`: empacotamento do cliente Blob para o navegador.
- `node tools/test-vercel.cjs`: função e rewrites com PostgreSQL real embutido (PGlite), incluindo persistência entre contextos/instâncias simuladas, transações/rollback, contas, compras, limites e leitura Range. O serviço Blob é simulado nesse teste; nenhum arquivo ou token real é enviado.
- `node tools/test-purchases-client.cjs`: chamada de upload direto privado/multipart para arquivo grande, além do modo local e erros de rede.
- Regressões locais e dos temas executadas com bancos temporários.

Não foi feita implantação em uma conta Vercel nem conexão com um PostgreSQL/Blob real: o usuário pediu a configuração preparada e ainda não tem esses serviços. A validação final na plataforma depende dos passos acima.

Referências oficiais: [funções Node.js](https://vercel.com/docs/functions/runtimes/node-js), [configuração do projeto](https://vercel.com/docs/project-configuration/vercel-json), [uploads pelo navegador](https://vercel.com/docs/vercel-blob/client-upload), [Blob privado](https://vercel.com/docs/vercel-blob/private-storage) e [limites de funções](https://vercel.com/docs/functions/limitations).
