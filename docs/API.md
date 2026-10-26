# API Laravel

Mesma origem e prefixo /api. Sessão Laravel em cookie HttpOnly/SameSite=Lax; mutações exigem CSRF e Content-Type application/json, exceto o upload binário. O meta csrf-token vem de uma página Blade. Não há CORS aberto nem autenticação por ID/token de dono na URL.

Respostas: {ok:true,data:...}; erros {ok:false,error:{code,message,meta?}}. Validação: 422; autenticação: 401; autorização: 403; conflito: 409; corpo grande: 413; formato: 415; sessão CSRF expirada: 419; limite: 429 com Retry-After. Erros internos não devolvem stack traces nem SQL.

## Endpoints

- GET /config: temas, preço em centavos, moeda, cupons públicos e disponibilidade da simulação. `media_upload` indica `server` (disco local) ou `direct` (adapter externo opcional); `media_storage` informa `configured`, `mode` e limites por tipo, sem caminhos ou credenciais. Disco local em função Vercel retorna `configured=false`; uploads indisponíveis respondem `503 MEDIA_UNAVAILABLE`, mantendo o rascunho do navegador.
- POST /auth/register (name,email,password), /auth/login (email,password), /auth/logout.
- GET /auth/me: usuário sem hashes, tokens ou campos internos.
- POST /auth/forgot-password (email); /auth/reset-password (email,token,password). Link descartável, com validade de 60 minutos; reset revoga sessões persistidas.
- GET/POST /purchases, GET /purchases/{purchase}.
- POST /purchases/{purchase}/media/{asset}: corpo binário, MIME real validado; asset de 16 a 100 caracteres alfanuméricos, hífen ou sublinhado. Repetições do mesmo ID/tipo reutilizam a mídia existente.
- Com `GET /config` indicando `media_upload=direct`, POST /purchases/{purchase}/media/{asset}/upload-url recebe mime/bytes e devolve upload_id/url/headers para PUT direto sem cookies; pode devolver complete=true para asset já concluído. POST /purchases/{purchase}/media/{asset}/complete-upload recebe upload_id e valida o objeto antes de liberar seu uso. Reservas contam na cota e expiram em 20 minutos; a URL de PUT vale 5 minutos. Uma nova tentativa começa solicitando upload-url novamente.
- POST /purchases/{purchase}/update: conteúdo + media:{photos:[asset],videos:[asset],music:asset|null}. Só aceita mídias da própria compra; finaliza content_version=1.
- POST /purchases/{purchase}/migrate: atualização de compra legada paga ainda sem mídia sincronizada.
- POST /purchases/{purchase}/pay: metodo pix/card e cupom opcional; preço calculado no servidor. Repetir pagamento aprovado não duplica a operação.
- POST /purchases/{purchase}/delete: soft delete; revoga compartilhamento.
- GET /shared/{token}, /shared/{token}/media/{asset}: somente presente pago, finalizado e ativo. Token aleatório de 256 bits. Projeção pública não inclui dono, cobrança nem dados de outros temas. Mídia aceita Range via Symfony.
- GET /purchases/{purchase}/media/{asset}: exige dono e mídia selecionada no manifesto.
- Para mídia S3, o GET autorizado retorna redirecionamento para uma URL privada assinada por 1 minuto; o armazenamento atende Range. Objetos em quarentena não são acessíveis por essas rotas.
- GET /privacy/export: exportação autenticada JSON. Arquivos binários seguem disponíveis nos presentes da conta; não estão embutidos na exportação.
- POST /privacy/delete: confirma password, desativa conta e links imediatamente; purga em até 30 dias.
- Admin: GET /admin/summary, /clients, /clients/{user}, /purchases, /refunds, /tickets; POST /refunds/{refund}/decision (status approved/rejected,note), /tickets/{ticket}/reply (text). Reembolso e status da compra mudam na mesma transação. Não há gateway de estorno real.

## Limites

Por IP/minuto: páginas dinâmicas 1200, API 240, login 5, cadastro 3, recuperação 3, criação 10, mutações 90, admin 120. O cache deve ser compartilhado entre workers. Metadados JSON: 2 MiB e profundidade limitada. themeData: 200 KB, profundidade 10, máximo 300 itens por nível, texto 4000 caracteres. Upload: foto 15 MiB/16 MP, áudio 25 MiB, vídeo 100 MiB; 300 MiB e 80 assets por compra. Manifesto: 1–12 fotos, até 4 vídeos e 1 música.

Criação aceita client_request_id estável, único por usuário. Trava de usuário + constraint evita duplicação sob concorrência. Bloqueios de compra serializam upload/finalização/pagamento. PhotoIds e referências @media preservam campos de temas após reordenar fotos. URLs .html foram preservadas; são views Laravel, não arquivos públicos.
