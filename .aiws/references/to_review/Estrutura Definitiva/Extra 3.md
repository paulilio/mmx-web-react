Agora vamos para o **upgrade que realmente muda o jogo**.  
Ele permite que a IA descubra **sozinha quais arquivos do código ler**.
Isso evita você ter que dizer:
- “abra esse arquivo”
- “veja esse serviço”
- “analise esse controller”
Esse mecanismo é chamado de **Code Map**.
---
# Ideia do Code Map
Criar um arquivo simples que explica **onde cada parte do sistema vive**.
Isso ajuda ferramentas como GitHub Copilot, Claude e Cursor IDE a navegar no projeto.
---
# Estrutura do projeto
```text
repo/
AGENTS.md
memory/
  system.md
  architecture.md
  code-map.md
  decisions.md
tasks/
  active/
  done/
src/
tests/
```
---
# memory/code-map.md
Exemplo real.
```text
Project Code Map
Backend
Controllers
src/backend/controllers/
Business logic
src/backend/services/
Data access
src/backend/repositories/
Domain models
src/backend/models/
Frontend
Pages
src/frontend/pages/
Components
src/frontend/components/
UI logic
src/frontend/hooks/
API communication
src/frontend/services/
```
---
# Como a IA usa isso
Fluxo de leitura.
```
AGENTS.md
↓
memory/system.md
↓
memory/architecture.md
↓
memory/code-map.md
↓
task
↓
code
```
Quando você pede:
Corrigir erro no summary.
A IA procura no code-map.
```
reports → services → repositories
```
Ela sabe **onde procurar no código**.
---
# Exemplo de prompt
Você envia algo assim.
```
Read AGENTS.md
Read memory/system.md
Read memory/architecture.md
Read memory/code-map.md
Then read:
tasks/active/fix-summary.md
Identify which modules should be analyzed and propose a minimal implementation plan.
```
---
# Benefício real
A IA consegue:
- navegar no projeto
- identificar módulos
- localizar lógica
Sem você precisar guiar.
---
# Pequena melhoria
Adicionar **Key Files** no code-map.
Exemplo.
```text
Important backend files
src/backend/program.cs
src/backend/services/transaction-service.cs
Important frontend files
src/frontend/pages/report-page.tsx
src/frontend/hooks/use-transactions.ts
```
Isso acelera muito a análise.
---
# Estrutura final otimizada
```
repo/
AGENTS.md
memory/
  system.md
  architecture.md
  code-map.md
  decisions.md
tasks/
  active/
  done/
src/
tests/
```
Essa estrutura já é suficiente para **IA navegar bem em projetos grandes**.
---
# Insight importante
Ferramentas modernas estão tentando fazer isso automaticamente.
Mas quando você fornece **um code-map explícito**, a qualidade da IA melhora bastante.
---
Se quiser, posso te mostrar algo ainda mais poderoso:
como gerar **o code-map automaticamente** sempre que o projeto muda, sem você precisar atualizar manualmente.