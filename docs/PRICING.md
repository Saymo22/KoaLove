# Planos, promoções e cupons

O administrador gerencia os preços em `/admin/planos`, pelo menu **Planos e descontos**. Apenas contas com role `admin` acessam a API de edição. A instalação mantém um único plano, **Presente completo**, de **R$ 19,90**; os outros são cadastrados pelo administrador.

## Cadastro

- Planos: nome, descrição, preço em reais, benefícios (um por linha), limites de fotos/vídeos/música, ordem, destaque e estado ativo. Entre um e três planos podem ficar ativos; outros podem ser salvos como rascunhos desativados. Para retirar um plano, edite e desmarque Ativo. Não existe exclusão que apague o histórico de compras.
- Os limites permitidos são 1–12 fotos, 0–4 vídeos e 0–1 música. Esses tetos, os mínimos e o padrão legado (12/4/1) vivem em uma única fonte no backend, `App\Support\PlanLimits`; o formulário do admin e as validações da API usam os mesmos valores. Todos os planos usam os 13 temas existentes; os benefícios textuais não habilitam novos recursos técnicos. Informe benefícios compatíveis com esses limites.
- Promoções: percentual de 1% a 95%, plano específico ou todos, início e fim obrigatórios. Os horários são digitados no fuso do navegador e enviados em UTC. A home mostra o preço anterior, o preço com desconto e o tempo restante real da promoção. Ao terminar, o preço normal volta automaticamente. Sem promoção vigente, o temporizador fica oculto.
- Cupons: código de 3–20 letras/números, hífen ou sublinhado, percentual, plano específico ou todos, datas opcionais e estado ativo. São normalizados para maiúsculas. Não há limite de utilizações; desative ou defina uma validade para encerrar. Os códigos não são publicados no catálogo da home.

Descontos não se somam: aplica-se o maior percentual válido entre promoção e cupom. Um cupom inválido, vencido ou de outro plano é recusado. Se houver várias promoções, vence o maior desconto vigente. O banner destaca a oferta do plano principal, ou outra oferta ativa quando o principal não tem promoção.

## Home, criação e pagamento

Com três cards, o plano destacado aparece na posição central, mantendo a ordem relativa dos demais. No criador, novas escolhas de fotos/vídeos acrescentam arquivos à coleção existente; duplicatas da mesma seleção não consomem cota, e arquivos podem ser removidos individualmente. A seleção múltipla aceita lotes completos até a cota disponível. Se um novo lote exceder as vagas, adiciona somente os primeiros arquivos que couberem e informa quantos ficaram de fora, preservando os anteriores. Se a seleção ultrapassar um plano menor, a troca é recusada com orientação para reduzir as mídias, preservando o plano e os arquivos atuais. Rascunhos antigos acima da cota não avançam da etapa de mídia nem seguem para pagamento. Depois da primeira criação no servidor, o seletor fica bloqueado no snapshot registrado, inclusive após envio interrompido.

A home consulta o catálogo ao abrir, ao recuperar o foco e a cada 30 segundos. Recarregue para conferir uma alteração imediatamente. Os cards preservam o visual existente, em três colunas no desktop, duas em telas intermediárias e uma no celular. Só aparecem planos ativos. A home, o formulário de criação e o painel administrativo exibem as quantidades a partir do catálogo/API, nunca de números fixos no HTML.

O botão de cada card leva o plano selecionado ao formulário. O nome, os benefícios e os limites são registrados na compra; mudar o cadastro depois não altera os limites de um rascunho já salvo. Para trocar seu plano, crie um novo presente. O servidor valida os limites tanto no upload de cada mídia quanto no manifesto final.

Os uploads recusam novas fotos, vídeos ou músicas acima da cota do tipo definida no plano (`422`), mas permitem substituir mídias já referenciadas pelo rascunho. Ao finalizar, o servidor revalida o manifesto contra o `plan_snapshot` congelado na compra e devolve uma mensagem com o nome do plano e os limites aplicados. Os tetos globais de 80 assets e 300 MiB por compra continuam valendo.

Reservas diretas contam somente na cota do próprio tipo, identificado pelo MIME validado. Antes de reenviar uma tentativa interrompida, o criador declara a seleção em `/media/selection`; arquivos abandonados liberam a cota, e arquivos do manifesto anterior são preservados até o novo salvamento concluir. Reservas canceladas mantêm seus registros de limpeza até expirar, pois uma URL PUT já emitida ainda pode ser utilizada. O frontend aceita cotas do catálogo e normalizadas no mesmo helper; rascunhos preservam todos os arquivos e o envio bloqueia excessos para ajuste explícito, sem truncar a seleção.

Antes do checkout, o servidor consulta o preço atual e os descontos válidos. O cliente envia o total que acabou de mostrar: se houver divergência, o pagamento é interrompido para revisar o novo valor. Ao iniciar o checkout, valor, percentual, cupom e detalhes do preço ficam congelados. Alterações posteriores não modificam esse checkout nem compras já pagas. Pedidos antigos sem plano mantêm seu preço base registrado e continuam compatíveis.

Pix e cartão continuam pelo Mercado Pago. Configurar um plano ou cupom não efetua cobranças. O servidor calcula valores inteiros em centavos; valores ou percentuais enviados pelo navegador não determinam o preço.

## Banco e implantação

A migration Laravel `2026_10_24_191407_create_pricing_catalog.php` cria `plans`, `promotions` e `coupons`, com índices e referências por UUID. Acrescenta `purchases.plan_id`, `purchases.plan_snapshot` e `payment_checkouts.pricing_details`. Os campos novos de compras existentes são anuláveis; não há importação, remoção nem reprecificação de pedidos históricos.

Execute `php artisan migrate --force` antes de promover a versão que usa o catálogo. No Supabase, essas tabelas ficam em `app_private`, com RLS e sem acesso das roles `anon` e `authenticated`. O Laravel mantém a autorização; não exponha o schema na Data API. A migration inicializa somente o plano atual, sem cupons ou promoções de exemplo.

Verificações automatizadas cobrem autorização, preços, seleção/limites do plano, validade e escopo de descontos, conflito de valores e congelamento de checkout, em SQLite e PostgreSQL. Cadastros usados na verificação visual ficam exclusivamente no banco local de testes.
