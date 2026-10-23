# Segunda revisão — correções concluídas

Data: 23/10/2026, horário de São Paulo.

Os dez achados adicionais da segunda revisão (F15–F24) foram corrigidos. A regressão da primeira revisão também passou. As verificações HTTP e de interface usaram bancos temporários com dados fictícios; a base principal de compras permaneceu intacta.

## O que foi corrigido

| Achado | Resultado |
|---|---|
| F15 — Etapas sobrepostas no celular | Navegação com quatro colunas e duas linhas em telas estreitas, rótulos com quebra e alvos de toque separados. O progresso mostra também o nome da etapa atual. |
| F16 — Scrapbook fora da tela | Grade com trilhas que podem encolher, duas colunas no tablet e uma no celular. O recuo acomoda as fotos giradas. A animação deixa de girar a grade inteira, preservando a rotação dos recortes individuais. O gerador de temas recebeu o mesmo ajuste. |
| F17 — Prévia cortada em paisagem | A moldura usa a altura disponível sem mínimo que empurre os controles para fora. Cabe em 844 × 390 e 390 × 844, em modo normal e ampliado. Escape fecha e devolve o foco ao botão de abertura. O overlay continua fixo ao mudar a largura da tela. |
| F18 — Descrições undefined | Os 13 cards usam descrição disponível na configuração, com fallback válido e preenchimento por textContent. |
| F19 — Tema da home ignorado | O criador aplica ?tema=spotify depois de carregar os temas. Valores desconhecidos são ignorados. Editar ou recuperar um pedido mantém o tema salvo, com prioridade sobre a indicação da URL. |
| F20 — HTML inserido na conta | Cards, títulos, destinatários, links e histórico são criados por nós DOM. Conteúdo do usuário entra como texto; URLs são atribuídas pelas propriedades dos elementos. Mensagens de erro/toasts também usam texto. URLs temporárias de capa são liberadas ao remontar a lista. |
| F21 — Newsletter com sucesso fictício | A inscrição sem persistência foi retirada. A seção agora direciona para explorar os temas; não coleta e-mail nem afirma que uma inscrição foi concluída. Não foi implementado envio de newsletter. |
| F22 — Regras e oferta contraditórias | Home e termos explicam a necessidade de login para salvar e gerenciar. O limite anunciado passou a ser até 12 fotos. A oferta de 10% e o contador artificial foram retirados; o preço exibido vem da configuração. Cupons reais continuam disponíveis no checkout. O modo de demonstração é informado na home. |
| F23 — Arquivos consumindo o limite da API | Arquivos públicos, leitura de mídia e API têm orçamentos separados: 1.200 arquivos/minuto, 600 leituras de mídia/minuto e limites específicos da API. Login continua limitado a cinco tentativas por minuto. |
| F24 — Reembolso tratado como rascunho | Estados pending, paid e refunded são tratados separadamente. Há contador e filtro de reembolsados. Só pending oferece edição; refunded não libera visualização/compartilhamento. O histórico e o comprovante mostram o reembolso e mantêm registros removidos da coleção, inclusive registros antigos sem paid_at. |

O resumo do checkout também passou a ler fotos, vídeos e música da cópia do servidor e o preço registrado no pedido, mantendo a coerência ao abrir em outro navegador.

## Testes que passaram

- `node tools/verify-theme.cjs`: 13 temas, prévia dinâmica, validação de detalhes, sintaxe JavaScript, 251 referências locais, 59 rotas e quatro caminhos privados bloqueados. Inclui os testes anteriores de recuperação de rascunho, edição e cache opcional.
- `node tools/test-first-review.cjs`: regressão de persistência, upload, permissões, idempotência, conteúdo completo, link público, Range, reembolso, exclusão e migração de presentes antigos, com banco temporário.
- `node tools/test-second-review.cjs`: 160 requisições de arquivos sem esgotar a API; login continua retornando 429 na sexta tentativa; reembolsos removidos continuam no histórico; conteúdo da home coerente; arquivo principal de compras conferido antes e depois.
- Sintaxe dos scripts adicionais de QA, importador de temas e checkout conferida.
- Verificação de whitespace nos arquivos de implementação alterados nesta etapa passou.

## Verificação no navegador

| Cenário | Resultado |
|---|---|
| Etapas em 320, 360, 390 e 430 px | Rótulos contidos nos botões e sem excesso horizontal no documento. |
| Spotify indicado na URL | Seleção confirmada após carregar a configuração nas larguras pequenas. |
| Tema inexistente | Nenhum tema inválido selecionado; os 13 cards continuam disponíveis. |
| Editar pedido Namoro com ?tema=spotify | Preservou Namoro e o título do pedido. |
| Scrapbook em 360, 390 e 430 px | Fotos dentro da tela e scrollWidth igual à largura útil: 350, 381 e 421 px, respectivamente. |
| Prévia em 390 × 844 | Modo normal e ampliado dentro do viewport, com fechamento acessível. |
| Prévia em 844 × 390 | Moldura de 360 px de largura, topo em aproximadamente 97 px e botão Fechar terminando em 378 px, dentro dos 390 px de altura. |
| Home em 360, 390 e 430 px | 13 descrições preenchidas, preço vindo da API, sem newsletter fictícia e sem excesso horizontal. |
| Minha conta em 390 px | Três cards ativos: um rascunho, um pago e um reembolsado; quatro registros no histórico incluindo dois removidos. Apenas um link de edição. |
| Conteúdo com marcação HTML | Título com <b> e destinatário com <img onerror> exibidos literalmente. Zero elementos injetados nos títulos, destinatários e histórico. |
| Filtro e comprovante de reembolso | Filtro exibiu somente a compra reembolsada; comprovante identificou o pagamento como reembolsado. |
| Fechamento da prévia | Escape fechou os dois modos e devolveu o foco ao botão previewBtn. |

O navegador apresentou um timeout durante uma troca de orientação. Após conferir o estado carregado, o caso foi retomado e passou. Capturas e medições foram registradas na pasta de artefatos da conversa. Servidor temporário encerrado e arquivos públicos do harness removidos.

## Limites da validação

As medidas foram obtidas em quadros de navegador com as dimensões indicadas. Não equivalem a testes físicos em Android/Chrome ou iPhone/Safari. Ainda precisam de validação nesses aparelhos: teclado virtual, toque/gestos, microfone, codecs de mídia, reprodução em segundo plano, download e leitura do QR. Não foi feita publicação, cobrança real ou commit.

## Evidências

Etapas corrigidas em 390 px:

![Formulário corrigido](C:/Users/Saymo/.codex/visualizations/2026/10/22/01a164ef-e859-7523-8ed5-ad2e008f3b76/segunda-revisao-corrigida-formulario-390.jpg)

Prévia em paisagem, com abertura e fechamento visíveis:

![Prévia em paisagem](C:/Users/Saymo/.codex/visualizations/2026/10/22/01a164ef-e859-7523-8ed5-ad2e008f3b76/segunda-revisao-corrigida-previa-paisagem.jpg)
