# Open Finance Module

Backend NestJS para integração Open Finance Brasil via Belvo (provider port-agnóstica).

## Responsabilidades

- Conectar contas bancárias / cartões via Belvo Connect Widget (OFB regulado).
- Sincronizar transactions e bills do provider, com dedup por `externalId`.
- Reconciliar `ImportedTransaction` contra `Transaction` existentes (heurística feature-flagged).
- Job queue persistente (`OpenFinanceSyncJob`) com retry exponencial.
- Webhook stub (`POST /webhooks/belvo`) com HMAC SHA-256 timing-safe.

Frontend é tarefa separada (`TK-209b`).

## Camadas (DDD)

```
open-finance/
├── domain/                    # TS puro — entities, VOs, rules
├── application/
│   ├── ports/                 # interfaces (provider + 3 repos)
│   ├── use-cases/             # 5 use cases
│   ├── jobs/sync-job.runner   # OnModuleInit + setTimeout (sem @nestjs/schedule)
│   └── open-finance.service   # facade exposto ao controller
├── infrastructure/
│   ├── providers/             # belvo-http.client + belvo-provider.adapter
│   └── repositories/          # 3 prisma repos
├── open-finance.controller         # 7 endpoints REST (envelope { data, error })
├── open-finance.webhook.controller # POST /webhooks/belvo
├── open-finance.dto                # Zod schemas
└── open-finance.module             # DI + disabled-provider fallback
```

Regra de dependência: `controller → service → use-case → port`. Domain pure (sem NestJS, Prisma, axios). Adapter Belvo é o único arquivo que muda se o shape Belvo divergir.

## Endpoints

| Method | Path | Auth |
|---|---|---|
| POST | `/api/open-finance/widget-token` | JWT |
| POST | `/api/open-finance/connections` | JWT |
| GET | `/api/open-finance/connections` | JWT |
| POST | `/api/open-finance/connections/:id/sync` | JWT |
| DELETE | `/api/open-finance/connections/:id` | JWT |
| GET | `/api/open-finance/connections/:id/imported-transactions` | JWT |
| PATCH | `/api/open-finance/imported-transactions/:id` | JWT |
| POST | `/api/open-finance/webhooks/belvo` | HMAC SHA-256 |

Todas com envelope `{ data, error }` (exceto webhook, que retorna `{ received: true }` conforme spec Belvo).

## Modelo de Dados

- `BankConnection` — `providerLinkId` **encrypted at rest** (AES-256-GCM via `core/lib/server/security/encryption.ts`).
- `ImportedTransaction` — unique `(bankConnectionId, externalId)`. FK opcional `matchedTransactionId → Transaction.id`.
- `OpenFinanceSyncJob` — state machine `PENDING → RUNNING → DONE | PENDING (retry) | FAILED`.
- `WebhookEvent` — raw payload para audit/replay.

`Transaction.importedFromOpenFinance` (default `false`) marca rows criadas via reconcile.

## Job Runner

`SyncJobRunner` usa `OnModuleInit` + `setTimeout` recursivo (sem dependência em `@nestjs/schedule`). Claim via `SELECT FOR UPDATE SKIP LOCKED` (1 worker pega N jobs por tick). Backoff: `30s × 2^attempts`, máx 5 attempts → `FAILED`.

Variáveis:
- `MMX_OPEN_FINANCE_RUNNER_ENABLED` (`true` default; `false` desliga em testes)
- `MMX_OPEN_FINANCE_TICK_MS` (default `30000`)
- `MMX_OPEN_FINANCE_BATCH_SIZE` (default `10`)

## Provider Disabled Fallback

Se `BELVO_SECRET_ID` ou `BELVO_SECRET_PASSWORD` ausentes, o módulo registra um `disabledProvider` que joga `Error("Open Finance indisponível: …")` em qualquer operação. App sobe sem crash; endpoints retornam 500 explicitando a causa.

## Webhook Signature

`verifyHmacSha256(rawBody, signatureHex, secret)` em `core/lib/server/security/webhook-signature.ts`. Usa `timingSafeEqual` para evitar timing attacks. Em produção, configurar `NestFactory.create({ rawBody: true })` — atualmente verificamos `JSON.stringify(body)` (stub).

## Webhook Event Dispatcher

`HandleWebhookEventUseCase` roteia eventos Belvo após HMAC validado:

| `event_type` | Ação |
|---|---|
| `consent_expired`, `link.expired` | `BankConnection.status = EXPIRED`, `lastError = "consent_expired"` |
| `link.invalid` | `BankConnection.status = ERROR`, `lastError = "link_invalid"` |
| `token_required` | `BankConnection.status = EXPIRED`, `lastError = "token_required"` |
| `transactions.new`, `transactions.historical_update` | enfileira `SyncJob(PENDING)` |
| outros | só persiste em `WebhookEvent` |

Lookup de `BankConnection` por `linkId` plaintext: `findByPlainProviderLinkId` faz scan + decrypt iterativo (volume baixo). Follow-up: coluna `providerLinkIdHash` com índice.

## Webhook IP Allowlist

`BelvoIpAllowlistGuard` (em `common/guards/`) opcional, via env `BELVO_WEBHOOK_IPS` (CSV). Vazio = aceita qualquer IP. Em produção, preencher com IPs Belvo (obtidos na cert call). Respeita `X-Forwarded-For` e `X-Real-IP`.

## Belvo `request_id` logging

`BelvoHttpError` carrega `requestId` extraído do header `x-request-id` (preferencial) ou body `request_id`. Mensagem do error inclui `request_id=...` pra correlação rápida com support tickets Belvo.

## Variáveis de Ambiente

| Var | Obrigatória | Função |
|---|---|---|
| `MMX_ENCRYPTION_KEY` | sim (prod) | base64 32 bytes — AES-256-GCM key |
| `BELVO_SECRET_ID` | opcional | credencial Belvo (sem ela: provider disabled) |
| `BELVO_SECRET_PASSWORD` | opcional | idem |
| `BELVO_ENV` | não | `sandbox` (default) ou `production` |
| `BELVO_WEBHOOK_SECRET` | recomendado | HMAC secret — sem ele, webhook recusa tudo |
| `BELVO_WEBHOOK_IPS` | recomendado (prod) | CSV de IPs Belvo. Vazio = aceita qualquer |
| `MMX_OPEN_FINANCE_AUTO_RECONCILE` | não | `false` default — reconcile só quando explícito |
| `MMX_OPEN_FINANCE_RUNNER_ENABLED` | não | `true` default |

Validação centralizada em [scripts/validate-env.mjs](../../../../../scripts/validate-env.mjs).

## Fluxo Connect Happy Path

1. Frontend → `POST /widget-token` → recebe `accessToken`.
2. Frontend abre Belvo Connect Widget (URL regulada OFB) → user consente.
3. Callback retorna `linkId` ao frontend.
4. Frontend → `POST /connections` com `linkId` + `institutionCode/Name`.
5. `RegisterConnectionUseCase` valida via `provider.fetchLink`, encripta `linkId`, persiste `BankConnection(status=syncing)`, enfileira `SyncJob(PENDING)`.
6. `SyncJobRunner` (tick 30s) claim job → `SyncTransactionsUseCase` busca accounts/transactions/bills → grava `ImportedTransaction` (dedup por `externalId`) → opcionalmente reconcilia.
7. Sucesso: `BankConnection.status=active`, `lastSyncedAt=now()`. Falha 5x: `SyncJob.status=FAILED`.

## Tests

- Domain rules + state machines: `domain/*.test.ts`
- Use cases (port mocks): `application/use-cases/*.test.ts`
- Job runner (in-memory repo): `application/jobs/sync-job.runner.test.ts`
- Belvo adapter (fixtures): `infrastructure/providers/belvo-provider.adapter.test.ts`
- Webhook signature: `core/lib/server/security/webhook-signature.test.ts`
- DTO validation: `open-finance.dto.test.ts`

Rodar: `pnpm --filter @mmx/api test`.

## Referências

- Spec: [.aiws/tasks/.../tk-209a-open-finance-backend/3-spec.md](../../../../../.aiws/tasks/done/tk-209a-open-finance-backend/3-spec.md)
- Encryption decision: [.aiws/knowledge/dec-2026-04-25-encryption-at-rest.md](../../../../../.aiws/knowledge/dec-2026-04-25-encryption-at-rest.md)
- Belvo docs: https://developers.belvo.com/
- Open Finance Brasil: https://openfinancebrasil.org.br/
