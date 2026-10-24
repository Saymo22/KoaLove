# Revisão de segurança — 24/10/2026

## Escopo

Revisão de rotas, autenticação, autorização, recuperação/exclusão de conta, upload e validação de mídia, compartilhamento, renderização dos temas, pagamentos, configuração serverless, dependências e permissões do Supabase. Verificações no site em produção foram somente leituras; testes com usuários, tokens e falhas sintéticas usam bancos separados. Nenhuma cobrança, alteração de credenciais ou exclusão de dados reais.

## Correções

1. Login limitado somente por IP permitia distribuir tentativas contra a mesma conta. Agora há limite adicional por conta normalizada, com chave HMAC, também aplicado à recuperação. Limites têm expiração e não bloqueiam permanentemente a conta.
2. A URL de recuperação dependia do gerador de URL da requisição em servidores sem domínio forçado. Agora deriva diretamente de APP_URL, inclusive sob Host externo. Na Vercel já existia forceRootUrl; a correção protege também os demais ambientes.
3. O consumo do token ocorria depois da transação que alterava a senha. Uma falha nesse consumo podia deixar senha alterada e token reutilizável; duas redefinições concorrentes também não eram serializadas. Agora toda a operação fica na mesma transação, com trava da conta. A exclusão usa a mesma trava e verifica a senha atual dentro dela.
4. A exclusão usava somente o limite geral de escrita (90/minuto por IP). Recebe limite específico de 5/minuto por usuário e IP para tentativas de senha.
5. A CSP não delimitava os destinos de formulários. Adicionado form-action 'self', preservando o redirecionamento normal ao Checkout Pro.
6. A recuperação retornava antes de entrar no broker para contas inexistentes/inativas, pulando seu tempo mínimo de resposta. Todos os casos agora passam pelo broker, com filtro de conta ativa e a mesma resposta pública. O tempo de entrega de SMTP ainda depende do provedor; esse ajuste não promete latência idêntica em todos os cenários.
7. O logger padrão podia registrar mensagens de exceções e bindings SQL com conteúdo privado. O reporte de erros inesperados agora guarda somente tipo da exceção, arquivo/linha e padrão da rota, sem mensagem original, parâmetros, SQL ou trace com dados. Esse diagnóstico reduz o detalhe dos logs e deve ser combinado com os testes e a monitoração operacional.
8. Cadastro e redefinição permitiam senhas maiores que o limite de entrada do bcrypt (72 bytes), além de bytes nulos inválidos para o hasher. Essas entradas agora retornam validação 422 antes de criar/alterar conta, inclusive para caracteres multibyte. A autenticação de senhas existentes foi preservada.

A redefinição também normaliza o e-mail e limita seu tamanho como cadastro/login.

## Verificações sem exposição encontrada

- Separação usuário/admin e propriedade de compras/mídias pelo backend; dados de papel/preço/status não aceitos do cliente como autorização.
- CSRF nas mutações da sessão. Webhook exige HMAC e consulta ao Mercado Pago; valor, moeda, coletor e referência verificados. Retorno do navegador não aprova pedidos.
- Uploads privados, cotas, normalização de imagens, análise de áudio/vídeo e quarentena para upload direto. Compartilhamento exige presente finalizado/pago; URLs de download assinadas expiram.
- Escape/DOM seguro nos caminhos de dados personalizados dos temas e verificação de origem/remetente no postMessage. HTML/JS inline continuam bloqueados por CSP.
- Produção: /.env, /.git/HEAD e /server/data/users.json retornaram 404; APIs de compras/admin sem sessão retornaram 401. HTTPS/HSTS e nosniff presentes; APIs com no-store.
- Supabase: schema app_private sem USAGE para anon/authenticated; nenhuma tabela da aplicação em public; bucket gift-media privado, limite de 50.000.000 bytes. Role projetona_app sem superusuário, criação de banco/role ou BYPASSRLS. Advisor de segurança sem WARN/ERROR; dois INFO sobre RLS sem policy em tabelas privadas de pagamentos são intencionais, acessadas pelo backend.
- composer audit e npm audit: sem vulnerabilidades conhecidas reportadas na data da execução.

## Evidência e limites

Validação local concluída: 67 testes PHP / 912 assertions em SQLite e novamente em PostgreSQL, incluindo 11 regressões desta revisão; 15 testes do front-end; build Vite; integração HTTP com CSRF real, cookies, upload, compartilhamento/Range e pagamento simulado; Pint e composer validate --strict. As auditorias npm/Composer foram consultadas sem avisos de vulnerabilidade conhecidos. As suítes PHP devem rodar em sequência porque os testes de mídia usam a mesma pasta temporária, mesmo com bancos distintos.

Testes de regressão reproduzem o contorno do limite por IP, a origem do link e a ausência da diretiva CSP; validam também rollback quando a remoção do token falha, revogação de sessões, token de uso único, conta desativada e limites de exclusão/recuperação. A suíte existente cobre separação de contas, mídia, CSRF real e pagamentos simulados/verificados com mocks.

Esta é uma revisão de código, configuração e testes direcionados, não um pentest independente nem garantia de ausência de falhas. Não houve teste de carga, exploração destrutiva, pagamento real ou auditoria interna dos provedores. Configuração de SMTP e política operacional de backups/retenção dependem do operador. Credenciais e dados pessoais não integram este relatório.
