# Chat e atendimento

O widget enviado foi adaptado em `resources/js/chat/widget.js`, com CSS externo em `resources/css/chatbot.css`. Shadow DOM isola o componente: nenhum fundo, margem ou estilo global da demonstração é aplicado às páginas. `partials/seo` carrega a entrada Vite nas páginas do site. O painel administrativo usa sua própria central de atendimento; iframes de prévias e temas não montam outro chat. O painel começa fechado, tem navegação por teclado, Escape, indicação de novas respostas e visual adaptado ao celular.

## Assistente automático

`knowledge.js` classifica mensagens por assunto: pagamento, mídia, conta, reembolso, temas, criação e compartilhamento. Quando não reconhece o assunto, pergunta em qual etapa está a dificuldade e oferece encaminhamento. É um assistente de respostas orientadas por regras, sem modelo de IA ou serviço externo. Não analisa fotos, contas bancárias ou conteúdo privado dos presentes.

Planos e temas vêm de `/api/config` ao responder, sem preços fixos inventados. Valores são apresentados como preços de tabela; promoções e cupons devem ser conferidos na cotação final do checkout. Indisponibilidade do catálogo leva à orientação para consultar a home. A regra de reembolso diferencia garantia comercial e direitos legais; o chat não decide nem executa devoluções ou pagamentos.

## Encaminhamento e conversa humana

1. “Falar com suporte” verifica a sessão no servidor. Visitantes recebem o link para entrar; perguntas gerais não exigem conta.
2. No primeiro atendimento, o assistente explica o encaminhamento e pede uma descrição. Ao enviar, informa que a descrição, até três perguntas anteriores e o caminho da página serão compartilhados com a equipe. Query strings, tokens de compartilhamento, conteúdo de presentes e anexos não são coletados automaticamente.
3. O backend usa `tickets`, já existente. Criação serializa pela conta; mensagens e respostas serializam pelo ticket. Cada mensagem do cliente tem UUID, permitindo repetir a mesma requisição sem duplicação. Assunto, contexto e papéis são definidos/validados pelo servidor. O cliente não escolhe usuário, ticket de outra pessoa ou status.
4. O admin abre **Atendimento → Abrir conversa**, lê a triagem e o histórico e responde no mesmo painel. Texto é renderizado com escape/textContent. A resposta não envia e-mail, WhatsApp ou notificações externas.
5. O cliente consulta a conversa a cada 15 segundos enquanto a página está visível. Respostas recebidas com o painel fechado mostram um indicador no botão. Ao voltar ao site com a mesma conta, o histórico é recuperado do servidor e o atendimento é retomado. “Voltar ao assistente” muda apenas o modo da conversa, preservando o ticket. O botão “Nova conversa” limpa a exibição local, sem apagar o histórico do suporte.

Não há promessa de resposta instantânea ou prazo de atendimento: a equipe precisa acompanhar a fila. O admin atualiza a fila a cada 30 segundos enquanto visível. Não há WebSocket ou dependência de Realtime. Abas em segundo plano pausam consultas; ao voltar, atualizam imediatamente. Novas mensagens do cliente reabrem o estado `open`; respostas do admin mudam para `answered`.

## Segurança, limites e dados

- Rotas na mesma origem com sessão Laravel; mutações exigem CSRF. Leitura privada recebe `Cache-Control: private, no-store`.
- A consulta seleciona apenas o atendimento da conta autenticada; nunca recebe um ID de dono pela URL. Contas em exclusão são recusadas. O backend não utiliza `auth.users` ou Data API pública do Supabase.
- Limite de 10 envios/minuto por conta e 30/minuto por IP, além do limite geral da API. Mensagens até 2.000 caracteres; triagem até três textos de 500 caracteres. Caminho da página limitado a `.html`, sem query ou fragmento.
- Até 498 registros do cliente/contexto por atendimento, reservando duas respostas da equipe. No limite, o cliente volta ao assistente e inicia outro atendimento; o histórico anterior permanece para o admin e na exportação privada.
- Conversas não são gravadas em localStorage/sessionStorage. Mudanças de conta ou perda da sessão limpam a exibição privada. Dados persistentes seguem o ciclo existente de exportação e exclusão de tickets da conta. Mensagens em texto não devem conter senhas, códigos ou dados bancários; a interface avisa isso.
- Sem alteração de esquema ou migração neste recurso. A implantação usa a tabela privada `app_private.tickets` existente no mesmo banco Laravel.

## Validação

Testes HTTP cobrem acesso por titular, bloqueio entre contas, visitante/conta desativada, criação e envios idempotentes, resposta do admin, reabertura, validação da triagem e limitação de requisições. Teste frontend cobre classificação, catálogo dinâmico, orientação de reembolso e esclarecimento de dúvidas desconhecidas. Conferir manualmente desktop e celular, envio, resposta administrativa, retomada após recarga e ausência de widget duplicado nas prévias.
