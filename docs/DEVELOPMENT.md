# Ambiente de desenvolvimento

## Requisitos

PHP >=8.5.12 e <8.6, Composer 2, Node.js 22.12+ (ou 24), npm, PostgreSQL 18 e FFprobe (FFmpeg). Extensões PHP: curl, fileinfo, mbstring, openssl, pdo_pgsql, pdo_sqlite/sqlite3 (testes rápidos), gd, zip. Configure memory_limit=512M, upload_max_filesize=100M, post_max_size=102M. GD deve suportar os formatos desejados; formato sem decodificador é rejeitado.

Windows: use os downloads oficiais de windows.php.net, getcomposer.org e postgresql.org. O ambiente desta tarefa usa ferramentas portáteis ignoradas em .tools; elas não integram o repositório nem substituem os requisitos da máquina de outro desenvolvedor.

## Instalação

1. Crie um usuário PostgreSQL sem privilégios de superusuário e os bancos projeto_na e projeto_na_test. O usuário de testes precisa criar/remover tabelas somente no banco de testes.
2. Execute composer install e npm ci.
3. Copie .env.example para .env e preencha DB_*, APP_URL e FFPROBE_PATH. Não publique .env. Execute php artisan key:generate uma única vez para um ambiente novo.
4. Execute php artisan migrate e npm run build.
5. Inicie php artisan serve --host=127.0.0.1 --port=8000. Para desenvolvimento dos assets, execute npm run dev em outro terminal.
6. Para demonstração local, defina SIMULATED_PAYMENTS=true. Esse modo é recusado em APP_ENV=production.

Nenhum usuário/admin com senha padrão é criado. Registre uma conta pela tela de login. Para promover uma conta de desenvolvimento, use php artisan tinker e atualize explicitamente seu role para admin. Não compartilhe essa conta.

## Ambiente portátil preparado nesta máquina

- PHP: .tools/php/php.exe; Composer: .tools/composer.phar.
- PostgreSQL: .tools/postgres/pgsql/bin, dados .tools/pgdata, host 127.0.0.1, porta 5441, usuário nossoamor. Senha somente em .env e .tools/pg-password.txt.
- Iniciar PostgreSQL: .tools/postgres/pgsql/bin/pg_ctl.exe -D .tools/pgdata -l .tools/postgres.log -o "-h 127.0.0.1 -p 5441" start.
- Iniciar site: .tools/php/php.exe artisan serve --host=127.0.0.1 --port=8000.
- Composer: adicione .tools/php ao PATH da sessão e execute .tools/php/php.exe .tools/composer.phar install.
- FFprobe local: .tools/bin/ffprobe.exe (caminho privado configurado em .env).

## Testes

- npm test: runtime dos temas, referências estáveis, etapas, retomada/salvamento, CSRF no cliente e assets.
- npm run build: compila todas as 30 páginas e seus assets pelo Vite.
- php vendor/bin/phpunit: suíte HTTP Laravel em SQLite :memory:.
- php vendor/bin/phpunit -c phpunit.pgsql.xml: mesma suíte no banco projeto_na_test. DB_HOST, DB_PORT, DB_USERNAME e DB_PASSWORD vêm do ambiente. Nunca apontar para o banco de uso.
- php vendor/bin/pint --test: convenções PHP Laravel.
- composer validate --strict; composer audit; npm audit.
- npm run test:http: integração HTTP real, cookies/CSRF, upload, retries simultâneos, compartilhamento e Range. Execute após migrations em banco vazio de testes, com CACHE_STORE=database, SESSION_DRIVER=database, DB_DATABASE=projeto_na_test e SIMULATED_PAYMENTS=true. O script exige HTTP_TEST_ALLOW=1 e cria somente fixtures sintéticas; a CI usa PostgreSQL descartável.

Os testes recusam bancos sem sufixo _test (exceto SQLite em memória). A CI executa as duas suítes, integração HTTP, build e formatação. Não faça merge em caso de falha. Para revisão manual: cadastro/login, oito etapas, envio de mídias, pagamento simulado, link/QR, conta e admin; verifique 390/768/1440px e os 13 temas. Testes automatizados não substituem validar um dispositivo móvel real.

## Produção

Sirva SOMENTE public/ pelo Nginx/Apache + PHP-FPM, com HTTPS. APP_ENV=production, APP_DEBUG=false, SESSION_SECURE_COOKIE=true e APP_URL definitivo. Configure SMTP MAIL_* e PRIVACY_EMAIL/controlador antes de publicar. A recuperação retorna indisponível quando o mailer ainda é log em produção. Não use artisan serve em produção.

Instale FFprobe atualizado pelo sistema. Configure limite de corpo no proxy, timeout de upload, pool FPM limitado e PostgreSQL/cache compartilhado. A decisão atual é manter mídias locais em volume persistente privado; múltiplas instâncias precisam do mesmo disco montado. Consulte [armazenamento local](MEDIA_STORAGE.md). Na hospedagem [Vercel](VERCEL.md), o upload local fica indisponível porque a função não oferece esse volume persistente.

Execute composer install --no-dev --optimize-autoloader, npm ci, npm run build, php artisan migrate --force e php artisan optimize no pipeline. Inicie php artisan schedule:run a cada minuto (cron/Task Scheduler) para privacy:prune diário; monitore falhas e espaço em disco. Faça backups criptografados com expiração máxima de 30 dias e restauração testada. Configure o servidor web para não registrar query strings dos links compartilhados.

## Organização e próximos módulos

resources/assets.json é o catálogo de entradas; cada página possui um bundle que preserva o escopo legado. O plugin classic-page-boundaries em vite.config.js concatena fontes existentes sem duplicá-las. A separação futura em ES modules/componentes Blade exige testes dos consumidores e mantém os scripts fora das views. O QR é gerado localmente pelo adapter resources/js/adapters/qr-code.js; o gateway implementa App/Contracts/PaymentGateway.
