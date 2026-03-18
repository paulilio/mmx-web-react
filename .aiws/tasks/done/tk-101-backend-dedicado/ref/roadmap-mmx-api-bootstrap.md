# Roadmap Tecnico - Bootstrap do mmx-api

Data de referencia: 2026-03-13
Escopo: preparar backend dedicado (`mmx-api`) e migrar dominio piloto sem quebrar o frontend atual.

## Objetivo
Subir o `mmx-api` com contrato baseline compativel com o frontend atual, executar piloto em `reports` e habilitar rollout incremental para os demais dominios.

## Principios de execucao
1. Nao quebrar contrato atual do frontend (`{ data, error }`).
2. Migracao por dominio (sem big-bang).
3. `lib/client/api.ts` permanece unica fronteira de consumo HTTP no frontend.
4. Compatibilidade progressiva: fallback por dominio durante rollout controlado.

## Escopo do piloto
Dominio piloto: `reports`
- `GET /reports/summary`
- `GET /reports/aging`
- `GET /reports/cashflow`

Motivo:
- Alto valor para validar contrato e latencia.
- Baixo risco de mutacao de dados (rotas majoritariamente de leitura).

---

## Fase 0 - Bootstrap do repositorio mmx-api

## Entregas
1. Estrutura inicial do projeto backend (Node + TypeScript + framework HTTP).
2. Camadas minimas:
   - `src/http` (controllers/routes)
   - `src/services`
   - `src/domain`
   - `src/repositories`
   - `src/security`
3. Prisma conectado ao mesmo PostgreSQL (ambiente de desenvolvimento).
4. Health endpoint (`GET /health`).

## Definition of Done
- `mmx-api` sobe local em `:4000`.
- `GET /health` responde `200`.
- Lint, type-check e testes base passando no backend.

---

## Fase 1 - Contrato baseline e seguranca minima

## Entregas
1. Envelope padrao em todas as respostas:
   - sucesso: `{ data, error: null }`
   - falha: `{ data: null, error }`
2. CORS configurado para origem do frontend.
3. Auth inicial compativel com fluxo atual (cookies e/ou bearer conforme contrato vigente).
4. Middleware de erro padronizado.

## Checklist de compatibilidade (obrigatorio)
1. Mantem `credentials: "include"` para chamadas cross-origin.
2. Nao altera nomes de campos dos DTOs atuais.
3. Nao altera semantica de status code sem plano de migracao.

## Definition of Done
- Contrato validado por testes de integracao no backend.
- Frontend consegue consumir endpoint dummy com envelope sem ajuste de UI.

---

## Fase 2 - Piloto Reports no mmx-api

## Entregas no backend (`mmx-api`)
1. Implementar endpoints:
   - `GET /reports/summary`
   - `GET /reports/aging`
   - `GET /reports/cashflow`
2. Preservar filtros atuais:
   - `aging`: `dateFrom`, `dateTo`
   - `cashflow`: `days`, `status`
3. Preservar shape dos payloads de resposta atuais.
4. Testes de integracao do dominio reports no backend.

## Entregas no frontend (`mmx-web-react`)
1. Ajustar `lib/client/api.ts` para rotear `reports/*` ao `mmx-api` via `NEXT_PUBLIC_API_BASE` (feature-flag por dominio).
2. Manter fallback para primeira parte somente enquanto rollout estiver ativo.
3. Adicionar telemetria/log para saber qual backend respondeu (first-party vs mmx-api) em dev.

## Definition of Done
- `reports` funcionando pelo `mmx-api` com frontend inalterado na camada de hooks/componentes.
- Testes de reports no frontend e no backend verdes.

---

## Fase 3 - Rollout controlado por dominio

## Matriz de migracao sugerida
1. `reports` (piloto)
2. `categories` + `category-groups`
3. `contacts`
4. `areas`
5. `transactions`
6. `budget` + `budget-allocations`
7. `settings`
8. `auth`

## Regras de rollout
1. Migrar um dominio por vez.
2. Garantir testes de contrato antes de virar rota principal.
3. Manter janela de rollback por dominio (toggle de roteamento no adaptador).

## Definition of Done
- Dominio migrado sem regressao funcional e com rollback disponivel.

---

## Fase 4 - Docker integrado frontend + backend + postgres

## Entregas
1. Compose dev com servicos:
   - `frontend` (3000)
   - `backend` (4000)
   - `postgres` (5432)
2. Env files separados por servico.
3. Healthchecks para frontend/backend.
4. Script de subida unico para stack completa em dev.

## Definition of Done
- Stack completa sobe com um comando.
- Frontend consome backend dedicado por padrao em dev.

---

## Riscos e mitigacoes
1. Divergencia de contrato entre `app/api/**` e `mmx-api`.
   - Mitigacao: testes de contrato por endpoint + snapshots de payload.
2. Regressao de auth cross-origin.
   - Mitigacao: validar `credentials: "include"`, cookies e CORS em ambiente dev integrado.
3. Aumento de complexidade operacional precoce.
   - Mitigacao: rollout por dominio com toggle no adaptador.

## Indicadores de sucesso
1. Dominio piloto (`reports`) operando em `mmx-api` sem mudanca de UI.
2. Zero quebra de contrato no frontend.
3. Tempo de resposta de reports igual ou melhor que primeira parte.
4. Stack dev integrada (`frontend+backend+postgres`) estavel.

## Backlog de execucao imediata (proxima sprint)
1. Criar repositorio `mmx-api` com Fase 0.
2. Implementar Fase 1 no backend.
3. Implementar Fase 2 (piloto reports).
4. Integrar toggle de roteamento no `lib/client/api.ts` para reports.