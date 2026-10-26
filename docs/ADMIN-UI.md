# Interface administrativa KoaLove

O login e o painel usam o visual dourado dos modelos fornecidos, integrado aos contratos Laravel existentes. CSS e JavaScript ficam em arquivos separados, registrados em `resources/assets.json`.

- `admin-login-premium.css` e `admin/login.js`: layout dividido, formulário responsivo, visibilidade de senha e recuperação por `/api/auth/forgot-password`. O envio de e-mail depende do mailer configurado; erros do servidor são exibidos, sem simular sucesso.
- `admin-premium.css`: aparência compartilhada do menu, cabeçalho e cartões. Clientes, planos, reembolsos e atendimento mantêm suas páginas e operações.
- `admin/header.js`: nome obtido de `/api/auth/me`, após confirmar `role=admin`, inserido como texto; avatar com o símbolo sobre rosé. O logout só redireciona após confirmação do servidor.
- `admin/dashboard.js`: métricas e últimas transações reais, carregamento independente de Pix e resumo, atualização manual e conferência individual de Pix com identificação bancária. Nenhuma aprovação automática ou em lote foi incorporada dos exemplos.
- `koalove-logo-admin.svg`: variante da logo sobre vinho fornecida, com apenas o retângulo de fundo removido para integração com o painel. Os arquivos originais foram preservados.

O modelo de demonstração não foi incorporado como banco local: não há usuários, senhas, receitas ou configurações administrativas fictícias no código de produção. Autorização, preços e pagamentos continuam sob controle do backend existente. Nenhuma migração ou variável de ambiente nova é necessária.
