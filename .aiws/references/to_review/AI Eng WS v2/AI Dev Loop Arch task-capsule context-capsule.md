**Context Capsules** resolvem um problema comum no desenvolvimento com IA: quando o sistema cresce, a IA precisa entender **um pedaço do sistema sem carregar o repo inteiro**.
Isso funciona muito bem com:
- Claude Code
- Cursor
- GitHub Copilot
A ideia é simples: cada **módulo importante do sistema possui um “pacote de contexto” pronto para a IA**.
---
# Estrutura de Context Capsules
Dentro de `.ai/context/`:
```text
.ai/context/
system.md
coding-rules.md
testing-rules.md
modules/
  billing.md
  auth.md
  notifications.md
  dashboard.md
```
---
# Exemplo de capsule de módulo
Arquivo:
```
.ai/context/modules/billing.md
```
Conteúdo:
```text
Module: Billing
Location
src/backend/billing/
Main Components
billingService.ts
invoiceGenerator.ts
couponCalculator.ts
Responsibilities
- invoice generation
- coupon processing
- subscription billing
Important Rules
- all calculations must be idempotent
- discounts applied before tax
- coupon stacking allowed
Key Tests
billingService.test.ts
```
---
# Como a IA usa isso
Quando você pede algo como:
```
Fix coupon calculation bug
```
A IA pode:
1. Ler `.ai/context/modules/billing.md`
2. Entender o módulo rapidamente
3. Ir direto para os arquivos relevantes
Sem precisar analisar o repo inteiro.
---
# Estrutura completa recomendada
Combina **Context Capsules + Task Capsules + AI Commands**.
```
repo/
AGENTS.md
PROJECT_MAP.md
ENTRYPOINTS.md
ARCHITECTURE.md
.ai/
  commands/
  context/
    system.md
    coding-rules.md
    testing-rules.md
    modules/
docs/
  decisions/
  guidelines/
engineering/
  backend/tasks/
  frontend/tasks/
  automation/tasks/
src/
.workspace/
```
---
# O que cada camada resolve
|Camada|Função|
|---|---|
|Project docs|entendimento geral|
|Context capsules|entendimento modular|
|Task capsules|execução de tarefas|
|AI commands|automação do workflow|
---
# Resultado
A IA passa a trabalhar assim:
```
Context capsules
       ↓
Task capsule
       ↓
Implementation
       ↓
Tests
       ↓
Delivery
```
Isso cria um **sistema de desenvolvimento assistido por IA muito mais previsível**.
---
# Quando esse modelo brilha
Ele funciona muito bem quando:
- o projeto tem muitos módulos
- várias tarefas acontecem em paralelo
- IA participa da implementação diariamente
---
💡 Um detalhe interessante: muitos times que usam **Claude + Cursor intensivamente** estão evoluindo isso para algo chamado **Module Ownership Map**, onde a IA sabe **quem é dono de cada módulo e qual regra arquitetural se aplica**.
Se quiser, posso te mostrar também **a arquitetura mais madura que vi até hoje para dev com IA em 2026**, que junta tudo isso em um único modelo extremamente limpo.