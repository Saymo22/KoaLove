# 💖 Nosso Amor — Presentes Digitais

Uma plataforma web completa para criar, personalizar e compartilhar presentes digitais inesquecíveis. O usuário pode montar uma página com fotos, vídeos, música e uma carta de amor, escolher entre diversos temas (Netflix, Spotify, Vinil, Clássicos) e enviar o link ou QR Code para alguém especial.

## 🚀 Funcionalidades

- **Criação Passo a Passo:** Wizard interativo com validação de dados, upload de mídia e prévia em tempo real no celular.
- **Temas Exclusivos:** Layouts customizados que alteram completamente o CSS e a experiência do presente (Netflix, Spotify, Vinil, Cinema, Jardim Secreto, etc.).
- **Checkout Simulado:** Tela de pagamento com aplicação de cupons de desconto, cálculo de total e geração de recibo.
- **Comprovante de Pagamento:** Histórico financeiro em formato de timeline para o usuário, com geração de recibo pronto para impressão/PDF.
- **Autenticação Local:** Sistema de login e criação de conta via `localStorage`.
- **Persistência de Dados:** Uso avançado de `IndexedDB` para salvar os presentes e mídias localmente (sem necessidade de backend).
- **Página de Visualização (Gift):** Experiência imersiva (sem navbar) com animações, player de música, lightbox para fotos e contador de tempo juntos.
- **Menu Hambúrguer:** Navegação responsiva e elegante para dispositivos móveis.
- **Páginas Legais:** Termos de Uso, Política de Privacidade e Reembolso com design premium e menu lateral fixo.

## 🛠️ Tecnologias Utilizadas

O projeto foi construído do zero, sem frameworks, focando em performance e design:
- **HTML5** (Semântico e acessível)
- **CSS3** (Variáveis, Flexbox, CSS Grid, animações complexas)
- **JavaScript (Vanilla)** (ES6+, módulos e manipulação de DOM)
- **IndexedDB** (Armazenamento local de fotos/vídeos)
- **LocalStorage** (Sessão de usuário)
- **QRCode.js** (Geração do QR Code na tela de resultado)


---

### 🔍 Resumo da Verificação de Código

1. **`navbar.js`**: Está perfeito. O menu hambúrguer foi implementado com escuta de cliques fora do menu e o estado logado/deslogado é atualizado em tempo real.
2. **`minha-conta.js`**: A lógica de `soft delete` está isolando os cards deletados (`p.deletado = true`) e a timeline renderiza todos os pagos, independentemente de terem sido apagados.
3. **`legal.css` e Páginas Legais**: A navbar tem o respiro correto (`padding-top: 160px`), a estrutura de 2 colunas (menu lateral + conteúdo) está alinhada, e o rodapé foi replicado fielmente à Home.
4. **`criar.js` e `ver.js`**: A comunicação entre os temas (ex: Netflix, Spotify) e as imagens carregadas (via Blob URLs) está funcionando corretamente.
5. **`auth.js`**: O login cria uma sessão no `localStorage` e protege as rotas (como `minha-conta.html`).

**Observação final:** O arquivo `README.md` gerado acima serve como a documentação oficial do seu projeto. Ele é super útil caso você vá subir isso para o GitHub ou apresentar para um cliente.

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
│   ├── core/
│   │   ├── auth.js          # Lógica de login e sessão
│   │   ├── db.js            # Abstração do IndexedDB
│   │   └── navbar.js        # Componente da Navbar (Hambúrguer + Auth)
│   │
│   └── pages/
│       ├── home.js
│       ├── criar.js
│       ├── pagamento.js
│       ├── resultado.js
│       ├── ver.js           # Lógica de renderização do presente
│       ├── login.js
│       └── minha-conta.js
│
├── app.js                   # Configurações globais, temas e utilitários
└── favicon.svg