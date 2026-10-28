# Dashboard administrativo completo

A página `/admin/painel` usa o HTML e o sistema visual do modelo fornecido, com CSS e JavaScript externos. A logo é KoaLove e o símbolo sobre rosé acompanha o nome e a função da sessão real. Nenhum banco de demonstração, senha padrão ou dado de cliente é criado pelo frontend.

## Mapa das funções

| Seção / ação do modelo | Ligação real |
| --- | --- |
| Indicadores de 30 dias, comparação, ticket médio e movimentações | `/api/admin/workspace`, compras pagas, recibos e reembolsos confirmados. CSV com proteção contra fórmulas. Datas ausentes permanecem identificadas como desconhecidas. |
| Conferir, recusar e conferir todos os Pix | `/api/admin/purchases/{id}/confirm-pix` e `/reject-pix`. A conferência em lote solicita uma referência bancária única para cada crédito, exige confirmação e informa sucessos parciais. Nenhum pagamento é aprovado automaticamente. |
| Ver comprovante | O checkout atual não recebe arquivos de comprovante. A ação abre os dados reais do pedido, referência Pix e identificador já conferido, explicando a necessidade de conferir o banco. |
| Clientes: busca, segmentos, ordenação, paginação, CSV e histórico | Base autenticada do workspace e `/api/admin/clients/{id}`. Não há dados fictícios quando a base está vazia. |
| Observações e excluir cliente | `/api/admin/clients/{id}/note` e `/delete`. Exclusão desativa acesso, revoga links/sessões e segue a purga existente em 30 dias; não executa estorno. |
| Planos: criar, editar, destacar, ativar, duplicar e excluir | API de catálogo existente, mais `/api/admin/catalog/plans/{uuid}/delete`. Duplicação cria plano inativo. Há até três planos ativos e pelo menos um. Exclusões são lógicas, mantendo históricos e snapshots. |
| Promoções e temporizador | CRUD de promoções, desconto percentual ou em centavos, início/fim, ativação e exclusão lógica. A cotação pública e o checkout usam o mesmo cálculo do servidor. |
| Cupons: gerar, copiar, criar, editar, ativar e excluir | CRUD de cupons; desconto percentual ou fixo; validade e limite de usos. O servidor reserva usos ao iniciar checkout e trava o cupom para impedir ultrapassar a cota em concorrência. Checkout já iniciado mantém suas condições. |
| Reembolsos: filtros, CSV e decisão | API existente de decisão. Para Mercado Pago, o estorno precisa ser confirmado pelo webhook; para Pix manual, o operador confirma a devolução já feita no banco. Garantia comercial continua em 72h sem abertura pública, com análise legal independente. |
| Atendimento: filtros, chat, prioridade e status | Respostas na API existente e `/api/admin/tickets/{id}/manage`; polling privado de 15s enquanto há atividade no painel. O cliente recebe as respostas no chat existente. |
| Temas: ativar/desativar | `/api/admin/themes/{key}` e catálogo público filtrado. Pelo menos um tema permanece ativo. Desativação impede novas criações, mantendo demonstrações, metadados e presentes existentes. |
| Atividades: filtros, CSV e limpar | `admin_activities`, com autor, categoria, ação, referência e data. Limpar oculta o registro do painel; não apaga a auditoria técnica `audit_events`. Ambos têm retenção de 30 dias. |
| Busca global e Ctrl+K | Busca sobre os registros reais carregados; abre o histórico, formulário ou chat correspondente. |
| Notificações e marcar lidas | Pendências atuais de Pix, reembolsos, tickets e cupons esgotados. Preferências e leitura ficam vinculadas ao administrador. |
| Modo claro/escuro/automático | Preferência persistida por conta, sem gravar bases de clientes no navegador. |
| Loja, contatos e chave Pix | Configuração privada no servidor. Nome/contatos públicos são refletidos no rodapé da home. Chave só altera novos checkouts do adapter Pix manual; não substitui a integração Mercado Pago nem modifica cobranças existentes. |
| Prazo de alerta | Alerta operacional para análise pendente. Não altera a garantia comercial de 72 horas nem direitos legais. |
| Manutenção | Bloqueia APIs de clientes, incluindo criação, mídia e compartilhamento, com aviso público. Autenticação, admin, cron e webhook continuam disponíveis para recuperação/operação. |
| Inatividade | Prazo de 1–120 minutos por conta, validado também no servidor. Polling para quando a tela fica ociosa. |
| Administradores | Convite enviado por e-mail, válido por 48h, com aceite autenticado da mesma conta. Super Admin configura sistema e acessos; Gerente gerencia catálogo/operação; Suporte atende e consulta clientes. Remover acesso revoga sessões e preserva ao menos um Super Admin. |
| Alertas por e-mail | `admin:alerts`, no máximo um resumo diário sem dados pessoais. Executado pelo scheduler e pelo cron interno já usado na Vercel. |

## Operação e infraestrutura

A migration `2026_10_26_012501_complete_administrative_dashboard.php` é aditiva. Acrescenta configurações privadas, atividades, convites, notas/preferências/função administrativa, prioridade dos tickets, exclusões lógicas no catálogo, descontos fixos, limite de cupons e motivo de recusa Pix. Não altera senhas, usuários existentes, conteúdos ou valores de pedidos passados.

No Supabase, as novas tabelas permanecem em `app_private`, com RLS e privilégios de `anon`/`authenticated` revogados. A autenticação continua Laravel. Administradores existentes sem `admin_level` mantêm o acesso integral que já tinham; novos convites recebem a função explicitamente escolhida.

Convites e alertas dependem de SMTP real configurado. O painel retorna erro se o envio não estiver disponível e não anuncia convites ou e-mails fictícios como enviados. Configure `MAIL_*` no servidor; não coloque credenciais nos formulários do painel. `admin:alerts` usa o e-mail de suporte cadastrado; o cron precisa continuar ativo.

O CSV de atividades exporta os até 500 registros mais recentes carregados pelo painel; a listagem mostra até 100 por filtro. Não há histórico inventado anterior à implantação deste módulo. Os rótulos e controles originais foram preservados, com ajustes explícitos para as operações financeiras reais e as regras já adotadas pelo site.
