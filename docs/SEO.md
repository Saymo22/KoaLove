# SEO, indexação e JavaScript

As 30 páginas do catálogo incluem `partials/seo.blade.php` e `partials/noscript.blade.php`. O primeiro centraliza título, descrição, autor, robots, canonical e metadados Open Graph/Twitter. O segundo avisa quando JavaScript está desativado e oferece links para os documentos legais. Seu CSS é independente: não modifica o layout normal das páginas.

O formulário, o acesso à conta e a exibição interativa dos presentes ainda precisam de JavaScript. O aviso não promete que esses recursos funcionem sem ele.

## Páginas e regras

| Grupo | Robots | Sitemap |
| --- | --- | --- |
| Home, criador, termos, privacidade, reembolso e 13 demonstrações sem parâmetros | `index, follow, max-image-preview:large` | Sim, 18 URLs |
| Login e recuperação de senha sem parâmetros | `noindex, follow` | Não |
| Conta, admin, pagamento, resultado, presentes compartilhados, API, reset e páginas com parâmetros | `noindex, nofollow` | Não |
| Respostas de erro e redirecionamentos | `noindex, nofollow` no header | Não |
| Ambiente local ou prévia Vercel | `noindex, nofollow`; robots bloqueia tudo | Vazio |

`X-Robots-Tag` acompanha a política da página. A classificação é feita no servidor; não depende de executar JavaScript. Demonstrações em `/temas/` são públicas, mas a variante com parâmetros, inclusive embed/compartilhamento, não é indexável. Nomes e mensagens pessoais não são usados nos metadados do servidor.

## Configuração

- `config/seo.php`: títulos/descrições específicos, páginas utilitárias e caminhos restritos. Os 13 temas são obtidos do catálogo; para sobrescrever os metadados de um tema, adicione sua URL em `pages`. Páginas usam caminhos sem extensão. Os caminhos `.html` já publicados ficam em `resources/assets.json` como `legacy_urls` e respondem 301 para a página equivalente, sem entrar no sitemap. `/index.html` e `/home.html` apontam para `/`. Não há fallback para URLs desconhecidas.
- `APP_URL`: origem canônica e dos links do sitemap. Em produção, use o domínio público definitivo (`https://www.koalove.site`); aliases `*.vercel.app` são apenas endereços alternativos. O header Host do visitante não altera esses links. Ao trocar o domínio, reimplante e confira canonical/sitemap no endereço novo; os bundles do Vite já são relativos à origem e continuam válidos em qualquer alias.
- `SEO_INDEXING_ENABLED`: padrão ligado em `APP_ENV=production`; use `false` para desativar. Prévias com `VERCEL_ENV=preview` continuam bloqueadas mesmo que a variável seja `true`.
- `SEO_ALLOW_GPTBOT_TRAINING=false`: mantém GPTBot bloqueado por padrão. Use `true` somente se desejar permitir também seu uso de treinamento nas páginas públicas. Essa opção é independente de pesquisa.

URLs com parâmetros não entram no sitemap. O canonical público aponta para a URL limpa. Áreas reservadas não recebem canonical e não expõem links com tokens nos metadados. Não geramos `lastmod` artificial: só acrescente datas quando existir uma fonte confiável de alteração real do conteúdo.

## robots.txt, IA e sitemap

`GET /robots.txt` é gerado pelo Laravel. Os grupos geral e OAI-SearchBot permitem as páginas públicas e excluem conta, API, admin, pagamento, compartilhamentos e URLs com parâmetros. GPTBot tem um grupo separado e respeita a opção de treinamento. Os grupos específicos repetem as restrições para não liberar acidentalmente uma área bloqueada no grupo geral. Outros agentes seguem as regras gerais.

`GET /sitemap.xml` retorna XML válido com as 18 URLs públicas canônicas. Não consulta compras nem lista presentes de usuários. O mesmo catálogo alimenta o sitemap e a decisão de indexação, evitando discrepâncias. Ao cadastrar uma página nova, inclua o SEO correspondente e atualize os testes da quantidade esperada.

Após publicar, confira essas duas URLs no domínio real e envie o sitemap ao Google Search Console/Bing Webmaster Tools usando sua conta de proprietário. A configuração autoriza descoberta; não garante indexação, posição nos resultados ou citação por uma IA. `robots.txt` não é controle de acesso: proteção de dados continua nas sessões/policies e na privacidade do armazenamento. Uma URL bloqueada no robots ainda pode aparecer sem conteúdo se for descoberta por outro site; `noindex` precisa ser lido pelo crawler para ter efeito.

## Validação

- `php vendor/bin/phpunit --filter SeoTest`: verifica as 30 páginas, descrições/robots sem duplicação, noscript, restrições por parâmetros, host não confiável, XML, rotas públicas, redirects legados com query/origem preservadas e 404 para caminhos desconhecidos.
- `npm test` e `npm run build`: verificam o catálogo e o CSS separado de acessibilidade.
- No navegador, teste home/login/tema com JavaScript ligado e desligado. O aviso precisa ficar visível acima dos loaders dos temas, sem aparecer na navegação normal.
- Na Vercel, confira produção e prévia: somente o ambiente de produção deve permitir indexação.

## Referências

- [Google: meta robots e X-Robots-Tag](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag)
- [Google: bloqueio de indexação](https://developers.google.com/search/docs/crawling-indexing/block-indexing)
- [Google: migração de URLs e redirecionamentos](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes)
- [OpenAI: diferença entre OAI-SearchBot e GPTBot](https://developers.openai.com/api/docs/bots)
