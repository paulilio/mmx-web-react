


# Script AI Context Layer
Vou te mostrar **o modelo completo que junta tudo que vimos**.  
Isso é basicamente um **AI Engineering System** para desenvolvimento diário.
A ideia é integrar três coisas:
- **Contexto do projeto**
- **Índice do código**
- **Loop de desenvolvimento com IA**
---
## Arquitetura do AI Engineering System
Três camadas.
```text
context
index
execution
```
Cada uma tem uma função diferente.
---
## Estrutura do repositório
```text
repo/
ai/
  context/
    architecture.md
    system-map.md
    rules.md
  index/
    symbols.json
    dependencies.json
    modules.json
    flows.json
work/
src/
tests/
docs/
```
---
## Camada 1. Context
Define **como o sistema funciona**.
```text
ai/context/
```
Arquivos:
```text
architecture.md
system-map.md
rules.md
```
Conteúdo típico:
architecture.md
```text
Frontend
React + TypeScript
Backend
.NET API
Core modules
transactions
reports
auth
```
---
## Camada 2. Index
Define **como o código está conectado**.
```text
ai/index/
```
Arquivos:
```text
symbols.json
dependencies.json
modules.json
flows.json
```
Isso funciona como **um mapa navegável do código**.
---
## Camada 3. Execution
Define **o trabalho em andamento**.
```text
work/
```
Exemplo:
```text
work/fix-transactions-summary.md
```
Conteúdo:
```text
Goal
Fix incorrect totals when filters are applied
Steps
1 investigate filter flow
2 adjust aggregation logic
3 add regression test
```
---
## Loop de desenvolvimento
Agora entra o **AI Dev Loop**.
```text
task
↓
context
↓
index
↓
plan
↓
code
↓
verify
```
Esse loop se repete várias vezes por dia.
---
## Prompt padrão usado no loop
```text
Context
Read ai/context/*
Read ai/index/*
Read work/[task]
Goal
Resolve this task.
Process
1 explain how the current implementation works
2 identify where the change should happen
3 propose minimal implementation plan
4 generate code
5 analyze regressions
6 generate tests
Constraints
minimal change
respect architecture
```
---
## Fluxo real no dia a dia
Bug aparece.
```text
Transactions summary incorrect
```
Você cria:
```text
work/fix-summary.md
```
Executa prompt.
IA:
1. lê contexto
2. consulta index
3. identifica módulos
4. gera plano
5. gera código
6. cria testes.
---
## Por que esse modelo funciona
Ele resolve os três problemas clássicos da IA em código:
### 1. Falta de contexto
`ai/context`
---
### 2. Navegação ruim no código
`ai/index`
---
### 3. Execução desorganizada
`work`
---
## Estrutura final recomendada
Para seu stack (React + .NET):
```text
repo/
ai/
  context/
  index/
work/
src/
tests/
docs/
```
Simples, escalável e muito eficiente para IA.
---
## Insight importante
Mesmo ferramentas avançadas fazem algo parecido internamente.
Exemplos:
- Cursor → code index
- Sourcegraph → semantic index
- Copilot Workspace → repo analysis.
---
## Minha recomendação honesta
Comece simples.
Use apenas:
```text
ai/context
work
src
```
Depois evolua para index se necessário.
---
Se quiser, posso te mostrar **uma versão ainda mais avançada chamada “AI Workspace Architecture”**, usada por engenheiros que trabalham quase 100% com IA no desenvolvimento.  
Ela organiza **todo seu ambiente de engenharia**, não apenas o repositório.

# Scripts System-Map
Você pode gerar o **system-map automaticamente analisando imports e dependências do código**.  
A ideia é escanear o `src/` e produzir um resumo de módulos, serviços e dependências.  
Esse resultado alimenta o arquivo `ai/system-map.md`.
Isso economiza muito tempo quando você começa a usar IA em um projeto grande.
---
## Script simples para gerar system-map
Exemplo em **Node.js** que funciona bem para projetos React ou TypeScript.
```javascript
import fs from "fs";
import path from "path";
const ROOT = "src";
const result = {};
function scan(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      scan(full);
      return;
    }
    if (!file.endsWith(".ts") && !file.endsWith(".tsx") && !file.endsWith(".js"))
      return;
    const content = fs.readFileSync(full, "utf8");
    const imports =
      content.match(/import\s.+\sfrom\s['"](.*)['"]/g) || [];
    result[full] = imports.map(i =>
      i.replace(/import\s.+\sfrom\s['"]/, "").replace(/['"]/g, "")
    );
  });
}
scan(ROOT);
fs.writeFileSync(
  "ai/system-map.json",
  JSON.stringify(result, null, 2)
);
console.log("system-map generated");
```
---
## Exemplo de saída
```json
{
  "src/components/TransactionsSummary.tsx": [
    "../services/reportService",
    "../hooks/useTransactions"
  ],
  "src/services/reportService.ts": [
    "../api/client"
  ]
}
```
---
## Converter para markdown
Depois você transforma isso em `system-map.md`.
Exemplo:
```
TransactionsSummary
depends on
- reportService
- useTransactions
ReportService
depends on
- apiClient
```
---
## Estrutura final no repositório
```
repo/
ai/
architecture.md
system-map.md
rules.md
scripts/
generate-system-map.js
work/
src/
tests/
```
---
## Quando executar
Rode o script quando:
- entrar em projeto novo
- arquitetura mudar
- muitos arquivos novos surgirem.
---
## Melhorias comuns
Equipes avançadas costumam adicionar:
- detecção de **controllers**
- detecção de **services**
- detecção de **hooks**
- detecção de **API endpoints**
Isso permite gerar automaticamente:
```
controllers
services
components
data layer
```
---
## Exemplo de system-map ideal
```
Frontend
components
TransactionsSummary
ReportsDashboard
hooks
useTransactions
useReports
services
reportService
transactionService
```
---
## Benefício principal
Quando a IA lê:
```
ai/architecture.md
ai/system-map.md
```
ela entende rapidamente:
- estrutura do sistema
- dependências
- fluxo principal.
---
Se quiser, posso te mostrar **um script muito mais poderoso que gera um grafo completo do repositório (repo-brain) com dependências entre módulos**, algo que melhora muito a capacidade da IA de navegar em projetos grandes.

# Prompt Context IA
Aqui está o **prompt usado para gerar automaticamente o contexto de IA de um repositório**.  
Ele cria os arquivos que normalmente ficam em `ai/` ou `.ai/`, como:
- `architecture.md`
- `system-map.md`
- `rules.md`
Isso é útil quando você começa a usar IA em um projeto grande.
---
# Prompt para gerar contexto do projeto
Use quando abrir um repositório pela primeira vez.
```text
You are analyzing an existing software repository.
Goal
Generate a concise AI context for this project.
Tasks
1. Architecture Overview
Explain the high level architecture of the system.
Include:
- frontend stack
- backend stack
- main services
- major modules
2. System Map
List the main modules and their responsibilities.
Include:
- components
- services
- data layer
- integrations
3. Data Flow
Describe how data flows through the system.
Include:
- API calls
- service layers
- state management
4. Engineering Rules
Infer coding conventions used in the repository.
Examples:
- architectural patterns
- naming conventions
- folder structure
- testing strategy
Output format
Create the following files:
ai/architecture.md
ai/system-map.md
ai/rules.md
```
---
# Resultado esperado
A IA gera algo assim.
---
## ai/architecture.md
```text
Frontend
React + TypeScript
Backend
.NET Web API
State management
React hooks
Testing
Vitest
```
---
## ai/system-map.md
```text
Modules
transactions
Handles transaction listing and filters
reports
Aggregated financial reports
settings
User configuration
```
---
## ai/rules.md
```text
Components are presentation-focused.
Business logic is implemented in services.
API calls are centralized in service modules.
```
---
# Como usar no seu projeto
No seu repositório:
```text
repo/
ai/
architecture.md
system-map.md
rules.md
work/
src/
tests/
```
Depois disso, **toda vez que usar IA**, você começa com:
```text
Read ai/*
```
Isso melhora muito a qualidade das respostas.
---
# Quando rodar esse prompt
Use quando:
- começar um projeto
- entrar em projeto legado
- adicionar IA no workflow.
---
# Dica importante
Atualize esses arquivos apenas quando:
- arquitetura mudar
- stack mudar
- padrão de código mudar.
Não atualize em cada task.
---
# Resultado prático
Depois de criar esses arquivos, qualquer prompt pode começar assim:
```text
Context
Read ai/architecture.md
Read ai/system-map.md
```
E a IA já entende o sistema.
---
Se quiser, posso também te mostrar **um script que gera automaticamente o system-map de um projeto React ou .NET analisando os imports do código**, algo que muitos engenheiros usam para criar esse contexto em segundos.

# Prompt Unico (6 passos Dev)
Vou te mostrar **o prompt único que executa automaticamente os 6 passos do AI Dev Loop**.  
Ele é usado quando você quer resolver uma task em **uma única interação com a IA**, mantendo o raciocínio estruturado.

Esse método segue exatamente o ciclo:

```text
context → problem → plan → code → regression → tests
```

Esse fluxo evita que a IA gere código fora de contexto.

---

# Prompt único para desenvolvimento com IA

Use algo assim:

```text
You are working on an existing codebase.

Context
Read the following files to understand the system:
- ai/architecture.md
- ai/system-map.md
- work/[task-file]

Goal
Resolve the following task:
[describe the bug or feature]

Process
Follow these steps:

1. Context Scan
Explain how the relevant part of the system currently works.

2. Problem Analysis
Identify where the change should occur and potential side effects.

3. Implementation Plan
Propose a minimal change plan following existing patterns.

4. Code Changes
Generate the required code modifications.

5. Regression Safety
Analyze possible regressions and edge cases.

6. Tests
Generate tests that validate the change and prevent regression.

Constraints
- minimal changes
- follow existing architecture
- do not refactor unrelated code
```

---

# Como usar na prática

Bug:

```
Transactions summary shows incorrect totals when filters are applied
```

Você cria:

```
work/fix-summary.md
```

Depois envia o prompt acima.

A IA vai responder em blocos:

1️⃣ entendimento do código  
2️⃣ análise do problema  
3️⃣ plano de implementação  
4️⃣ código  
5️⃣ análise de regressão  
6️⃣ testes

---

# Exemplo de resposta esperada da IA

```text
Context Scan
The transactions summary component receives filtered data from...

Problem Analysis
The aggregation is executed before the filter dependency updates...

Implementation Plan
Modify aggregation inside useEffect...

Code
[patch]

Regression Risks
Possible issue when filters are empty...

Tests
Add regression test for filtered totals.
```

---

# Quando usar esse prompt

Use quando a task:

- envolve **múltiplos arquivos**
    
- envolve **backend + frontend**
    
- exige **análise antes de código**
    

---

# Quando NÃO usar

Para mudanças simples, use prompts curtos:

```
Explain this function
```

ou

```
Generate a unit test for this file
```

---

# Ajuste ideal para seu stack

Como você trabalha com:

- React
    
- .NET
    
- APIs
    
- CI pipelines
    

adicione no prompt:

```
Locate relevant controllers, services and components before proposing changes.
```

Isso ajuda muito em sistemas grandes.

---

# Insight importante

Engenheiros experientes perceberam que **o segredo não é pedir código**, mas pedir **raciocínio estruturado antes do código**.

Por isso esse prompt força a IA a:

1. entender
    
2. planejar
    
3. executar.
    

---

Se quiser, posso também te mostrar **o prompt que muitos engenheiros usam para gerar automaticamente toda a documentação de contexto (`ai/architecture.md`, `system-map.md`, etc.) a partir do código do projeto**.  
Isso economiza horas quando você começa a usar IA em um repositório grande.

# Prompts 6 passos Dev (Separdo)
**6 prompts padrão que engenheiros usam diariamente com IA para desenvolvimento**.  
A IA começar a escrever código sem entender o sistema.
Sempre use **na mesma sequência**.
## 1. Context Scan
Objetivo: fazer a IA entender o código antes de sugerir mudanças.
Prompt:
```text
Analyze this codebase section.  
Goal:  
Understand how this feature currently works. Locate relevant modules and services
Focus on:  
- architecture  
- main components  
- data flow  
- external dependencies  
Relevant files:  
[paste files or folder]
```

Resultado esperado:
- visão geral da feature
- fluxo de execução
- dependências importantes.
---
## 2. Problem / Feature Definition
Objetivo: deixar claro **o que deve mudar**.
Prompt:
```text
Given the current implementation, analyze this request.  
Request:  
[bug or feature description]  
Explain:  
- where the change should happen  
- minimal scope of modification  
- possible side effects
Resultado:
- ponto exato da mudança
- impacto potencial no sistema.
```

---
## 3. Implementation Plan
Objetivo: evitar codificação impulsiva.
Prompt:
```text
Propose a minimal implementation plan.  
Constraints:  
- follow existing patterns  
- avoid unnecessary refactoring  
- modify as few files as possible  
Show:  
- files to change  
- new files if needed  
- functions to update
Resultado:
- plano técnico claro.
```

---
## 4. Code Generation
Agora a IA implementa.
Prompt:
```text
Generate the code changes based on the implementation plan.  
Rules:  
- keep the existing architecture  
- follow current coding style  
- minimal changes only
Resultado:
- patch
- ou novos trechos de código.
---
# 5. Regression Safety
Antes de aceitar o código, verifique riscos.
Prompt:
Analyze possible regressions caused by this change.  
Focus on:  
- edge cases  
- existing features affected  
- data flow changes
```
Resultado:
- lista de riscos de regressão.
---
## 6. Tests
Por último, garantir que o problema não volte.
Prompt:
```text
Generate tests to validate the change.  
Include:  
- regression test for the bug  
- edge case coverage  
- minimal test setup
```
Resultado:
- testes unitários
- ou e2e.
---
## Fluxo visual do ciclo
```text
task  
↓  
1 context scan  
↓  
2 problem definition  
↓  
3 implementation plan  
↓  
4 code  
↓  
5 regression analysis  
↓  
6 tests
```
