Vou juntar tudo em **um modelo único e elegante**, que vários engenheiros estão usando em 2026 quando trabalham intensivamente com IA.
Ele organiza o projeto em **três camadas mentais**.
- memória do sistema
- execução do trabalho
- código
Nada além disso.
---
# Estrutura final
```text
repo/
AGENTS.md
memory/
  system.md
  architecture.md
  semantic-map.md
  runtime-map.md
  decisions.md
tasks/
  active/
  done/
.ai/
  prompts/
  commands/
scripts/
src/
tests/
docs/
```
Essa estrutura cobre praticamente tudo que vimos.
---
# 1. AGENTS.md
Ponto de entrada para IA.
Ele diz **como a IA deve navegar no projeto**.
Exemplo.
```
Project context entrypoint
Read first
memory/system.md
memory/architecture.md
memory/semantic-map.md
Active work
tasks/active/
Engineering rules
Controllers remain thin
Business logic in services
Repositories handle persistence
```
Isso orienta ferramentas como GitHub Copilot, Cursor IDE e Claude.
---
# 2. memory
Guarda **conhecimento permanente do sistema**.
```
memory/
```
Arquivos.
```
system.md
architecture.md
semantic-map.md
runtime-map.md
decisions.md
```
Função de cada um.
system.md  
Visão geral do sistema.
architecture.md  
Stack e padrões arquiteturais.
semantic-map.md  
Dependências entre módulos.
runtime-map.md  
Fluxos reais de execução.
decisions.md  
Histórico de decisões técnicas.
---
# 3. tasks
Unidade de execução.
```
tasks/
```
Estrutura.
```
tasks/
  active/
  done/
```
Exemplo.
```
tasks/active/fix-summary.md
```
Conteúdo.
```
Title
Fix incorrect transaction summary totals
Goal
Ensure totals match filtered transactions
Steps
1 analyze aggregation logic
2 adjust service layer
3 add regression tests
```
Quando termina.
Mover para:
```
tasks/done/
```
---
# 4. camada AI
Automação.
```
.ai/
```
Estrutura.
```
.ai/prompts/
.ai/commands/
```
Exemplo de prompt.
```
Read project memory
memory/system.md
memory/architecture.md
memory/semantic-map.md
Read active task
Then
1 analyze code
2 propose minimal plan
3 implement change
4 generate tests
```
---
# 5. scripts
Automação local.
```
scripts/
```
Exemplos.
```
generate-code-map.sh
start-task.sh
review-task.sh
```
Esses scripts ajudam a preparar contexto para IA.
---
# 6. código
Código real.
```
src/
tests/
docs/
```
Nada muda aqui.
---
# Loop de engenharia
Esse é o ciclo completo.
```
memory
↓
task
↓
analysis
↓
plan
↓
implement
↓
verify
↓
update memory
```
---
# O que esse modelo resolve
Ele entrega quatro coisas.
Contexto do sistema.
Execução organizada.
Memória acumulada.
Automação de IA.
---
# Visão mental final
Sempre pense em três camadas.
```
memory
tasks
code
```
Todo o resto é suporte.
---
# Estrutura mínima possível
Se quiser algo ainda mais simples.
```
repo/
AGENTS.md
memory/
tasks/
src/
tests/
```
Isso já funciona muito bem.
---
Se quiser, posso te mostrar **como grandes projetos organizam a pasta `tasks/` para substituir praticamente Scrum ou Jira**, mantendo rastreabilidade sem burocracia.