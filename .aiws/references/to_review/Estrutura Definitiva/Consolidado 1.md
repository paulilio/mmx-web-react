Vou te mostrar **um modelo consolidado e estável**, que junta:
- Context-Driven Development
- Task-Driven Development
- Project Memory Layer
- AI Dev OS
Sem criar burocracia.
Esse modelo é o que muitos engenheiros acabam adotando depois de testar todos os outros.
---
# Estrutura consolidada (2026)
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
  commands/
src/
tests/
docs/
```
A estrutura tem **apenas três camadas principais**.
- memória
- execução
- código
---
# Camada 1. Memory
Aqui fica **todo o conhecimento do sistema**.
```
memory/
```
Arquivos típicos.
```
system.md
architecture.md
patterns.md
decisions.md
```
Função de cada um.
system.md
- visão geral do sistema
- módulos principais
- fluxos críticos
architecture.md
- stack
- padrões arquiteturais
- organização do código
patterns.md
- padrões de implementação
- regras de engenharia
decisions.md
- histórico de decisões técnicas
---
# Camada 2. Tasks
Aqui fica **todo o trabalho ativo**.
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
Conteúdo típico.
```
Title
Fix incorrect summary totals
Context
Totals incorrect when filters applied
Goal
Ensure totals match filtered transactions
Steps
1 analyze aggregation logic
2 adjust service layer
3 add regression tests
Success
Totals match filtered dataset
```
Quando termina.
Mover para:
```
tasks/done/
```
---
# Camada 3. AI
Aqui ficam automações para IA.
```
.ai/
```
Estrutura.
```
.ai/
prompts/
commands/
```
Exemplos.
```
prompts/
analyze-code.md
plan-task.md
generate-tests.md
review-pr.md
```
---
# Camada 4. Código
Código normal.
```
src/
tests/
docs/
```
Nada muda.
---
# Loop de desenvolvimento
Fluxo simples.
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
# Por que esse modelo é estável
Ele resolve quatro problemas clássicos.
Contexto do sistema.
Memória técnica.
Execução organizada.
Integração com IA.
---
# Comparação final
|Modelo|Complexidade|Poder IA|Escala|
|---|---|---|---|
|Context-Driven|baixa|alta|média|
|Project Memory|média|muito alta|alta|
|AI Dev OS|média|muito alta|alta|
|Modelo consolidado|baixa|muito alta|alta|
---
# Estrutura final recomendada
```
repo/
memory/
tasks/
.ai/
src/
tests/
docs/
```
Simples e poderoso.
---
# Insight final
Quase todos os modelos modernos convergem para três elementos.
- **memória do projeto**
- **tarefas claras**
- **código**
Quando esses três estão organizados, IA trabalha muito melhor.
---
Se quiser, posso te mostrar **um exemplo real completo**, com todos os arquivos preenchidos para um projeto real (.NET + React), para você ver exatamente **como isso ficaria na prática no seu repositório**.