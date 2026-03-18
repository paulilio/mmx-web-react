Sim. Existe uma forma simples de fazer **a IA entender o projeto automaticamente**, sem você precisar escrever sempre “read AI.md”.
A técnica é usar **arquivos que as ferramentas de IA carregam automaticamente**.
Ela funciona muito bem com:
- Claude Code
- Cursor
- GitHub Copilot
---
# 1. Arquivo que as IAs sempre leem
Crie na raiz:
```
AGENTS.md
```
Muitos agentes de código procuram automaticamente esse arquivo.
---
# 2. Conteúdo recomendado
Esse arquivo deve apontar para **AI.md**, que é o hub.
```
# Agent Instructions
This repository uses structured AI-assisted development.
Before performing any task read:
AI.md
The file AI.md is the entry point that describes:
- system architecture
- development workflow
- project knowledge
- system contracts
- code index
```
---
# 3. Estrutura final ideal
```
repo/
AGENTS.md        ← carregado automaticamente pela IA
AI.md            ← hub de contexto
docs/
  system.md
  workflow.md
  knowledge.md
  contracts.md
engineering/
  tasks/
src/
PROJECT_INDEX.md
.ai/
  commands/
.workspace/
```
---
# 4. O que acontece na prática
Quando você abre o projeto em:
- Cursor
- Claude Code
- Copilot Chat
A IA tende a:
1. detectar `AGENTS.md`
2. ler `AI.md`
3. descobrir toda a estrutura
Você não precisa mandar instrução manual.
---
# 5. Pequeno detalhe que ajuda muito
No topo de **AI.md**, coloque:
```
Always read this file before implementing changes.
```
Isso aumenta muito a chance da IA seguir o fluxo.
---
# 6. Fluxo real de uso
Você abre o chat e escreve algo simples:
```
Add discount validation to billing.
```
A IA já sabe que precisa:
1. ler `AGENTS.md`
2. abrir `AI.md`
3. ler `docs/system.md`
4. seguir `docs/workflow.md`
Tudo automaticamente.
---
# Resultado
Seu repo passa a ter:
- entrada automática de contexto
- arquitetura compreensível para IA
- workflow claro
- tasks organizadas
Isso é praticamente um **AI-native development workspace**.
---
Se quiser, posso te mostrar **um último detalhe que melhora ainda mais essa arquitetura**:
uma pequena pasta chamada **`.ai/context/`** que alguns times usam para dividir o contexto em blocos menores e reduzir ainda mais o consumo de tokens pelas IAs. Isso ajuda muito em projetos grandes.