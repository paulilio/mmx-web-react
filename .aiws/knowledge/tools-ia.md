# Tools IA

Registro de ferramentas, plugins e extensões relacionadas a IA utilizadas ou avaliadas no projeto.

Categorias: `plugin` `extension` `mcp` `cli` `agent`
Status: `em avaliação` `adotado` `descartado`

---

## Superpower

| Campo | Valor |
|---|---|
| Status | descartado |
| Útil para | Claude Code |
| Categoria | plugin |
| Custo | freemium |
| Avaliado em | 2026-03-22 |

**Notas:** Foco em planejamento antes de codar. Funcionalidade já coberta pelo Plan Mode nativo do Claude Code. Não agrega ao fluxo atual.

---

## Frontend Design (Anthropic)

| Campo | Valor |
|---|---|
| Status | em avaliação |
| Útil para | Claude Code |
| Categoria | plugin |
| Custo | free |
| Avaliado em | 2026-03-22 |

**Notas:** Criado pela Anthropic. Visa reduzir outputs genéricos de UI gerada por IA. Potencialmente útil quando o frontend do MMX ganhar foco. Reavaliar ao iniciar trabalho pesado em componentes Next.js.

---

## Code Review (5 agents)

| Campo | Valor |
|---|---|
| Status | em avaliação |
| Útil para | Claude Code |
| Categoria | agent |
| Custo | freemium |
| Avaliado em | 2026-03-22 |

**Notas:** Revisão de código com 5 agentes em paralelo. Pode ser redundante com o uso atual do Agent tool + skill `simplify`. Investigar se agrega cobertura adicional antes de adotar.

---

## Security Guidance

| Campo | Valor |
|---|---|
| Status | em avaliação |
| Útil para | Claude Code |
| Categoria | plugin |
| Custo | freemium |
| Avaliado em | 2026-03-22 |

**Notas:** Identifica vulnerabilidades proativamente. Relevante para o MMX dado o domínio financeiro (auth, JWT, dados de transações). Prioridade de avaliação alta.

---

## Claude Mem

| Campo | Valor |
|---|---|
| Status | descartado |
| Útil para | Claude Code |
| Categoria | plugin |
| Custo | free |
| Avaliado em | 2026-03-22 |

**Notas:** Persistência de contexto entre sessões. Funcionalidade já coberta pelo sistema de memory files nativo em `.claude/projects/`. Desnecessário.

---

## Gstack

| Campo | Valor |
|---|---|
| Status | em avaliação |
| Útil para | Claude Code |
| Categoria | plugin |
| Custo | freemium |
| Avaliado em | 2026-03-22 |

**Notas:** Suite com 6 skills em um, criado pelo CEO da YC. Pouca informação disponível para avaliação. Investigar quais são as 6 skills e se há sobreposição com ferramentas já adotadas.
