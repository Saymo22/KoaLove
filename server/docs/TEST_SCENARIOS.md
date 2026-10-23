> Atualização da primeira revisão: consulte [PURCHASES.md](PURCHASES.md) para o contrato vigente de salvamento, mídias, compartilhamento e exclusão. Os exemplos antigos de IndexedDB exclusivo foram substituídos.

# Cenários de teste — verificação manual

## 1. Login e cadastro

### 1.1. Cadastro feliz
```bash
curl -i -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Ana","email":"ana@test.com","password":"senha123"}'
```
Esperado: `201` + cookie `nossoamor_sid` + `{ ok: true }`.

### 1.2. Senha curta → 400 WEAK_PASSWORD
```bash
curl -i -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Ana","email":"a@b.com","password":"123"}'
```

### 1.3. E-mail duplicado → 409 EMAIL_TAKEN (mensagem neutra)
Repita o 1.1. Esperado: `409`, `error.code = "EMAIL_TAKEN"` e mensagem **que não confirma** se o email existe ("Não foi possível criar a conta…").

### 1.4. Login inválido → 401 INVALID_CREDENTIALS
```bash
curl -i -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"naoexiste@x.com","password":"errada"}'
```
Esperado: `401` com **a mesma mensagem** que senha errada em conta existente. Nada de "conta não encontrada".

### 1.5. Rate limit do login (5/min)
Envie 6 logins errados em < 1 min:
```bash
for i in $(seq 1 6); do
  curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" -d '{"email":"x@x.com","password":"errada"}'
done
```
Esperado: `401 401 401 401 401 429` — o 429 terá `Retry-After: <N>`.

**Frontend:** ao receber 429, `js/api/client.js` salva `rate_lock:POST /auth/login = now+N*1000`. Um novo clique em <N segundos → `ApiError{ code: "CLIENT_RATE_LIMITED" }` sem rede.

---

## 2. Admin — dados reais

Pré-requisito: rodar `node seed.js` e logar como `admin@nossoamor.com` / `admin123`.

### 2.1. Summary
```bash
# Após login, guardar cookie
curl -c cookies.txt -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@nossoamor.com","password":"admin123"}'

curl -b cookies.txt http://localhost:3000/api/admin/summary
```
Esperado: `receita_cents: 3781`, `compras: 2`, `recentes` com os 2 pedidos pagos (João e Marina).

### 2.2. Clientes (dados associativos)
```bash
curl -b cookies.txt http://localhost:3000/api/admin/clients
curl -b cookies.txt http://localhost:3000/api/admin/clients/<id_marina>
```
Esperado no detalhe: `{ client, purchases: [...], tickets: [...], refunds: [...] }` — **todos os campos presentes** mesmo que vazios (`[]`).

### 2.3. Sem admin → 401 NOT_ADMIN
Faça login como Marina (`marina@exemplo.com` / `senha123`) e tente `GET /api/admin/summary`:
```bash
curl -c c2.txt -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"marina@exemplo.com","password":"senha123"}'

curl -b c2.txt -i http://localhost:3000/api/admin/summary
```
Esperado: `401`, `error.code = "NOT_ADMIN"`.

### 2.4. Decisão de reembolso
```bash
# Pega o id do reembolso pendente
curl -b cookies.txt http://localhost:3000/api/admin/refunds
# POST decisão
curl -b cookies.txt -X POST http://localhost:3000/api/admin/refunds/<id>/decision \
  -H "Content-Type: application/json" -d '{"status":"approved"}'
```
Esperado: `200`, e a compra associada passa a `status: "refunded"`. Se repetir → `409 ALREADY_DECIDED`.

---

## 3. Compras (fluxo do usuário)

### 3.1. Criar compra
```bash
curl -c c3.txt -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"marina@exemplo.com","password":"senha123"}'

curl -b c3.txt -i -X POST http://localhost:3000/api/purchases \
  -H "Content-Type: application/json" \
  -d '{"tema":"namoro","titulo":"Nós dois","para":"Rafael","de":"Marina","inicio":"2022-08-13","carta":"Te amo.","has_media":true}'
```
Esperado: `201` com `status: "pending"`.

### 3.2. Pagar com cupom
```bash
curl -b c3.txt -X POST http://localhost:3000/api/purchases/<id>/pay \
  -H "Content-Type: application/json" \
  -d '{"metodo":"pix","cupom":"AMOR10"}'
```
Esperado: `200`, `status: "paid"`, `amount_paid_cents: 1791`. Repetir → `409 ALREADY_PAID`. Cupom inexistente → `400 INVALID_COUPON`.

---

## 4. OWASP — verificação rápida

### 4.1. Account enumeration
Comparar resposta de:
- `{ email: "naoexiste@x", password: "errada" }`
- `{ email: "marina@exemplo.com", password: "errada" }`

**Ambos**: `401`, `INVALID_CREDENTIALS`, mensagem "E-mail ou senha incorretos.".

### 4.2. Timing leak
Ambos requests acima devem ter latência similar (delay artificial de 250ms é aplicado em falha).

### 4.3. Cookie HttpOnly
Abrir DevTools → Application → Cookies. `nossoamor_sid` deve ter ✅ HttpOnly, ✅ SameSite=Strict.

### 4.4. Headers de segurança
```bash
curl -I http://localhost:3000/home.html
```
Verificar presença de: `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Content-Security-Policy`, `Referrer-Policy: no-referrer`, `Permissions-Policy`.

### 4.5. Path traversal
```bash
curl -i "http://localhost:3000/../server/config.js"
curl -i "http://localhost:3000/server/config.js"
```
Esperado: `403` ou `404`.

### 4.6. Body grande (DoS)
```bash
python3 -c "print('{\"a\":\"' + 'x'*3000000 + '\"}')" > /tmp/big.json
curl -i -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" --data @/tmp/big.json
```
Esperado: `413 PAYLOAD_TOO_LARGE`.

### 4.7. JSON inválido
```bash
curl -i -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" -d '{not json'
```
Esperado: `400 INVALID_JSON`.
