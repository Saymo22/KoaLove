# Migração da prova de conceito

O runtime Node foi substituído por Laravel. O histórico Git conserva a implementação anterior; suas regressões relevantes foram convertidas para tests/Feature e tests/Frontend. Os dados reais ignorados em server/data NÃO são apagados, semeados nem importados automaticamente. O banco PostgreSQL local criado para a migração é independente.

## Importar uma cópia

1. Pare gravações no sistema antigo e faça backup privado dos JSON e media/. Mantenha os originais fora de public/ e fora do Git.
2. Crie e migre um banco vazio. Configure .env e FFPROBE_PATH; teste restauração do backup.
3. Execute php artisan legacy:import CAMINHO_DA_COPIA para pré-validar formato, referências e presença de arquivos sem gravar dados.
4. Após conferir os totais, execute php artisan legacy:import CAMINHO_DA_COPIA --commit. O comando recusa banco com contas/compras/atendimentos, usa transação, revalida e copia mídias para caminhos privados. Uma falha reverte o banco e remove cópias novas; a origem permanece intacta.
5. Confira totais, papéis, temas, presentes, links e mídias em homologação. IDs de compras são preservados; IDs internos de usuários são remapeados. Tokens válidos de 64 caracteres são preservados; compras antigas sem token recebem um novo. Compras sem mídia no servidor continuam legadas até sincronizar pelo navegador/dispositivo que possui o rascunho.
6. Senhas scrypt antigas, sessões e tokens de recuperação NÃO são importados. As contas recebem senha aleatória desconhecida e precisam usar Esqueci minha senha; configure SMTP antes de migrar usuários. Nenhum email é enviado automaticamente durante a importação. O operador deve informar a troca e verificar o acesso administrativo antes da virada.

Não execute seed antigo, não copie hashes para campos públicos e não apague o backup após a primeira checagem. Política de retenção também se aplica a cópias antigas. Não houve deploy nem alteração de provedor de hospedagem nesta migração.
