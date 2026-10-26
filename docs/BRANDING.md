# Identidade KoaLove

A identidade pública é **KoaLove**. Os dez SVGs fornecidos ficam em `public/branding/`, preservados como arquivos vetoriais independentes. O logo principal é `koalove-logo-principal.svg`; `koalove-simbolo-principal.svg` é o favicon, o ícone de abertura do chat e seu avatar. `public/favicon.svg` conserva o caminho antigo com o novo símbolo.

O logo está na navegação, nos rodapés e no painel administrativo. Em superfícies escuras, uma pequena base clara preserva a leitura das cores originais do logo principal. `resources/css/brand.css` dimensiona o logo em desktop e celular e remove os antigos corações decorativos da marca. O CSS externo é carregado pelo Vite no partial SEO comum às páginas. O chat continua isolado em Shadow DOM e usa seu próprio CSS externo.

Títulos, metadados, políticas, mensagens de suporte, título de novos checkouts e identificação de e-mail adotam KoaLove. Conteúdo de presentes dos clientes, nomes de planos cadastrados, pagamentos já criados e mensagens históricas não são reescritos. As formas genéricas “nosso amor” nos textos românticos dos temas continuam sendo conteúdo, e não a identidade comercial.

## Compatibilidade operacional

- Supabase: nome do projeto e da organização KoaLove. O project ref, host, esquema `app_private`, bucket `gift-media` e credenciais permanecem os mesmos. Nenhuma migração de dados é necessária.
- Vercel: projeto `koalove`, mantendo o ID do projeto e o endereço existente `projetona.vercel.app`, usado pelos links e pelas integrações já configuradas. A mudança de marca não altera APP_URL, webhooks, CORS ou chaves.
- GitHub: repositório `Saymo22/KoaLove`, com o mesmo histórico, branches e pull requests; origem Git local atualizada após autorização explícita do mantenedor.
- Pacotes: `koalove` no npm e `saymo22/koalove` no Composer. Dependências e versões são preservadas.
- Não renomear automaticamente bancos, roles, cookies, namespaces de cache, IndexedDB, referências `@media` ou chaves de rascunhos. São identificadores técnicos usados por instalações e navegadores existentes. O nome padrão da aplicação passa a KoaLove; os defaults de sessão/cache continuam independentes desse nome visual. Não sobrescrever `.env` ou variáveis secretas para aplicar a identidade.

Antes de mudar o domínio principal futuramente, revisar APP_URL, URLs de retorno/webhook do Mercado Pago, CORS do storage, canonicals e o efeito da mudança de origem sobre cookies e rascunhos locais. A alteração do nome exibido não exige mudar esses endereços.
