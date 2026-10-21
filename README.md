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

O servidor fica em `server/` e serve simultaneamente a **API REST** (`/api/*`) e os **arquivos estáticos** do frontend na raiz do repositório.

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
├── index.html               # Redireciona para home.html
├── home.html                # Landing page (venda e apresentação)
├── criar.html               # Fluxo de criação do presente
├── pagamento.html           # Checkout
├── resultado.html           # Tela de sucesso com QR Code e Link
├── ver.html                 # O presente em si (visualização pública)
├── login.html               # Tela de Login/Cadastro
├── minha-conta.html         # Dashboard do usuário e histórico
├── termos.html              # Termos de Uso
├── privacidade.html         # Política de Privacidade
├── reembolso.html           # Política de Reembolso
│
├── admin/                   # Painel administrativo
│   ├── login.html
│   ├── dashboard.html
│   ├── clientes.html        # NOVO: gestão de clientes
│   ├── reembolsos.html
│   └── suporte.html
│
├── server/                  # Backend Node.js (API + arquivos estáticos)
│   ├── index.js             # Servidor HTTP
│   ├── seed.js              # Popula server/data
│   ├── routes/              # auth, config, purchases, admin (roteador em index.js)
│   ├── lib/                 # Utilitários (store, sessão, respostas)
│   ├── data/                # Banco local em JSON (ignorado no git)
│   └── docs/
│       ├── CONTRACT.md      # Contrato oficial da API
│       └── TEST_SCENARIOS.md
│
├── css/
│   ├── base.css             # Reset e estilos globais (variáveis)
│   ├── home.css
│   ├── criar.css
│   ├── pagamento.css
│   ├── resultado.css
│   ├── ver.css              # Estilos dos temas e layouts do presente
│   ├── login.css
│   ├── minha-conta.css
│   ├── legal.css            # Estilos compartilhados das páginas legais
│   └── tema-padrao.css      # Layout base dos presentes clássicos
│
├── js/
│   ├── api/                 # Camada de acesso à API
│   │   ├── client.js        # Cliente HTTP (envelope, ApiError, 429)
│   │   ├── auth.js          # login/registro/logout/me
│   │   ├── purchases.js     # CRUD + pagamento
│   │   └── admin.js         # Endpoints do painel
│   │
│   ├── core/
│   │   ├── config.js        # CONFIG/THEMES a partir de /api/config
│   │   ├── auth.js          # Shim de compatibilidade
│   │   ├── db.js            # Abstração do IndexedDB (mídia)
│   │   └── navbar.js        # Componente da Navbar (Hambúrguer + Auth)
│   │
│   ├── pages/
│   │   ├── home.js
│   │   ├── criar.js
│   │   ├── pagamento.js
│   │   ├── resultado.js
│   │   ├── ver.js           # Lógica de renderização do presente
│   │   ├── login.js
│   │   └── minha-conta.js
│   │
│   └── admin/               # JS do painel (dashboard, clientes, reembolsos, suporte)
│
├── app.js                   # CONFIG/THEMES via API, utilitários de data e IndexedDB
└── favicon.svg