Separar **`.ai/commands` por tipo de raciocínio** melhora muito a qualidade das respostas da IA. O modelo entende melhor o que você quer fazer.
Essa organização funciona muito bem com:
- Claude Code
- Cursor
- GitHub Copilot
A ideia é dividir os comandos em **três categorias de trabalho**.
---
# Estrutura recomendada
```text
.ai/
commands/
  analysis/
    doctor.md
    task-scan.md
    analyze-module.md
  engineering/
    start-task.md
    task-plan.md
    write-tests.md
    refactor.md
  delivery/
    regression-check.md
    prepare-pr.md
    ship.md
```
---
# 1. Analysis commands
Usados para **entender o sistema**.
Exemplos:
```
/doctor
/task-scan
/analyze-module billing
```
Função:
- entender arquitetura
- localizar código
- detectar problemas
- analisar impacto
---
# 2. Engineering commands
Usados para **criar ou modificar código**.
Exemplos:
```
/start-task BE-014
/task-plan
/write-tests
/refactor
```
Função:
- planejar implementação
- gerar código
- criar testes
- refatorar módulos
---
# 3. Delivery commands
Usados para **finalizar trabalho**.
Exemplos:
```
/regression-check
/prepare-pr
/ship
```
Função:
- validar mudanças
- preparar pull request
- gerar commit message
---
# Workflow completo
Fluxo real:
```
/doctor
/start-task BE-014
/task-plan
/write-tests
/regression-check
/prepare-pr
/ship
```
Isso cria um **loop de engenharia previsível**.
---
# Benefício dessa separação
Sem categorias:
```
.ai/commands/
  15 arquivos misturados
```
IA fica confusa.
Com categorias:
```
analysis → entender
engineering → construir
delivery → entregar
```
Isso melhora muito o raciocínio.
---
# Estrutura completa recomendada
```
repo/
AGENTS.md
SYSTEM_MAP.md
ARCHITECTURE.md
PROJECT_MAP.md
ENTRYPOINTS.md
.ai/
  context/
  commands/
    analysis/
    engineering/
    delivery/
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
# Resultado final
Esse modelo reúne:
• Context-Driven Development  
• Task-Driven Development  
• Project Memory Layer  
• AI Dev OS
Tudo com **estrutura simples e escalável**.
---
Se quiser, posso te mostrar **um detalhe arquitetural muito poderoso que quase ninguém usa ainda**:
como transformar **`.workspace` em uma camada de memória pessoal da IA**, separada do git, mas usada automaticamente pelos agentes. Isso melhora muito produtividade em projetos grandes.