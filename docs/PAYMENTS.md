# Mercado Pago Checkout Pro

O checkout usa a Preferences API oficial pelo cliente HTTP Laravel. O navegador é redirecionado para o Mercado Pago; a aplicação não coleta cartão, CVV ou documento do pagador. Pix e cartão são oferecidos conforme a disponibilidade da conta/provedor, com a opção escolhida no site como preferência inicial. O parcelamento está limitado a uma parcela. O preço atual continua vindo do servidor: R$ 19,90 na configuração padrão.

## Configurar a conta

1. Entre em [Suas integrações](https://www.mercadopago.com.br/developers/panel/app) com a conta que receberá os valores.
2. Crie/selecione uma aplicação: pagamentos online, Checkout Pro, website `https://projetona.vercel.app`. O titular deve concluir eventuais verificações, dados comerciais e aceites exigidos pelo Mercado Pago.
3. Em **Credenciais de produção**, obtenha o Access Token. Este fluxo por redirecionamento não precisa de Public Key no navegador.
4. Em **Webhooks**, configure a URL de produção `https://projetona.vercel.app/api/webhooks/mercadopago`, selecione **Pagamentos/payment** e obtenha a chave secreta de assinatura. Não use notificações IPN antigas sem assinatura nem habilite indiscriminadamente outros tipos de evento nessa rota.
5. Na Vercel, cadastre `MERCADO_PAGO_ACCESS_TOKEN` e `MERCADO_PAGO_WEBHOOK_SECRET` como variáveis **sensíveis**, somente em Production. Não publique valores em código, logs, chats ou arquivos versionados. Não compartilhe credenciais de produção com uma prévia.

## Variáveis e ativação

| Variável | Produção |
| --- | --- |
| `PAYMENT_GATEWAY` | `mercadopago` |
| `PAYMENTS_ENABLED` | `true` apenas após configurar e verificar |
| `MERCADO_PAGO_ACCESS_TOKEN` | Access Token secreto de produção |
| `MERCADO_PAGO_WEBHOOK_SECRET` | Segredo de assinatura dos Webhooks |
| `MERCADO_PAGO_LIVE_MODE` | `true` |
| `APP_URL` | `https://projetona.vercel.app` |
| `SIMULATED_PAYMENTS` | `false` |

Ausência de credenciais/HTTPS ou modo de teste em `APP_ENV=production` mantém a cobrança indisponível. `GET /api/config` publica somente disponibilidade/provedor/live, nunca os segredos. Configuração presente não comprova que a conta está habilitada: valide `/users/me` e o checkout real do provedor. Taxas e prazos são os da conta Mercado Pago; o valor bruto da compra é o usado na validação, sem confundir com líquido após tarifas.

Preview compartilhando o banco de produção deve manter `PAYMENTS_ENABLED=false` e `SIMULATED_PAYMENTS=false`. Testes do provedor exigem contas/credenciais de teste, `APP_ENV=staging`, `MERCADO_PAGO_LIVE_MODE=false`, HTTPS público e **banco isolado**. Não use um webhook de teste com o banco de produção.

Pedidos que já geraram Pix manual preservam seu código e a conferência pelo admin. A ativação do Mercado Pago vale para novos checkouts: não converte cobranças existentes, não cria outra preferência para elas e não permite que um webhook aprove um Pix manual.

Execute `php artisan migrate --force` com as credenciais do ambiente e Session pooler. As duas tabelas são criadas no schema Laravel configurado. Em `app_private` PostgreSQL, RLS é habilitado como camada adicional sem policies para `anon/authenticated`; o backend é o proprietário das tabelas. Nunca exponha esse schema pela Data API. As FKs e índices preservam associação, unicidade e limpeza na exclusão definitiva. O deploy não executa migrations automaticamente. Reimplante após alterar variáveis.

## Fluxo e confirmação

`POST /api/purchases/{id}/pay` verifica dono, mídias sincronizadas, preço/cupom no servidor e disponibilidade. Persiste um UUID estável em `payment_checkouts`, congela valor e conteúdo e cria a preferência fora da transação da compra. Uma trava compartilhada evita criações concorrentes. O retorno contém `purchase` ainda pendente e `checkout.url`; o cliente valida o domínio HTTPS antes de sair do site.

Uma nova tentativa reutiliza a mesma preferência. Depois de 23 horas, renova a validade da preferência existente por mais 24 horas via PUT, preservando UUID/valor. Se o POST original falhar ou sofrer timeout, a tentativa seguinte busca `external_reference` e concilia a preferência existente; não faz outro POST às cegas. Se não encontrar exatamente uma preferência, continua bloqueada para conciliação pelo operador. Não apague o registro para forçar nova cobrança: investigue antes no painel do provedor. O POST não depende de uma promessa de idempotência não documentada para preferências.

A URL de retorno vai para `/pagamento?...&retorno=1`. Parâmetros `status`, `collection_status` e `payment_id` do navegador **não aprovam** o presente. A tela consulta o estado no banco por até um minuto e libera o resultado apenas quando a API informa `paid`; o usuário pode atualizar depois se a confirmação atrasar.

O webhook é a única rota dispensada de CSRF; exige HMAC SHA-256 de `data.id`, `x-request-id` e `ts` conforme o contrato oficial. Lê a chave com ponto a partir da query bruta, rejeita IDs duplicados e exige que o ID do corpo corresponda ao assinado. Não usa o estado do corpo como prova. Depois da assinatura, consulta `/v1/payments/{id}` e verifica ID, referência interna, titular (`/users/me`, cache curto por token), modo live/test, BRL e valor exato em centavos.

Eventos repetidos atualizam o mesmo recibo. Cada transação do provedor fica em `payment_receipts`; uma segunda aprovação para o mesmo presente não troca o pagamento original nem libera duas vezes. **Pagamentos duplicados reais devem ser investigados e estornados pelo operador no Mercado Pago.** Reutilizar uma preferência evita preferências extras, mas não é garantia de que o comprador nunca conseguirá pagar duas vezes no provedor.

## Estornos, contestação e exclusão

Estorno total/parcial, chargeback ou mediação do pagamento que liberou o presente revogam o acesso compartilhado. Repetições antigas de aprovação não reativam estados terminais; eventual resolução favorável de contestação exige análise manual antes de restaurar acesso. Estorno de outra transação não revoga o pagamento original válido. O sistema não efetua estornos automaticamente: faça-os no painel Mercado Pago, e o webhook sincroniza a aplicação. O admin local só permite concluir a solicitação de reembolso depois de o webhook confirmar status refunded; estorno parcial, mediação e chargeback não são tratados como devolução total.

Excluir conta/presente não cancela uma cobrança no Mercado Pago. Uma aprovação tardia nunca restaura um presente excluído; se houver cobrança de conteúdo já removido, o operador precisa tratar o estorno. O job de retenção continua eliminando os dados do aplicativo conforme a política; registros mantidos pelo provedor seguem a política dele. Os recibos não armazenam payload bruto ou dados de cartão.

## Verificação

- Suíte `MercadoPagoTest`: aprovação pendente, assinatura falsa/ID divergente, valor/moeda/titular/modo incorretos, repetição, timeout/recuperação, renovação, permissões, conteúdo congelado, estorno total/parcial e exceção CSRF restrita.
- Verifique no navegador Pix/cartão, redirecionamento, retorno pendente e transição somente após aprovação, incluindo celular.
- No painel Webhooks, confira entregas HTTP 200 de eventos reais e teste indisponibilidade/reenvio. Falhas de rede/provedor retornam erro e preservam pendência para retry; não devolvem respostas brutas do Mercado Pago.
- Nenhuma cobrança real faz parte da suíte automática. Uma transação real de validação precisa ser realizada conscientemente pelo titular, com valor e eventuais taxas confirmados; não anuncie recebimento ativo só com testes mockados.

Referências oficiais: [criar preferência](https://www.mercadopago.com.br/developers/pt/reference/online-payments/checkout-pro-preferences/create-preference/post), [webhooks](https://www.mercadopago.com.br/developers/pt/docs/checkout-pro-preferences/payment-notifications), [preferências e consultas](https://www.mercadopago.com.br/developers/pt/reference/online-payments/checkout-pro-preferences/overview).
