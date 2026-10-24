# API Laravel

Pix e cartão usam o [Mercado Pago Checkout Pro](PAYMENTS.md), com liberação após confirmação verificada do provedor. Pedidos Pix manuais existentes mantêm sua conferência pelo admin.

Mesma origem e prefixo /api. Sessão Laravel em cookie HttpOnly/SameSite=Lax; mutações exigem CSRF e Content-Type application/json, exceto o upload binário. O meta csrf-token vem de uma página Blade. Não há CORS aberto nem autenticação por ID/token de dono na URL.

Respostas: {ok:true,data:...}; erros {ok:false,error:{code,message,meta?}}. Validação: 422; autenticação: 401; autorização: 403; conflito: 409; corpo grande: 413; formato: 415; sessão CSRF expirada: 419; limite: 429 com Retry-After. Erros internos não devolvem stack traces nem SQL.

## Endpoints

- GET /config: temas, preço em centavos, moeda, cupons públicos e disponibilidade da simulação. `payments` informa provider/configured/live, sem segredos. `media_upload` indica `server` (disco local) ou `direct` (adapter externo opcional); `media_storage` informa `configured`, `mode` e limites por tipo, sem caminhos ou credenciais. Disco local em função Vercel retorna `configured=false`; uploads indisponíveis respondem `503 MEDIA_UNAVAILABLE`, mantendo o rascunho do navegador.
- POST /auth/register (name,email,password), /auth/login (email,password), /auth/logout.
- GET /auth/me: usuário sem hashes, tokens ou campos internos.
- POST /auth/forgot-password (email); /auth/reset-password (email,token,password). Link descartável, com validade de 60 minutos; reset revoga sessões persistidas.
- GET/POST /purchases, GET /purchases/{purchase}.
- POST /purchases/{purchase}/media/{asset}: corpo binário, MIME real validado; asset de 16 a 100 caracteres alfanuméricos, hífen ou sublinhado. Repetições do mesmo ID/tipo reutilizam a mídia existente.
- Com `GET /config` indicando `media_upload=direct`, POST /purchases/{purchase}/media/{asset}/upload-url recebe mime/bytes e devolve upload_id/url/headers para PUT direto sem cookies; pode devolver complete=true para asset já concluído. POST /purchases/{purchase}/media/{asset}/complete-upload recebe upload_id e valida o objeto antes de liberar seu uso. Reservas contam na cota e expiram em 20 minutos; a URL de PUT vale 5 minutos. Uma nova tentativa começa solicitando upload-url novamente.
- POST /purchases/{purchase}/update: conteúdo + media:{photos:[asset],videos:[asset],music:asset|null}. Só aceita mídias da própria compra; finaliza content_version=1.
- POST /purchases/{purchase}/migrate: atualização de compra legada paga ainda sem mídia sincronizada.
- POST /purchases/{purchase}/pay: metodo pix/card e cupom opcional; preço calculado no servidor. No Mercado Pago retorna purchase pendente e checkout:{status,url,method,coupon,amount_cents}; redirecione para checkout.url. Iniciar checkout congela conteúdo, valor, cupom e método; novas tentativas reutilizam a preferência. Repetir pagamento aprovado devolve a compra paga. Consulte [PAYMENTS.md](PAYMENTS.md).
- POST /webhooks/mercadopago: notificação payment assinada por HMAC; única mutação sem CSRF. Consulta o pagamento no provedor e verifica referência, titular, BRL, valor e modo live/test antes de aprovar. Parâmetros de retorno do navegador não aprovam compras. Assinatura inválida: 401; divergência no pagamento: 422; provedor/configuração indisponível: 503.
- POST /purchases/{purchase}/delete: soft delete; revoga compartilhamento.
- GET /shared/{token}, /shared/{token}/media/{asset}: somente presente pago, finalizado e ativo. Token aleatório de 256 bits. Projeção pública não inclui dono, cobrança nem dados de outros temas. Mídia aceita Range via Symfony.
- GET /purchases/{purchase}/media/{asset}: exige dono e mídia selecionada no manifesto.
- Para mídia S3, o GET autorizado retorna redirecionamento para uma URL privada assinada por 1 minuto; o armazenamento atende Range. Objetos em quarentena não são acessíveis por essas rotas.
- GET /privacy/export: exportação autenticada JSON. Arquivos binários seguem disponíveis nos presentes da conta; não estão embutidos na exportação.
- POST /privacy/delete: confirma password, desativa conta e links imediatamente; purga em até 30 dias.
- Admin: GET /admin/summary, /clients, /clients/{user}, /purchases, /refunds, /tickets; POST /refunds/{refund}/decision (status approved/rejected,note), /tickets/{ticket}/reply (text). Para compras simuladas, reembolso e status mudam na mesma transação. Para Pix manual, aprovar reembolso exige refund_sent=true após devolver no banco. Para Mercado Pago, aprovar a solicitação retorna 409 até o provedor confirmar status refunded pelo webhook; depois disso, o admin pode concluir o atendimento sem efetuar uma nova devolução.

## Limites

Com `FILESYSTEM_DISK=supabase`, o teto configurado do provedor também se aplica: no plano Free são 50.000.000 bytes por arquivo. `media_storage.limits` publica os limites efetivos; o cliente verifica antes do envio e o servidor verifica a reserva e o arquivo normalizado. O disco é registrado em cada asset/reserva; referências dos temas permanecem estáveis.

Por IP/minuto: páginas dinâmicas 1200, API 240, login 5, cadastro 3, recuperação 3, criação 10, mutações 90, admin 120. O cache deve ser compartilhado entre workers. Metadados JSON: 2 MiB e profundidade limitada. themeData: 200 KB, profundidade 10, máximo 300 itens por nível, texto 4000 caracteres. Upload: foto 15 MiB/16 MP, áudio 25 MiB, vídeo 100 MiB; 300 MiB e 80 assets por compra. Manifesto: 1–12 fotos, até 4 vídeos e 1 música.

Além do IP, login permite 5 tentativas/minuto por e-mail normalizado; solicitação de recuperação, 3/hora por e-mail; redefinição, 5/minuto por e-mail. As chaves do cache usam HMAC, sem o e-mail em texto aberto. Exclusão de conta exige a senha atual e permite 5 tentativas/minuto por usuário e IP. Não há bloqueio permanente de conta. Recuperação usa sempre APP_URL para o link; validação, troca de senha, revogação de sessões e consumo do token são atômicos.

Criação aceita client_request_id estável, único por usuário. Trava de usuário + constraint evita duplicação sob concorrência. Bloqueios de compra serializam upload/finalização/pagamento. PhotoIds e referências @media preservam campos de temas após reordenar fotos. URLs .html foram preservadas; são views Laravel, não arquivos públicos.
