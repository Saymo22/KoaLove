# Tratamento da auditoria na integração dos PRs

Os relatórios desta pasta são evidências históricas do commit `2b64769`, não a descrição do estado atual nem instruções para alterar produção automaticamente.

## Correções implementadas

- CODE-01: suporte não lê presentes de terceiros pela policy nem recebe conteúdo, manifesto, link compartilhado ou registros de reembolso no detalhe legado do cliente. Owner/manager e o dono do presente mantêm o acesso autorizado.
- ACL-01: 403/404/405 não expõem classes, IDs ou padrões internos. Sessão expirada e rate limit recebem mensagens em português.
- ACL-02: confirmar upload antes do PUT ou com objeto indisponível retorna conflito recuperável; erros de leitura/metadados do storage são tratados. A reserva continua permitindo nova tentativa.
- CODE-02: somente mutações, leituras privadas sensíveis e recusas de segurança geram auditoria; falha na gravação não transforma uma operação concluída em erro. O fallback registra apenas mensagem fixa, sem SQL ou dados pessoais.
- CODE-08: a publicação estática copia apenas `build/assets`, preservando o manifest necessário ao Laravel no pacote PHP. O manifest não integra os arquivos públicos estáticos.
- LEAD-01/02: CORS da API desabilitado explicitamente para manter a sessão na mesma origem; o front controller remove `X-Powered-By`.
- AUTH-02/06: novas senhas recusam combinações comuns e igualdade com nome/e-mail, preservando o limite bcrypt e os logins existentes. O cadastro devolve `role=user` consistentemente.

Testes de regressão em `IntegrationSecurityTest`, `CloudMediaTest` e `static-assets.test.cjs`; suítes completas SQLite/PostgreSQL, frontend, build e Pint fazem parte da validação da integração.

## Decisões e limites

- OPS-01: `projetona.vercel.app` é o domínio de produção, com pagamentos reais expressamente autorizados pelo proprietário. `live=true` nesse domínio não demonstra configuração incorreta. Não desativar o gateway nem habilitar simulação em produção. QA deve usar banco isolado, gateway falso nos testes e credenciais sandbox em prévias separadas; nunca concluir cobrança real durante testes.
- AUTH-05: `+alias` não é universalmente equivalente a outra caixa postal. Não remover tags/pontos de e-mails nem unir contas automaticamente; a identidade continua sendo o endereço completo normalizado em minúsculas. Não há benefício por e-mail/caixa postal que justifique essa canonicalização.
- ACL-03: uma URL S3 já assinada não pode ser revogada individualmente. O objeto final fica em outro caminho privado, e a reserva concluída é preservada para a limpeza de qualquer PUT repetido após expiração. O teste de limpeza existente cobre esse caso; não remover a reserva ao concluir.
- CODE-03: assinatura, consulta autenticada e idempotência por recibo continuam obrigatórias. Repetir uma notificação apenas reconcilia o estado verificado no provedor; não gera cobrança ou segundo crédito. Não descartar automaticamente notificações antigas ou marcar eventos antes da sincronização, pois isso pode perder tentativas legítimas de entrega. Uma janela rígida precisa ser validada contra a política de retries do provedor antes de ser introduzida.
- AUTH-04: cookie já possui Secure/HttpOnly/SameSite e domínio restrito. Prefixo `__Host-` é endurecimento opcional que exige coordenar configuração de domínio/path/HTTPS e invalida sessões existentes; não é corrigido alterando cegamente só o nome.

## Pendências operacionais explícitas

- AUTH-01/AUTH-08: a eliminação completa da enumeração no cadastro exige resposta uniforme e comprovação de e-mail antes do login. O fluxo atual continua com cadastro imediato; trocar somente o texto da duplicidade não resolveria. É necessário configurar e testar entrega SMTP antes de substituir o fluxo, para não impedir todos os novos cadastros. Não declarar esse achado resolvido.
- AUTH-07: SMTP real permanece necessário para recuperação, convites e alertas. Nenhuma senha SMTP foi inventada e nenhum envio foi simulado em produção.
- MFA, revisão das contas de teste e rotação da credencial administrativa dependem de operação coordenada. Não excluir contas, mudar senhas de terceiros ou criar novas credenciais dentro deste merge.
- AUTH-03: mensagens explícitas de erros HTTP foram traduzidas; a tradução de todo o catálogo de validação Laravel permanece uma melhoria separada.

Os relatórios não autorizam apagar dados, desligar a proteção da Vercel, trocar segredos, tornar o repositório privado ou modificar serviços contratados.
