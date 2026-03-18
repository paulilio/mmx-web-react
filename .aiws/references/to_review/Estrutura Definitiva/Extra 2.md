Existe um truque simples que faz ferramentas como GitHub Copilot, Cursor IDE ou Claude entenderem melhor o projeto.
A ideia é criar **um ponto de entrada único de contexto**.  
Em vez da IA tentar adivinhar quais arquivos ler, você direciona isso.
Esse arquivo costuma se chamar **AGENTS.md** ou **PROJECT_CONTEXT.md**.

---
# Estrutura recomendada
```text
repo/
AGENTS.md
memory/
  system.md
  architecture.md
  decisions.md
tasks/
  active/
  done/
src/
tests/
```
O AGENTS.md funciona como **índice para a IA**.
---
# AGENTS.md
Conteúdo típico.
```text
Project context entrypoint
When analyzing this repository, always read the following files first.
memory/system.md
memory/architecture.md
memory/decisions.md
Active work can be found in:
tasks/active/
Engineering rules
Controllers must remain thin.
Business logic belongs to services.
Repositories handle persistence.
Workflow
1 read project memory
2 read the active task
3 analyze the code
4 propose minimal change
5 generate tests
```
Isso faz a IA seguir um **fluxo consistente**.
---
# Por que isso funciona
Modelos de linguagem funcionam melhor quando recebem:
- um ponto de entrada claro
- caminhos explícitos
- ordem de leitura
O AGENTS.md resolve isso.
---
# Como a IA navega
Fluxo real.
```text
AGENTS.md
↓
memory/system.md
↓
memory/architecture.md
↓
tasks/active/*
↓
src/*
```
Isso cria uma **sequência previsível de contexto**.
---
# Exemplo de uso
Você pede.
Corrigir bug no summary.
A IA segue este caminho.
1 lê AGENTS.md  
2 lê memory/system.md  
3 lê memory/architecture.md  
4 lê tasks/active/fix-summary.md  
5 navega no código
Resultado.
Menos alucinação.
---
# Pequena otimização
Adicionar um índice do código.
```text
memory/code-map.md
```
Exemplo.
```text
Backend
src/backend/controllers
src/backend/services
src/backend/repositories
Frontend
src/frontend/pages
src/frontend/components
src/frontend/hooks
```
Isso ajuda a IA a localizar módulos.
---
# Estrutura final recomendada
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
Simples e muito eficiente.
---
# Regra prática
Se a IA tiver apenas três coisas, ela já trabalha bem.
- contexto do sistema
- tarefa atual
- mapa do código
---
Se quiser, posso também te mostrar **como transformar isso em um comando único dentro do VS Code**, para iniciar qualquer tarefa nova com IA em menos de 10 segundos.