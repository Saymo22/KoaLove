# 💖 Nosso Amor — Presentes Digitais

Uma plataforma web completa para criar, personalizar e compartilhar presentes digitais inesquecíveis. O usuário pode montar uma página com fotos, vídeos, música e uma carta de amor, escolher entre diversos temas (Netflix, Spotify, Vinil, Clássicos) e enviar o link ou QR Code para alguém especial.

## 🚀 Funcionalidades

- **Criação Passo a Passo:** Wizard interativo com validação de dados, upload de mídia e prévia em tempo real no celular.
- **Temas Exclusivos:** Layouts customizados que alteram completamente o CSS e a experiência do presente (Netflix, Spotify, Vinil, Cinema, Jardim Secreto, etc.).
- **Checkout Simulado:** Tela de pagamento com aplicação de cupons de desconto, cálculo de total e geração de recibo.
- **Comprovante de Pagamento:** Histórico financeiro em formato de timeline para o usuário, com geração de recibo pronto para impressão/PDF.
- **Autenticação por Sessão:** Login e cadastro via API REST, com sessão em cookie `HttpOnly` (o frontend nunca lê `document.cookie`, sempre confirma a sessão em `GET /api/auth/me`).
- **Painel Administrativo:** Dashboard com visão geral, gestão de clientes, reembolsos e suporte, consumindo os endpoints `/api/admin/*`.
- **Persistência no servidor:** conteúdo completo e mídias ficam em `server/data/`, fora da raiz pública. O IndexedDB guarda rascunhos recuperáveis e um cache opcional.
- **Página de Visualização (Gift):** Experiência imersiva (sem navbar) com animações, player de música, lightbox para fotos e contador de tempo juntos.
- **Menu Hambúrguer:** Navegação responsiva e elegante para dispositivos móveis.
- **Páginas Legais:** Termos de Uso, Política de Privacidade e Reembolso com design premium e menu lateral fixo.

## 🛠️ Tecnologias Utilizadas

O projeto foi construído do zero, sem frameworks, focando em performance e design:
- **HTML5** (Semântico e acessível)
- **CSS3** (Variáveis, Flexbox, CSS Grid, animações complexas)
- **JavaScript (Vanilla)** (ES6+, módulos e manipulação de DOM)
- **Node.js 22+** (Servidor HTTP + API REST, validação de mídia com Sharp/FFprobe e envio SMTP com Nodemailer)
- **IndexedDB** (Armazenamento local de fotos/vídeos/música)
- **node-qrcode** (Geração local do QR Code, sem enviar o link privado a terceiros)

## 🖥️ Backend e API

O servidor fica em `server/` e serve simultaneamente a **API REST** (`/api/*`) e os **arquivos estáticos** de `public/`. Os endereços continuam iguais: `/criar.html`, `/ver.html`, `/admin/login.html` etc.

Os 13 modelos completos ficam em `public/teste/`: Namoro, Casamento, Amizade, Família, Aniversário, Carta Antiga, Jardim Secreto, Scrapbook e os exclusivos Netflix, Vinil, Cinema, Spotify e Retrô. Cada um possui seu próprio HTML, CSS e JavaScript, sem misturar os estilos entre temas. Para abrir um exemplo, use `/ver.html?demo=1&tema=netflix` (substitua pelo identificador do tema).

Em `criar.html`, a prévia usa exatamente o mesmo modelo de `ver.html`. O formulário tem oito etapas: **Tema, Capa, Fotos e vídeos, Momentos, Seu tema, Mensagem, Música e Revisão**. Rótulos, explicações e campos de capa se adaptam ao modelo escolhido. A etapa **Seu tema** oferece um editor de seção e item para textos e funções específicas: quiz, memórias, membros da família, cartas do cofre, desejos da fonte, constelação e itens já realizados. Os exclusivos acrescentam catálogo e episódios, notificações, álbuns, faixas dos lados A/B, cartazes e avaliação por pipocas, playlists, letras, fitas VHS e fliperama. As personalizações são separadas por tema e gravadas em `themeData` na API e no IndexedDB. Nos campos de imagem, é possível escolher uma foto do presente; referências `@media:ID` mantêm a foto escolhida ao reordenar o álbum; referências antigas `@photo:N` são migradas ao editar. A prévia usa uma moldura estável, rolagem manual, retorno ao início e modo ampliado.

Os players exclusivos usam o áudio e os vídeos do formulário, com progresso e controles ligados à mídia real. Faixas também aceitam um endereço de áudio próprio nos detalhes; sem ele, usam a música principal. Fotos viram capas, cartazes e clipes. O Netflix pula a seleção de perfil na prévia e oferece os perfis na visualização com introdução ativada. O servidor serve arquivos públicos de áudio e vídeo com seus tipos MIME correspondentes; o envio pelo formulário usa rotas autenticadas e arquivos privados no servidor.

Aniversário usa **Data de nascimento** para calcular a idade e permite apagar velas por toque ou, após permissão do navegador, pelo microfone. A permissão de microfone fica restrita à mesma origem nas páginas que incorporam esse tema.

Para verificar a integração, execute `node tools/verify-theme.cjs`. A verificação cobre a troca de modelos, referências locais, rotas HTTP, validação e gravação/leitura dos detalhes sem modificar o banco do usuário.

### Como rodar

```bash
cd server
npm ci           # instala as dependências nas versões do package-lock.json
node seed.js      # cria/popula o banco local em server/data (apenas na primeira vez)
node index.js     # inicia o servidor em http://127.0.0.1:3000
```

### Variáveis de ambiente

Para recuperação de senha, configure `PUBLIC_ORIGIN`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS` e `SMTP_FROM`, conforme `server/.env.example`. O processo lê as variáveis do ambiente; arquivos `.env` não são carregados automaticamente. Use o endereço público HTTPS em `PUBLIC_ORIGIN`; HTTP é permitido apenas em localhost. O envio exige TLS (porta 587 com STARTTLS, ou 465 com `SMTP_SECURE=true`). Sem configuração, a tela informa que o envio ainda não está disponível. Tokens expiram em 30 minutos, são de uso único, ficam armazenados apenas como hash e a troca de senha encerra as sessões existentes.

`TRUSTED_PROXIES` aceita uma lista de IPs exatos, separados por vírgula. Deixe vazia ao servir diretamente. O servidor só usa `X-Forwarded-For` quando a conexão vem de um proxy dessa lista e percorre a cadeia do proxy mais próximo até o primeiro endereço não confiável.

O QR Code já está incluído em `public/js/vendor/qrcode.js`. Após atualizar a biblioteca, execute `npm run build:qr` em `server/` para recriar esse arquivo. A validação de uploads verifica assinaturas, decodifica imagens de até 40 megapixels e inspeciona as faixas de áudio/vídeo com FFprobe.

Reembolsos e redefinições de senha usam um journal para concluir gravações relacionadas após uma interrupção. Não apague `server/data/transaction-journal.json` manualmente: ele é reaplicado antes de abrir o servidor e antes de novas gravações.

Rascunhos interrompidos podem ser retomados ao abrir o criador ou editar o pedido. O criador oferece retomar ou descartar a cópia local e preserva os arquivos do envio que falhou.

| Variável       | Descrição                                   | Padrão                  |
| -------------- | ------------------------------------------- | ----------------------- |
| `PORT`         | Porta do servidor                           | `3000`                  |
| `ADMIN_EMAIL`  | E-mail do administrador criado pelo `seed.js` | `admin@nossoamor.com` |
| `ADMIN_PASS`   | Senha do administrador criado pelo `seed.js`  | `admin123`            |

### Contrato da API

Toda resposta usa um envelope fixo:

```jsonc
// Sucesso
{ "ok": true, "data": { /* ... */ } }

// Erro
{ "ok": false, "error": { "code": "SOME_CODE", "message": "...", "meta": { /* opcional */ } } }
```

O frontend **sempre** lê `error.code` antes de decidir como reagir (nunca exibe mensagens genéricas). Respostas `429` disparam um **bloqueio de taxa persistente** por método+rota (`rate_lock:<METHOD>:<PATH>`) com contagem regressiva visível — o cliente não recarrega em loop.

A fonte de verdade completa do contrato está em [`server/docs/CONTRACT.md`](server/docs/CONTRACT.md); cenários de teste manuais estão em [`server/docs/TEST_SCENARIOS.md`](server/docs/TEST_SCENARIOS.md).

### Principais endpoints

| Método(s)                 | Rota                        | Finalidade                                     |
| ------------------------- | --------------------------- | ---------------------------------------------- |
| `GET`                     | `/api/config`               | Preço, temas e cupons (o frontend nunca os fixa em código) |
| `POST`                    | `/api/auth/login` / `register` / `logout` | Sessão em cookie `HttpOnly`         |
| `GET`                     | `/api/auth/me`              | Usuário autenticado atual                      |
| `GET`/`POST`              | `/api/purchases`            | Lista / cria presentes (metadados)             |
| `GET`                     | `/api/purchases/:id`        | Detalhe de um presente                         |
| `POST`                    | `/api/purchases/:id/pay`    | Pagamento simulado com cupom                   |
| `GET`                     | `/api/admin/summary`        | Métricas gerais do painel                      |
| `GET`                     | `/api/admin/clients`        | Lista de clientes                              |
| `GET`                     | `/api/admin/clients/:id`    | Detalhe do cliente (compras, tickets, reembolsos) |
| `GET`                     | `/api/admin/purchases`      | Todas as compras                               |
| `GET`                     | `/api/admin/refunds`        | Reembolsos pendentes                           |
| `POST`                    | `/api/admin/refunds/:id/decision` | Aprovar/recusar reembolso                |
| `GET`                     | `/api/admin/tickets`        | Tickets de suporte                             |
| `POST`                    | `/api/admin/tickets/:id/reply` | Responder ticket                            |

> **Importante:** preço, temas e cupons vêm **sempre** de `GET /api/config` (com cache local `nossoamor_config_cache` como fallback offline). O frontend expõe `window.NA_CONFIG_READY`, e cada página aguarda essa promise antes de renderizar.


---

### 🔍 Resumo da Arquitetura

1. **`js/api/client.js`**: Cliente HTTP central — monta requisições, valida o envelope `{ok, data|error}`, lança `ApiError` com o `code` original, aplica o bloqueio de taxa `429` e mantém o cache de usuário para renderização.
2. **`js/core/config.js` + `app.js`**: Carregam preço, temas e cupons de `GET /api/config` em `CONFIG`/`THEMES` e expõem `window.NA_CONFIG_READY`; nada de valores fixos no código.
3. **`js/core/auth.js`**: Shim de compatibilidade — login/logout agora delegam para `ApiAuth` e `GET /api/auth/me`.
4. **`js/pages/minha-conta.js`**: A exclusão é confirmada pela API e bloqueia o link público. O histórico mantém os comprovantes de presentes pagos excluídos.
5. **`js/pages/criar.js`, `ver.js` e `js/core/gift-sync.js`**: Salvar cria um rascunho idempotente, envia as mídias e confirma o conteúdo. Editar mantém o ID. O visualizador consulta o servidor, sem liberar presentes por cache local.
6. **`js/admin/*`**: Dashboard, clientes, reembolsos e suporte consomem apenas `/api/admin/*`; a nova aba **Clientes** mostra compras, tickets e reembolsos por usuário.

**Observação final:** este `README.md` é a documentação oficial do projeto, útil para o GitHub ou para apresentação a um cliente.

## 📂 Estrutura de Pastas

```text
/
├── public/                 # Todos os arquivos do site (raiz pública HTTP)
│   ├── *.html              # home, criar, ver, pagamento, conta e páginas legais
│   ├── app.js              # Configuração e helpers compartilhados
│   ├── favicon.svg
│   ├── admin/              # Páginas administrativas
│   ├── css/                # Estilos das páginas
│   ├── js/                 # api/, core/, pages/ e admin/
│   └── teste/              # Modelos recebidos para integração
│       ├── namoro.html
│       ├── namoro.css
│       ├── namoro.js
│       └── casamento.*, amizade.*, familia.*, aniversario.*, carta-antiga.*, jardim.*, scrapbook.*
│           netflix.*, vinil.*, cinema.*, spotify.*, retro.*
├── server/                 # Backend Node.js e API (fora da raiz pública)
│   ├── index.js
│   ├── config.js           # FRONTEND_ROOT aponta para ../public
│   ├── seed.js
│   ├── routes/
│   ├── lib/
│   ├── data/               # Banco JSON local, ignorado no Git
│   └── docs/               # Contrato da API e cenários de teste
├── tools/                  # Verificações de integração
└── README.md
```

Os textos e metadados básicos vêm da API; fotos, vídeos, música e os campos ricos continuam no IndexedDB do navegador, conforme o contrato atual. Compartilhar mídias com outros dispositivos exige uma futura implementação de upload no servidor.

## Salvamento e compartilhamento — primeira revisão

- `POST /api/purchases`: criação idempotente por `client_request_id` e usuário.
- `POST /api/purchases/:id/media/:asset`: upload binário autenticado, com ID estável.
- `POST /api/purchases/:id/update`: confirma conteúdo e mídia de um rascunho; pagamento exige conteúdo completo.
- `POST /api/purchases/:id/delete`: exclusão sincronizada; comprovante preservado.
- `GET /api/shared/:token` e `GET /api/shared/:token/media/:asset`: somente presentes pagos, completos e ativos. Mídia suporta Range e usa Cache-Control: no-store.
- Link de entrega: `/ver.html?token=…`. A rota por ID continua privada para o dono. Quem possui o token pode visualizar o presente.

Limites: 12 fotos (15 MB cada), 4 vídeos (100 MB cada), uma música (25 MB), total de 300 MB por presente. Formatos: JPG, PNG, WebP, GIF, AVIF; MP4, WebM, MOV; MP3, WAV, OGG, M4A.

Presentes antigos: abra o rascunho e salve novamente; para um presente já pago, abra Resultado no navegador que guarda os arquivos antigos para sincronizar uma única vez. Sem a mídia original, não é possível recriar os arquivos.

O banco JSON é para uma instância do servidor. Cada gravação preserva a versão anterior em .bak; faça backup da pasta de dados, incluindo media/. A variável NA_DATA_DIR permite usar um banco separado nos testes. O checkout continua simulado.

Verificações: `node tools/verify-theme.cjs` e `node tools/test-first-review.cjs`. As duas usam banco temporário nas verificações HTTP.

## Segunda revisão

As correções F15–F24 e seus testes estão em [REVISAO-2-RESULTADO.md](REVISAO-2-RESULTADO.md). O formulário tem navegação de etapas adaptada ao celular, prévia que cabe em telas baixas e seleção inicial pelo parâmetro tema. A conta diferencia rascunhos, pagos e reembolsados e renderiza conteúdo do usuário como texto.

Newsletter: o formulário demonstrativo foi retirado e substituído por acesso ao catálogo. A home informa o cadastro necessário para salvar, o limite de 12 fotos e o checkout em demonstração; não anuncia desconto sem aplicação real. Os valores exibidos vêm da configuração.

Os limites de arquivos estáticos e leituras de mídia são separados da API, mantendo a proteção do login. Para validar: `node tools/verify-theme.cjs`, `node tools/test-first-review.cjs` e `node tools/test-second-review.cjs`. Todos os testes HTTP usam diretórios de dados temporários. Testes em aparelhos físicos continuam necessários para validar recursos específicos do Android/iOS.
