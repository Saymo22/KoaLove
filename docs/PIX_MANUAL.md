# Pix com conferência manual

Este é o modo escolhido para a implantação atual. Recebimento direto na chave Pix, sem credenciais de Mercado Pago ou API bancária. O servidor gera um BR Code estático com chave, recebedor, cidade, valor em BRL, referência aleatória do pedido e CRC16. QR Code e Copia e Cola são gerados localmente; nenhum serviço externo recebe os dados para gerar a imagem.

## Configuração

Na Vercel Production, configure `PAYMENT_GATEWAY=pix_manual`, `PAYMENTS_ENABLED=true`, `PIX_KEY`, `PIX_RECEIVER_NAME` e `PIX_RECEIVER_CITY`. Preserve `SIMULATED_PAYMENTS=false`. Use a chave efetivamente cadastrada no banco e confira pessoalmente o recebedor no aplicativo bancário antes de divulgar. Chave aleatória, email, telefone internacional com `+` ou CPF/CNPJ são aceitos; o servidor valida formato, mas não consulta o cadastro bancário. Nome/cidade são convertidos para ASCII e limitados a 25/15 caracteres do BR Code.

Mantenha `PAYMENTS_ENABLED=false` em Preview com banco compartilhado. Esses dados são apresentados aos clientes no checkout autenticado; não são senhas, mas não devem virar fixtures ou aparecer em logs/versionamento. Nenhuma chave secreta de API é necessária. Execute a migration Laravel `create_payment_checkouts` antes do deploy: tabelas no schema privado, RLS adicional em app_private, sem acesso por anon/authenticated. Reimplante após mudar variáveis.

## Cliente

1. Finaliza e sincroniza as mídias; abre pagamento e aplica cupom, se houver.
2. Clica em **Gerar Pix**. O servidor calcula o valor e congela conteúdo/valor/cupom, sem aprovar a compra. Cartão fica oculto neste modo.
3. Confere recebedor/valor no banco e paga uma única vez por QR ou Copia e Cola. Guarda comprovante/EndToEndId.
4. Aguarda a conferência manual. **Verificar liberação do presente** apenas consulta o servidor; nenhum botão do cliente aprova o pagamento.

Abrir novamente o checkout devolve o mesmo payload/referência. Os dados do recebedor são um snapshot: trocar a chave no ambiente afeta somente novos pedidos. O QR estático não tem vencimento bancário automático; excluir um pedido não impede transferências a partir de um código já copiado. Não gere Pix novamente para uma cobrança já paga; investigue divergências e devolva pagamentos duplicados no banco.

## Administrador

No [painel](https://projetona.vercel.app/admin/dashboard.html), abra **Pix aguardando conferência**. Confira no aplicativo bancário o crédito real, valor, data, pagador e referência do pedido. O comprovante enviado pelo cliente sozinho não comprova recebimento. Se a referência não aparecer no extrato, concilie o identificador bancário com o cliente antes de liberar. Não aprove só por coincidência de valor.

Preencha o **ID da transação recebida (EndToEndId)** e clique em **Confirmar recebimento e liberar**. A confirmação exige conta admin, sessão/CSRF, valor exato e uma referência bancária ainda não usada. O servidor grava admin/data/ID bancário e aprova em transação. Repetir a mesma confirmação não altera a data; outro pagamento/referência não sobrescreve uma compra já aprovada. Pedidos excluídos/contas desativadas não são reativados. A aplicação registra a declaração do operador; não consulta o saldo nem verifica o crédito no banco automaticamente.

Para reembolso, faça primeiro a **devolução da transação original no aplicativo do banco**, confira o resultado e só então aprove o reembolso no admin. O painel exige confirmação de devolução e revoga o acesso ao presente. Nenhum botão do site transfere dinheiro. Pagamento tardio de um pedido excluído exige atendimento/devolução pelo operador. Compras pendentes seguem a retenção de 30 dias; confira pendências regularmente.

## API, privacidade e testes

`POST /api/purchases/{id}/pay` retorna compra pendente e `checkout` com provider pix_manual, status awaiting_confirmation, method pix, amount_cents, coupon e pix:{key,name,city,txid,payload}. Nenhum redirecionamento externo é necessário. Conteúdo e uploads ficam bloqueados após gerar o Pix.

`POST /api/admin/purchases/{id}/confirm-pix`: amount_cents inteiro positivo, bank_reference alfanumérica/hífen com 8–64 caracteres, received=true. Acesso admin obrigatório, CSRF e rate limit. Divergência de valor: 422; pedido já processado/ID bancário duplicado: 409. Reembolso manual usa `refund_sent=true` na decisão administrativa, somente depois de devolver no banco.

Exportação do titular inclui provider, valores, estado, ID bancário e data da conferência. Links compartilhados não expõem cobrança, chave ou referência. Retenção/exclusão definitiva remove o checkout por FK; dados bancários externos seguem a política do banco. Não armazene imagens de comprovantes como se fossem fotos do presente.

Testes cobrem geração estável, pendência, preço calculado no servidor, QR/Copia e Cola no cliente, autorização, valor divergente, referência duplicada, idempotência, conta desativada, exclusão e devolução. Testes automáticos usam dados sintéticos e não realizam transferências. A validação no aplicativo bancário permanece necessária antes de divulgar o recebimento.

O adapter [Mercado Pago](PAYMENTS.md) permanece opcional e desativado neste modo; seu webhook retorna indisponível. Para ativação futura, configure e valide o provedor separadamente, sem converter silenciosamente pedidos Pix manuais existentes.

Referência: [Pix Cobrança — Banco Central](https://www.bcb.gov.br/estabilidadefinanceira/pix-cobranca) e [padrões do QR Code Pix](https://www.bcb.gov.br/content/estabilidadefinanceira/pix/Regulamento_Pix/II_ManualdePadroesparaIniciacaodoPix.pdf).
