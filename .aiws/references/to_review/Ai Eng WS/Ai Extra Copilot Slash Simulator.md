Resposta curta: **não diretamente.**

Os arquivos em `.ai/commands/*.md` **não são executados automaticamente pelo** GitHub Copilot.

Eles funcionam **nativamente** em:

- Claude Code
    
- Cursor
    

Porque essas ferramentas suportam **slash commands baseados em arquivos Markdown**.

---

# No Copilot funciona de outra forma

No Copilot você tem três opções.

## 1. Copiar e colar manualmente

Você abre o arquivo:

```
.ai/commands/task-plan.md
```

Copia o conteúdo e cola no chat do Copilot.

Funciona, mas é manual.

---

# 2. Criar prompts reutilizáveis

No VS Code você pode salvar snippets ou prompts.

Exemplo:

```
task-plan:
Generate a technical plan for the task located at engineering/$TASK.
Follow repository architecture and guidelines.
Write the result in plan.md.
```

Depois chama rapidamente.

---

# 3. Usar Copilot Chat com contexto

Você pode dizer:

```
Read:
AGENTS.md
PROJECT_MAP.md
ENTRYPOINTS.md

Then analyze:

engineering/backend/tasks/BE-004/task.md

Create the plan in plan.md.
```

Copilot consegue executar isso.

---

# Diferença entre ferramentas

|Ferramenta|Suporte a `.ai/commands`|
|---|---|
|Claude Code|nativo|
|Cursor|nativo|
|Copilot|manual|
|Copilot Workspace|parcial|

---

# O que funciona melhor com Copilot

Se você quiser manter compatibilidade com Copilot, faça isto:

Adicionar **um único arquivo**:

```
.ai/COMMANDS.md
```

Com índice:

```
Commands

/start-task
/task-scan
/task-plan
/write-tests
/regression-check
/task-done
/ship
```

Assim você pode falar no Copilot:

```
Use the instructions in .ai/COMMANDS.md for /task-plan
```

E ele entende.

---

# Conclusão

Seu sistema funciona:

• **100% automático** em Claude Code  
• **100% automático** em Cursor  
• **semi manual** em Copilot

Mas ainda **vale muito a pena manter** os arquivos `.ai/commands`.

Eles viram **documentação executável de workflow**.

---

Se quiser, posso te mostrar **um truque pequeno que faz o Copilot seguir seu AGENTS.md quase como um sistema de comandos**, mesmo sem suporte nativo a slash commands. Isso melhora bastante a consistência das respostas.