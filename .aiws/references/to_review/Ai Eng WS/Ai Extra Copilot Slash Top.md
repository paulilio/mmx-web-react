Sim. Existe um truque simples para fazer o GitHub Copilot seguir suas regras quase como se tivesse **slash commands**, mesmo sem suporte nativo.

A ideia é usar **um dispatcher de comandos dentro do AGENTS.md**.

Isso funciona muito bem também com Cursor e Claude Code.

---

# 1. Adicione um dispatcher no AGENTS.md

No final do arquivo:

```
## AI Command Dispatcher

When the user writes a command starting with "/", interpret it as an engineering workflow command.

Command format:

/command-name [arguments]

The command instructions are located in:

.ai/commands/{command-name}.md

Steps:

1. Read the corresponding file.
2. Follow the instructions strictly.
3. Execute the steps described in the command.
4. Output the results according to the command instructions.
```

---

# 2. Estrutura de comandos

```
.ai/

commands/

doctor.md
resume.md
start-task.md
task-scan.md
task-plan.md
write-tests.md
regression-check.md
task-done.md
ship.md
```

---

# 3. Como usar no Copilot

No chat você escreve normalmente:

```
/task-plan backend/tasks/BE-004
```

Copilot vai:

1. ler `AGENTS.md`
    
2. ver a regra do dispatcher
    
3. abrir `.ai/commands/task-plan.md`
    
4. seguir as instruções
    

Na prática ele passa a se comportar como se tivesse **comandos reais**.

---

# 4. Exemplo real de uso

Você digita:

```
/start-task backend BE-005 "Add billing export"
```

Copilot entende que deve:

```
open .ai/commands/start-task.md
execute steps
create folder
create task.md
create plan.md
create review.md
```

---

# 5. Pequeno refinamento que ajuda muito

Adicionar no topo do AGENTS.md:

```
Priority of instructions:

1. SYSTEM_PROMPT.md
2. AGENTS.md
3. docs/guidelines/
4. command instructions in .ai/commands/
```

Assim a IA sempre respeita:

- arquitetura
    
- guidelines
    
- comandos
    

---

# Resultado

Você transforma Copilot em algo próximo de um **mini orchestrator de desenvolvimento**.

Fluxo fica assim:

```
/doctor
/start-task
/task-scan
/task-plan
implement
/write-tests
/regression-check
/task-done
/ship
```

Tudo guiado pelo próprio repositório.

---

Se quiser, posso te mostrar **uma versão ainda melhor dessa arquitetura (usada por equipes AI-native em 2026)** que reduz o número de arquivos raiz e deixa o sistema mais robusto para IA. Ela resolve um problema comum chamado **context fragmentation**.