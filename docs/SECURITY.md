# Política de segurança e privacidade

## Regras para alterações (OWASP)

Valide limites, tipos e propriedade no servidor mesmo que haja validação no navegador (A01/A03/A04). Use policies para compras e middleware para sessão/admin. Nunca aceite role, preço, status ou owner do corpo. Use Eloquent/queries parametrizadas; escape texto no DOM e Blade. Não use input como caminho de disco, comando de shell ou HTML sem tratamento.

Senhas usam o hasher Laravel; sessão regenerada no login/cadastro, cookie HttpOnly, SameSite e Secure em produção. Reset usa token hash, expiração e revoga sessões. Não devolva password, remember_token, reset token, caminhos privados ou SQL. Não registre bodies, cookies ou query strings de links compartilhados. Segredos somente por ambiente. Recupere cópia segura antes de migrations destrutivas.

Mutações da sessão passam pela proteção CSRF Laravel e limites por IP persistidos no cache. A exceção exata é `/api/webhooks/mercadopago`, que exige assinatura HMAC e consulta autenticada ao provedor. JSON tem limite antes da desserialização. Upload é binário, gravado em arquivo temporário em blocos, com limite por arquivo/compra. MIME declarado é comparado ao conteúdo; imagens são decodificadas sob limite de 16 MP e recodificadas em PNG, removendo metadados e conteúdo extra. GIF animado vira imagem estática. GD não é antivírus; áudio/vídeo são analisados pelo FFprobe com protocolos restritos e timeout de 15s. Para produção, mantenha GD/FFmpeg atualizados e limite workers/memória/tempo no sistema; uma instância pública pode precisar de scanner/sandbox adicional conforme risco.

Mídias ficam em storage/app/private, sem symlink público. Downloads verificam dono ou token de presente pago e selecionado; usam nosniff/no-store. CSP restringe scripts à mesma origem; estilos dinâmicos dos temas ainda exigem unsafe-inline para style-src. A migração elimina código inline das views. Bibliotecas/dependências têm lockfiles e auditoria na CI. Não relaxe essas regras para fazer um teste passar.

## Acesso, retenção e LGPD

A infraestrutura Supabase usa PostgreSQL no schema `app_private`, fora da Data API, e bucket privado `gift-media`; o backend Laravel continua na Vercel. Contas, hashes e sessões permanecem no esquema Laravel, sem duplicação em Supabase Auth. O role dedicado não é superusuário nem administra outros roles; segredos S3 ficam somente no backend. Consulte [SUPABASE.md](SUPABASE.md) para configurar e verificar a implantação. A alternativa local continua exigindo volume persistente privado; funções Vercel recusam esse modo, sem fallback para `/tmp`.

O adapter S3/Supabase de upload direto usa reserva autenticada, cota e quarentena; a confirmação valida o conteúdo no servidor. URLs assinadas de upload expiram em até 5 minutos e nunca ultrapassam a reserva; downloads expiram em 1 minuto. Uma URL de download já emitida continua utilizável até expirar, inclusive após revogação do presente. Configure CORS somente para origens do projeto, bloqueie acesso público ao bucket e monitore a limpeza das reservas, inclusive registros concluídos com bytes zero que permitem remover reenvios de URLs ainda válidas. Declare somente os provedores efetivamente utilizados na política pública.

- Conta e presentes ativos: utilizados para entregar o serviço enquanto a conta permanecer ativa. Nenhuma promessa técnica de hospedagem eterna.
- Rascunhos não pagos: 30 dias desde a última atualização; upload renova essa atividade.
- Presente excluído: link revogado imediatamente, purga em 30 dias.
- Exclusão de conta: senha confirmada, bloqueio imediato de autenticação e links, sessões/tokens revogados; conta, compras, atendimento e arquivos eliminados após 30 dias pelo job diário. Pedidos legais de preservação exigem procedimento documentado antes da implantação.
- Auditoria: rotas dinâmicas e API, usuário interno, IP pseudonimizado por HMAC, resultado HTTP e data, por 30 dias. Não inclui token no caminho real, email, conteúdo ou credenciais. HMAC é pseudonimização, não anonimização.
- Sessões: IP e navegador necessários à segurança, expiração de 120 minutos; limpeza diária. Tokens de recuperação expiram em 60 minutos e são limpos diariamente.
- IndexedDB/localStorage: rascunhos, mídia/cache e preferências no dispositivo, mantidos até limpar os dados do site. Exclusão no servidor não apaga cópias de outros navegadores; a interface limpa cache/rascunhos desta origem ao excluir a conta. O usuário pode limpar os dados do site pelo navegador.
- Backups e logs da infraestrutura: responsabilidade do operador, criptografados e com prazo máximo de 30 dias. A aplicação não consegue apagar snapshots externos; reaplique exclusões antes de reabrir uma restauração.

Exportação autenticada e exclusão estão em Minha Conta. Para correção, confirmação e demais direitos, o mantenedor deve configurar PRIVACY_EMAIL e identificar o controlador na página de privacidade antes de publicar. Esta implementação não é uma certificação de conformidade jurídica.

## Terceiros

Não há AdSense, analytics ou publicidade integrados. Fontes Google e imagens/mídias de demonstração externas recebem requisições do navegador; conteúdo de temas pode referenciar URLs externas escolhidas pelo usuário. Isso expõe ao provedor IP e informações técnicas. Para reduzir esse compartilhamento, hospede fontes e demonstrações localmente. QR é gerado no próprio navegador; não envia o link a serviço externo. MAIL_* determina o provedor SMTP para recuperação. O Mercado Pago Checkout Pro está implementado, condicionado às credenciais e à ativação explícita; não recebe conteúdo dos presentes nem coleta cartão no aplicativo. Recibos guardam somente IDs, estados e valores; exportação autenticada inclui os registros do titular. Veja [PAYMENTS.md](PAYMENTS.md) para confirmação, estornos e limites operacionais. Declare operador de hospedagem e provedores efetivamente usados antes do lançamento.

## Operação e incidentes

Sirva somente public/, HTTPS, debug desativado, conta DB com menor privilégio, SMTP/PRIVACY_EMAIL configurados, scheduler monitorado. Não confie em cabeçalhos de proxy sem configurar os proxies autorizados. Limite corpo e conexões no reverse proxy. Revise exposição e retenção dos logs do servidor web.

Reporte suspeitas de vulnerabilidade ao mantenedor por canal privado. Não abra issue público com tokens, dados pessoais ou provas que exponham contas. Ao conter incidente, revogue sessões/links afetados, preserve somente evidência mínima com acesso restrito e prazo, avalie notificações aplicáveis e registre a correção e seus testes.

## Pix manual

O modo atual usa [Pix manual](PIX_MANUAL.md). Chave/recebedor são apresentados somente no checkout autenticado. A aplicação não consulta o banco: um admin declara o crédito conferido, informa identificador bancário único e confirma o valor. A rota exige sessão, role admin e CSRF; grava operador/data. Nenhum botão do cliente aprova compras. Devoluções devem ser feitas no banco antes de registrar o reembolso no painel.
