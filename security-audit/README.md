# Auditoria de segurança — ambiente de testes KoaLove

**Alvo:** https://projetona.vercel.app (Vercel + Supabase Storage + Laravel 13 / PHP 8.5.12)
**Autorização:** o proprietário do projeto solicitou explicitamente testes reais no ambiente de testes (não produção de clientes).
**Data:** 26/10/2026
**Escopo:** API pública, autenticação, recuperação de senha, controle de acesso, uploads, links compartilhados, painel admin (somente verificação de autorização), webhook de pagamento, cabeçalhos/infra e auditoria estática do commit em produção.

## Código em produção

- Commit: `2b64769` — branch `origin/codex/account-and-gift-ui-fixes`
- Worktree de leitura: `/tmp/deploy-audit` (NÃO editar)
- `main` local está desatualizado; não serve como fonte de verdade do deploy.

## Contas de teste

Ver `/tmp/live/accounts.md`. Nenhuma conta é admin. Cadastro aberto (`/api/auth/register`).

## Helper

```bash
source /tmp/live/lib.sh
login /tmp/live/jars/u1.txt 'qa.lead.1793025465@example.com' '<senha-da-conta-de-teste>'
get_api /tmp/live/jars/u1.txt /api/auth/me
post_json /tmp/live/jars/u1.txt /api/purchases '{...}'
```

DNS local está quebrado para `*.vercel.app`; o helper usa `dig @1.1.1.1` + `curl --resolve`. Nunca use DNS normal.

## Limites / regras

- Throttle: login 5/min por IP **e** por conta; register 3/min; recovery 3/min; api 240/min; write 90/min; create 10/min. O IP é compartilhado pelo time: evite rajadas, reutilize os jars de sessão, espere 61 s após 429 e **não** retente 429 em loop.
- Proibido: DoS/volume, wordlists de senha, apagar contas de terceiros, pagamentos reais, cadastro em massa, sair do host `projetona.vercel.app` / `*.supabase.co` do projeto.
- Evidência real obrigatória: request + status + trecho de resposta + timestamp. O que não reproduziu entra como "não reproduzido", nunca como achado.
- Não alterar código da aplicação. Cada um escreve somente o seu arquivo em `security-audit/`.
- Ao terminar, enviar ao Lead um resumo com os achados confirmados e o caminho do arquivo.
