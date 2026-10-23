# Verificação da migração — 23/10/2026

- PHP 8.5.12, Laravel 13.38.0 e PostgreSQL 18.6 portáteis preparados nesta máquina; banco de uso novo e banco projeto_na_test separados.
- Migrations aplicadas no PostgreSQL local. Rotas .html preservadas como Blade; 30 páginas e 13 temas compilados pelo Vite.
- PHPUnit: 15 testes e 163 verificações, passando em SQLite em memória e PostgreSQL. Inclui autenticação, limites, autorização, todos os temas, idempotência, mídia inválida, Range, recuperação de senha, reembolso transacional, exportação/exclusão/retenção e importação com rollback.
- Frontend: seis testes passando para runtime, referências estáveis, oito etapas, retomada, upload/CSRF e ausência de código inline nas views e handlers HTML nos scripts.
- Integração HTTP real em banco de testes: CSRF sem token recusado, cookies, cadastro, quatro criações simultâneas com uma única compra, upload PNG, atualização, pagamento simulado, projeção compartilhada sem dados internos, acesso privado recusado e download Range correto.
- Pint, composer validate --strict, composer audit e npm audit passaram; nenhuma vulnerabilidade conhecida retornada pelas auditorias na data.
- Navegador: home, criador Netflix (escolha/capa/fotos e prévia) e os 13 temas acessíveis pelo Laravel. Nenhum erro JavaScript observado nos temas. A janela disponível tinha 614px de largura e não apresentou transbordamento horizontal nos temas. Não foi realizado teste em aparelho físico nem medição de SEO/performance.
- SHA-256 dos seis JSON legados conferido após a migração: nenhum conteúdo alterado. Os arquivos originais permanecem privados e ignorados em server/data. Não houve importação de dados reais.

## Limites e liberação

A CI foi configurada em .github/workflows/ci.yml. A publicação da branch/PR e a confirmação de CI remoto dependem da autenticação GitHub nesta máquina; não foi feito merge sem CI verde. SMTP, identificação/contato do controlador, scheduler, HTTPS, armazenamento persistente e gateway de pagamento real precisam da configuração do ambiente antes de produção. O pagamento continua simulado e é bloqueado em produção. Não houve deploy.
