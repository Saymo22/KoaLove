-- Aplicar no projeto Supabase novo ANTES das migrations Laravel.
-- Não altera os schemas auth/storage/public nem cria usuários de aplicação.
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'projetona_app') THEN
        CREATE ROLE projetona_app LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION;
    END IF;
END $$;

CREATE SCHEMA IF NOT EXISTS app_private;
REVOKE ALL ON SCHEMA app_private FROM PUBLIC, anon, authenticated, service_role;
GRANT USAGE, CREATE ON SCHEMA app_private TO projetona_app;
ALTER ROLE projetona_app SET search_path = app_private;

-- Protege tabelas futuras mesmo se o schema for exposto por engano no painel.
ALTER DEFAULT PRIVILEGES IN SCHEMA app_private
    REVOKE ALL ON TABLES FROM PUBLIC, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA app_private
    REVOKE ALL ON SEQUENCES FROM PUBLIC, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA app_private
    REVOKE ALL ON FUNCTIONS FROM PUBLIC, anon, authenticated, service_role;

-- Sem senha padrão. Configure uma senha aleatória para projetona_app por canal
-- administrativo seguro e guarde somente na variável DB_URL da Vercel.
-- Não adicione app_private aos schemas expostos pela Data API.
