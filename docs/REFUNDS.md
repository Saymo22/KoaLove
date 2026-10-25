# Garantia comercial e análise de direitos legais

A garantia comercial tem prazo de **72 horas** desde `paid_at` e exige ausência de acesso ao conteúdo pelo link compartilhado. Ao atingir o prazo ou registrar o primeiro acesso, o servidor recusa novas solicitações comerciais com 409. O cliente usa a elegibilidade calculada pelo servidor e atualiza o botão no vencimento, mas a validação decisiva ocorre dentro da transação no backend.

Essa é uma regra comercial, não uma redução de direitos legais. O cliente pode enviar `request_kind=legal_review`, inclusive após o prazo ou a abertura. O pedido fica pendente para análise humana na mesma fila do admin, identificado como **Análise de direitos legais**. Nada efetua estorno automaticamente. A política pública diferencia a garantia comercial do direito de arrependimento previsto no CDC, quando aplicável.

## Registro de acesso

- `GET /api/shared/{token}` registra `first_shared_opened_at` antes de devolver conteúdo válido de um presente pago e finalizado. A primeira abertura é imutável; consultas seguintes não alteram a data.
- O primeiro acesso e a criação de uma solicitação travam a mesma compra. Se o acesso vencer a transação, a solicitação comercial é recusada. Se o pedido for registrado primeiro, seu snapshot preserva as condições naquele momento. A análise posterior não perde validade só porque o tempo passou ou o link foi aberto depois.
- A prévia autenticada por ID, demonstrações, HEAD, tokens inválidos e presentes indisponíveis não consomem a garantia comercial. Downloads de mídia não são contabilizados como uma nova abertura.
- O registro representa acesso bem-sucedido ao conteúdo na API, não comprova identidade nem leitura humana. Robôs que executem a consulta pública podem contar como abertura. Não se gravam IPs ou identificação do destinatário nesses campos.
- `share_tracking_started_at` marca o início do registro por compra. A migration preenche somente essa coluna nova nos pedidos existentes; novas compras recebem o horário no model. Compras pagas antes desse início têm histórico não verificável e usam análise individual. Não se presume que nunca foram abertas.
- Datas são armazenadas no servidor em UTC, com a sessão PostgreSQL explicitamente em UTC para compatibilizar paid_at legado e as novas datas com fuso. As 72 horas não dependem do relógio do cliente. A API envia relógio e prazo em milissegundos para a interface. A projeção pública não inclui elegibilidade, histórico de reembolso ou os horários privados de rastreamento.

## Solicitações e decisões

`POST /api/purchases/{purchase}/refund` recebe `reason` (5–1000 caracteres) e `request_kind` (`commercial` padrão ou `legal_review`). Exige dono autenticado, compra paga ativa, CSRF e limite de requisições. Valores, dono, status e horários do corpo não são aceitos.

`refund_eligibility` na projeção privada informa `eligible`, `reason`, `expires_at`, `first_opened_at`, `legal_review_available` e `server_time_ms`. Motivos comerciais: `not_paid`, `payment_date_unknown`, `link_opened`, `expired` e `tracking_unverified`.

`refunds.eligibility_snapshot` conserva a verificação no envio; `request_kind` diferencia os canais. Pedidos antigos mantêm esses campos nulos e as decisões existentes. Repetições reutilizam o pedido existente. Depois de uma recusa comercial, uma análise legal pode ser aberta sem sobrescrever a decisão anterior. Uma análise legal existente ou uma solicitação já pendente/aprovada é reutilizada para evitar duplicação. A seleção da solicitação mais recente prioriza a análise legal, inclusive quando duas solicitações têm o mesmo segundo de criação.

O admin não aplica o limite comercial ao concluir uma análise legal. As proteções financeiras continuam: Mercado Pago exige confirmação de estorno total pelo provedor; Pix manual exige conferência da devolução original. O status da compra e o acesso compartilhado só são alterados pelo fluxo financeiro existente.

## Implantação

Aplicar a migration Laravel `2026_10_25_010407_add_refund_eligibility_tracking.php` antes de promover a nova versão. Ela acrescenta duas datas em purchases, tipo/snapshot em refunds e índice por compra/data. Não apaga pedidos, muda valores ou reescreve decisões. Em Supabase, manter essas tabelas no schema privado `app_private`, sem acesso de anon/authenticated. O backend Laravel continua responsável pela autorização.
