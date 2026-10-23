# Contrato atual: salvamento e entrega dos presentes

Este adendo substitui as descrições de armazenamento local e das rotas de compras no documento histórico CONTRACT.md. O README.md descreve a configuração do projeto.

| Método e rota | Acesso e comportamento |
|---|---|
| POST /api/purchases | Sessão; idempotência por usuário + client_request_id; cria pending incompleto |
| GET /api/purchases | Sessão; lista próprios ativos e comprovantes pagos excluídos |
| GET /api/purchases/:id | Dono/admin; não retorna presentes excluídos |
| POST /api/purchases/:id/media/:asset | Dono; binário com Content-Type permitido e ID estável |
| POST /api/purchases/:id/update | Dono; somente pending; confirma manifest de uploads existentes |
| POST /api/purchases/:id/migrate | Dono; permite sincronização inicial de presente antigo já pago |
| POST /api/purchases/:id/pay | Dono; pending completo; pagamento simulado |
| POST /api/purchases/:id/delete | Dono; soft delete e revogação da entrega, recibo preservado |
| GET /api/purchases/:id/media/:asset | Dono; mídia referenciada no manifest atual |
| GET /api/shared/:token | Sem sessão; pago, completo e não excluído; não expõe conta ou pagamento |
| GET /api/shared/:token/media/:asset | Mesma autorização pública; suporta bytes Range |

POST create é apenas reserva de rascunho. Para entregar, enviar arquivos e confirmar update. Um retry usa o mesmo client_request_id; ao receber o ID, o cliente passa a atualizar esse pedido. Cache IndexedDB não decide se um presente foi pago. Erros de API são definitivos no visualizador, sem fallback que contorne 401/403/404.

Conteúdo: tema, título, remetente, destinatário, data, carta, frase, eventos, motivos, legendas, capa, nome/artista, introdução, autoplay, rodapé e themeData. Fotos usam IDs estáveis, incluindo referências @media:ID nos detalhes. Eventos alimentam coleções vinculadas; somente os campos alterados são sobrepostos em __naOverrides. Arrays históricos continuam sendo tratados como valores explícitos para preservar personalizações anteriores.

Arquivos ficam em NA_DATA_DIR/media (padrão server/data/media), fora de public/. A mídia não é servida pelo caminho físico. Limites e formatos estão no README. Não se promete compatibilidade de codec apenas pela extensão do arquivo.

JsonStore: load obrigatório; mutações serializadas em cópias; tmp+rename antes de publicar em memória; falha não contamina fila; leituras devolvem cópias; versão anterior mantida em .bak. Uma instância do servidor por diretório de dados.

A segunda revisão adiciona limites independentes para arquivos públicos (1.200/minuto) e leitura de mídias (600/minuto). Os endpoints de autenticação mantêm suas regras específicas. A conta identifica reembolsados separadamente, preserva o histórico mesmo após exclusão e mantém o preço registrado no pedido no checkout. Veja REVISAO-2-RESULTADO.md na raiz do projeto.
