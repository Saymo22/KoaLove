# 💖 Nosso Amor — Presentes Digitais

Uma plataforma web completa para criar, personalizar e compartilhar presentes digitais inesquecíveis. O usuário pode montar uma página com fotos, vídeos, música e uma carta de amor, escolher entre diversos temas (Netflix, Spotify, Vinil, Clássicos) e enviar o link ou QR Code para alguém especial.

## 🚀 Funcionalidades

- **Criação Passo a Passo:** Wizard interativo com validação de dados, upload de mídia e prévia em tempo real no celular.
- **Temas Exclusivos:** Layouts customizados que alteram completamente o CSS e a experiência do presente (Netflix, Spotify, Vinil, Cinema, Jardim Secreto, etc.).
- **Checkout Simulado:** Tela de pagamento com aplicação de cupons de desconto, cálculo de total e geração de recibo.
- **Comprovante de Pagamento:** Histórico financeiro em formato de timeline para o usuário, com geração de recibo pronto para impressão/PDF.
- **Autenticação por Sessão:** Login e cadastro via API REST, com sessão em cookie `HttpOnly` (o frontend nunca lê `document.cookie`, sempre confirma a sessão em `GET /api/auth/me`).
- **Painel Administrativo:** Dashboard com visão geral, gestão de clientes, reembolsos e suporte, consumindo os endpoints `/api/admin/*`.
- **Persistência Híbrida:** O backend (Node.js) guarda os **metadados** dos presentes, usuários, pagamentos e tickets; o **conteúdo pesado** de mídia (fotos, vídeos, música) permanece no `IndexedDB` do navegador, referenciado por `mediaId`.
- **Página de Visualização (Gift):** Experiência imersiva (sem navbar) com animações, player de música, lightbox para fotos e contador de tempo juntos.
- **Menu Hambúrguer:** Navegação responsiva e elegante para dispositivos móveis.
- **Páginas Legais:** Termos de Uso, Política de Privacidade e Reembolso com design premium e menu lateral fixo.

## 🛠️ Tecnologias Utilizadas

O projeto foi construído do zero, sem frameworks, focando em performance e design:
- **HTML5** (Semântico e acessível)
- **CSS3** (Variáveis, Flexbox, CSS Grid, animações complexas)
- **JavaScript (Vanilla)** (ES6+, módulos e manipulação de DOM)
- **Node.js** (Servidor HTTP + API REST, sem dependências externas de runtime)
- **IndexedDB** (Armazenamento local de fotos/vídeos/música)
- **QRCode.js** (Geração do QR Code na tela de resultado)

## 🖥️ Backend e API

O servidor fica em `server/` e serve simultaneamente a **API REST** (`/api/*`) e os **arquivos estáticos** de `public/`. Os endereços continuam iguais: `/criar.html`, `/ver.html`, `/admin/login.html` etc.

Os 13 modelos completos ficam em `public/teste/`: Namoro, Casamento, Amizade, Família, Aniversário, Carta Antiga, Jardim Secreto, Scrapbook e os exclusivos Netflix, Vinil, Cinema, Spotify e Retrô. Cada um possui seu próprio HTML, CSS e JavaScript, sem misturar os estilos entre temas. Para abrir um exemplo, use `/ver.html?demo=1&tema=netflix` (substitua pelo identificador do tema).

Em `criar.html`, a prévia usa exatamente o mesmo modelo de `ver.html`. O passo **Momentos → Detalhes do tema** oferece controles para textos e funções específicas: quiz, memórias, membros da família, cartas do cofre, desejos da fonte, constelação e itens já realizados. Os exclusivos acrescentam catálogo e episódios, notificações, álbuns, faixas dos lados A/B, cartazes e avaliação por pipocas, playlists, letras, fitas VHS e fliperama. As personalizações são separadas por tema e gravadas em `themeData` na API e no IndexedDB.

Os players exclusivos usam o áudio e os vídeos do formulário, com progresso e controles ligados à mídia real. Faixas também aceitam um endereço de áudio próprio nos detalhes; sem ele, usam a música principal. Fotos viram capas, cartazes e clipes. O Netflix pula a seleção de perfil na prévia e oferece os perfis na visualização com introdução ativada. O servidor serve arquivos públicos de áudio e vídeo com seus tipos MIME correspondentes; o envio pelo formulário continua armazenado no IndexedDB.

Aniversário usa **Data de nascimento** para calcular a idade e permite apagar velas por toque ou, após permissão do navegador, pelo microfone. A permissão de microfone fica restrita à mesma origem nas páginas que incorporam esse tema.

Para verificar a integração, execute `node tools/verify-theme.cjs`. A verificação cobre a troca de modelos, referências locais, rotas HTTP, validação e gravação/leitura dos detalhes sem modificar o banco do usuário.

### Como rodar

```bash
cd server
node seed.js      # cria/popula o banco local em server/data (apenas na primeira vez)
node index.js     # inicia o servidor em http://127.0.0.1:3000
```

### Variáveis de ambiente

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
4. **`js/pages/minha-conta.js`**: O *soft delete* isola os cards deletados via conjunto local (`nossoamor_deleted_ids`); a timeline continua exibindo todos os pagos.
5. **`js/pages/criar.js` e `ver.js`**: Criam/leem os metadados via `POST/GET /api/purchases` e vinculam as mídias (Blob URLs/IndexedDB) por `mediaId`.
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
