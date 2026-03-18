Vou mostrar **um exemplo real completo** usando sua stack típica.
- React
- .NET API
- SaaS web
A estrutura segue o modelo consolidado:
- memory
- tasks
- AI layer
- código
---
# Estrutura do repositório
```text
repo/
memory/
  system.md
  architecture.md
  patterns.md
  decisions.md
tasks/
  active/
  done/
.ai/
  prompts/
src/
  frontend/
  backend/
tests/
docs/
```
---
# memory/system.md
Define **o que é o sistema**.
```text
System
Financial management SaaS.
Core modules
auth
transactions
categories
reports
budgets
Primary flows
user login
create transaction
categorize transaction
generate financial report
Users
individual users managing personal finances
```
---
# memory/architecture.md
Define **como o sistema é construído**.
```text
Frontend
React
TypeScript
Backend
.NET 8 Web API
Database
PostgreSQL
Architecture pattern
service layer
repository pattern
Structure
backend
controllers
services
repositories
frontend
pages
components
hooks
```
---
# memory/patterns.md
Regras de engenharia.
```text
Controllers must remain thin.
Business logic lives in services.
Repositories handle persistence.
React components should not contain business logic.
Business logic for UI lives in hooks.
Prefer small and safe changes.
```
---
# memory/decisions.md
Histórico técnico.
```text
2026-03
Adopt hook-based ViewModel pattern for UI logic.
Reason
Improves testability of UI behavior.
---
2026-02
Use Vitest for frontend tests.
Reason
Fast execution in CI.
```
---
# tasks/active/fix-summary.md
Exemplo de tarefa.
```text
Title
Fix incorrect transaction summary totals
Context
Totals are incorrect when filters are applied in the report page.
Goal
Ensure summary reflects filtered transactions.
Constraints
Do not modify public API contracts.
Steps
1 analyze aggregation logic in transaction service
2 adjust filtering behavior
3 add regression tests
Success
Totals match filtered dataset.
```
---
# .ai/prompts/plan-task.md
Prompt reutilizável.
```text
Read project memory.
memory/system.md
memory/architecture.md
memory/patterns.md
Read task.
Then perform the following steps.
1 explain how the current implementation works
2 identify the module responsible
3 propose minimal implementation plan
4 list potential regressions
5 propose tests
```
---
# src/backend
Estrutura típica.
```text
src/backend/
controllers/
services/
repositories/
models/
```
---
# src/frontend
Estrutura típica.
```text
src/frontend/
pages/
components/
hooks/
services/
```
---
# Loop de desenvolvimento
Fluxo real.
1 criar task
```text
tasks/active/fix-summary.md
```
2 pedir análise para IA
3 gerar plano
4 implementar código
5 rodar testes
6 mover task para done
```text
tasks/done/
```
---
# Benefício real
A IA sempre recebe três coisas.
contexto
```text
memory/
```
tarefa
```text
tasks/
```
código
```text
src/
```
Isso melhora muito a qualidade das respostas.
---
# Estrutura final recomendada
```text
repo/
memory/
tasks/
.ai/
src/
tests/
docs/
```
Esse modelo é **simples, escalável e funciona muito bem com IA**.
---
Se quiser, posso te mostrar algo ainda mais interessante para o seu caso:
uma **evolução desse modelo usada por alguns engenheiros solo**, que transforma essa estrutura em um **verdadeiro sistema operacional de engenharia pessoal**, com automações que fazem a IA navegar automaticamente pelo projeto.