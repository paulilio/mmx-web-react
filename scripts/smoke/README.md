# MMX Smoke Tests

Smoke tests pós-deploy contra **produção real** (Azure Container Apps + Vercel).

Não dependem de DB, de mocks, de framework — só `curl` + `bash` + `grep`. Rodam em <5s.

## Quando rodar

- ✅ Após `az deployment group create` (deploy do backend)
- ✅ Após Vercel terminar de buildar o frontend
- ✅ Antes de declarar "deploy ok"
- ✅ Pode rodar a qualquer momento para checar saúde de produção

## Como rodar

```bash
bash scripts/smoke/smoke.sh
```

Ou contra outro ambiente:

```bash
API_URL=https://staging-api... WEB_URL=https://staging-web... bash scripts/smoke/smoke.sh
```

## O que valida

| Categoria | Check | Por quê |
|---|---|---|
| **API health** | `GET /health` 200 + envelope | ACA está vivo e respondendo |
| | `GET /health/ready` 200 | Container app pronto para receber tráfego |
| **API auth** | `GET /auth/me` 401 sem cookie | Auth guard ativo |
| | `POST /auth/refresh` 400 sem token | Validação de input ativa |
| | `GET /auth/oauth/google` 302 → `accounts.google.com` | Google OAuth configurado e funcional |
| | `GET /auth/oauth/microsoft` 302 → `login.microsoftonline.com` | Microsoft OAuth configurado e funcional |
| **CORS** | OPTIONS preflight com origin Vercel passa | Cross-origin permitido |
| | Origin `evil.example.com` é rejeitada (403) | Allowlist estrita |
| **Frontend** | `GET /` 200 | Vercel não quebrou |
| | `GET /auth` 200 + contém botão "Continuar com Google" | Página renderizando |
| | `GET /auth` contém botão Microsoft | Idem |
| | `GET /auth` NÃO contém form de senha | Sanity check OAuth-only |
| | `GET /auth/oauth-callback` 200 | Página de callback existe |

## Exit codes

- `0` — todos passaram
- `1` — pelo menos 1 falhou (lista as falhas no final)

## Limitações

Smoke testa **infra + endpoints públicos**, não testa fluxo OAuth completo (não dá para automatizar consent do Google sem credenciais sensíveis). Isso é coberto por:
- **E2E (Playwright)** — testa o redirect parcial e a UX
- **Manual smoke** — login real Google/Microsoft uma vez por release
