# PAT: Checklist de Migração de Domínio (mmx-web-react → packages/api)

## Concept
Checklist operacional para validar que um domínio foi corretamente migrado do first-party API (packages/web/app/api/) para o backend dedicado (packages/api — NestJS + DDD).

## When to Use
Sempre que ativar um novo domínio no backend externo via `NEXT_PUBLIC_API_MIGRATION_DOMAINS`.

## How to Apply

### 1) Contrato
- Endpoint em packages/api replica path e método HTTP do legado
- Envelope de resposta mantido: `{ data, error }`
- Campos e tipos de payload mantidos
- Status codes mantidos (ou documentados com plano de compatibilidade)

### 2) Segurança e sessão
- CORS permite origem do frontend
- Requests cross-origin com `credentials: "include"` funcionando quando aplicável
- Cookies/auth headers validados no fluxo real
- Erros de auth padronizados (`AUTH_REQUIRED` ou equivalente)

### 3) Frontend
- Domínio incluído em `NEXT_PUBLIC_API_MIGRATION_DOMAINS`
- `packages/web/lib/client/api.ts` é a única fronteira de roteamento
- Hooks/componentes não alterados para conhecer o backend específico
- Rollback simples: remover domínio da lista de migração

### 4) Testes
- Testes de contrato em packages/api para endpoints do domínio
- Testes de integração do frontend cobrindo domínio migrado
- Validação de erros de rede/envelope no adaptador

### 5) Observabilidade
- Loga claramente origem do backend em ambiente de validação (first-party vs packages/api)
- Monitora taxa de erro após ativar domínio migrado
- Mantém janela de rollback definida

### 6) Go/No-Go
- **Go**: contrato validado, testes verdes e monitoramento estável
- **No-Go**: divergência de payload, falha de auth/cookies, regressão em fluxo crítico

## Notes
Padrão extraído de `.dev-workspace/product/1-definitions/mmx-api-domain-migration-checklist.md`. Relacionado ao padrão `pat-frontend-data-boundary.md` — a fronteira packages/web/lib/client/api.ts é o ponto central de roteamento por domínio.
