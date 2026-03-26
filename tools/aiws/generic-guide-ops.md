# Generic Usage Guide — AI Engineering Workspace

Este guia explica como voce (humano) interage com o workspace e com as IAs do projeto.
Para entender o modelo completo, veja: `.aiws/references/aiws/generic-blueprint.md`

---

# Estrutura rapida

\`\`\`
.ai/                    ← Context Kernel (a AI le isso)
  AGENTS.md             ← regras operacionais
  SYSTEM.md             ← o que o sistema faz
  CODEBASE_MAP.md       ← onde esta o codigo
  CONTEXT_SURFACES.md   ← o que pode quebrar
  commands/             ← comandos reutilizaveis

.aiws/                ← Workspace Operacional (voce e a AI trabalham aqui)
  tasks/                ← tarefas ativas
  tasks/backlog/        ← tarefas planejadas, ainda nao iniciadas
  tasks/done/           ← tarefas concluidas
  knowledge/            ← aprendizados (inv-*, con-*, pat-*, dec-*, rev-*)
  runs/                 ← historico de execucao
  references/           ← referencias de produto e guias
  templates/            ← templates obrigatorios

CLAUDE.md               ← ponte para Claude Code
.github/copilot-instructions.md ← ponte para Copilot
.cursorrules            ← ponte para Cursor
\`\`\`

## Modelo multi-IA na pratica

Para uso humano, a regra e:

- `.ai/` e o kernel unico de conhecimento, regras e workflows.
- `.ai/commands/` e a especificacao canonica dos workflows operacionais.
- Bridges como `CLAUDE.md`, `.github/copilot-instructions.md` e `.cursorrules` apontam para o kernel e nao substituem o kernel.
- Wrappers nativos entram apenas quando a ferramenta exige integracao formal para comandos, prompts, agentes, skills, hooks ou artefatos equivalentes.

Fluxo recomendado de manutencao:

1. Atualize primeiro o kernel em `.ai/`.
2. Se o workflow mudou, ajuste a especificacao em `.ai/commands/`.
3. Revise bridges apenas se a ativacao do kernel mudou.
4. Atualize wrappers nativos somente nas plataformas que exigem integracao formal.

---

# Como criar uma task

Toda task fica em uma **pasta propria** dentro de `tasks/`, mesmo se for simples.

### Task simples

1. Crie a pasta: `tasks/tk-XXX-nome-da-task/`
2. Copie o template `templates/task.md` para `1-task.md` dentro da pasta
3. Preencha Objective, Context e Type (feature, bugfix, spike, refactor, chore)
4. O Plan pode ser preenchido por voce ou pela AI (via `task-plan`)

\`\`\`
tasks/
  tk-005-nome/
    1-simple-task.md
\`\`\`

### Task complexa (Capsule)

Para tasks com multiplos modulos, fases distintas ou trabalho de varios dias:

1. Crie a pasta: `tasks/tk-XXX-nome/`
2. Copie os templates de `templates/task-capsule/` para a pasta
3. Numere os arquivos na ordem de uso: `1-task.md`, `2-plan.md`, `3-spec.md`, `4-execute.md`, `5-phase-1.md`, ...

\`\`\`
tasks/
  tk-006-nome/
    1-task.md
    2-plan.md
    3-spec.md
    4-execute.md
    5-phase-1.md
    6-phase-2.md
\`\`\`

O `3-spec.md` e a especificacao tecnica gerada apos o plano — goal, scope, architecture, data contracts, execution flow, edge cases. A IA implementa a partir da spec. Quanto mais clara, melhor o resultado.

### Exemplo de prompt:
\`\`\`
Crie uma task para implementar o modulo de [nome].
Use o template .aiws/templates/task.md.
Type: feature.
\`\`\`

---

# Como executar comandos

Os comandos ficam em `.ai/commands/` e devem ser tratados como a especificacao canonica do workflow.

Como usar por ferramenta:

- Claude Code e Cursor podem consumir esses workflows de forma mais direta, dependendo do suporte nativo da ferramenta.
- Copilot deve usar wrappers nativos, como prompt files em `.github/prompts/`, quando voce quiser slash commands ou integracao formal.
- Se nao houver wrapper nativo, use o bridge e cite explicitamente o comando canonico.

| Comando | Quando usar | Como pedir |
|---|---|---|
| `task-loop` | Bugfix simples, chore | "Execute task-loop para a TK-XXX" |
| `start-task` | Inicio de qualquer task | "Start task TK-XXX" |
| `task-plan` | Precisa de um plano | "Crie o plano da TK-XXX" |
| `analyze-task` | Task complexa, multiplos modulos, risco de regressao | "Analise a TK-XXX antes de implementar" |
| `spec-review` | Apos gerar a spec, antes de implementar | "Revise a spec da TK-XXX" |
| `write-tests` | Antes ou durante implementacao | "Escreva os testes da TK-XXX" |
| `regression-check` | Antes de finalizar | "Rode o regression check" |
| `task-done` | Ao finalizar | "Finalize a TK-XXX" |
| `ship` | Enviar para o repo | "Ship a TK-XXX" |
| `kernel-check` | Apos mudanca estrutural | "Verifique se o kernel precisa de atualizacao" |

### Comandos especificos do projeto (sufixo `-custom-[projeto]`)

Alem dos comandos base, cada projeto pode ter comandos de analise especializados que conhecem o dominio e as regras do sistema.

Exemplos de comandos custom:
| Comando | Quando usar | Como pedir |
|---|---|---|
| `security-check-custom-[projeto]` | Antes de finalizar features de auth, API ou qualquer mudanca de seguranca | "Rode o security check" |
| `performance-check-custom-[projeto]` | Apos implementar queries, data fetching ou telas com listas grandes | "Rode o performance check" |

**Como criar:**
Esses comandos so tem valor quando sao especificos — conhecem a stack, os modulos criticos e as regras do negocio. Um comando generico nao agrega mais do que um dev senior ja saberia.

Ao criar para um novo projeto, adaptar para:
- As regras de seguranca documentadas no `AGENTS.md` do projeto
- Os endpoints e modulos criticos do `CODEBASE_MAP.md`
- Os padroes de data fetching e ORM usados na stack
- Os fluxos com maior risco de regressao do `CONTEXT_SURFACES.md`

Salvar em `.ai/commands/[nome]-custom-[projeto].md`

### Feature AI-driven:
\`\`\`
1. "Start task TK-005"
2. "Analise a task com analyze-task"
3. (voce revisa e aprova o plano)
4. "Gere a spec da task"
5. "Revise a spec com spec-review"
6. (voce revisa e aprova a spec)
7. "Implemente seguindo a spec"
8. "Escreva os testes"
9. "Rode regression check"
10. (voce revisa o resultado final)
11. "Finalize a task"
12. "Ship"
\`\`\`

### Feature simples (Pair):
\`\`\`
1. "Start task TK-005"
2. "Crie o plano"
3. (discute e refina junto)
4. "Implemente o step 1 do plano"
5. "Escreva os testes"
6. "Rode regression check"
7. "Finalize a task"
8. "Ship"
\`\`\`

### Bugfix simples:
\`\`\`
1. "Execute task-loop para a TK-006"
2. "Ship"
\`\`\`

### Spike / exploracao (Assistente):
\`\`\`
1. "Start task TK-007"
2. "Me explica como esse fluxo funciona"
3. "Quais as opcoes de abordagem para esse problema?"
4. (voce decide a abordagem)
5. "Finalize a task com as conclusoes"
\`\`\`

---

# Como registrar conhecimento

### Review (para estudar o que foi feito):
\`\`\`
Crie um review do que foi feito na TK-XXX.
Quero entender como funciona e o que estudar.
\`\`\`
Salvo em: `knowledge/rev-*.md`

### Decisao tecnica:
\`\`\`
Registre a decisao que tomamos sobre [assunto].
\`\`\`
Salvo em: `knowledge/dec-*.md`

### Investigacao de bug:
\`\`\`
Registre a investigacao do bug [descricao].
\`\`\`
Salvo em: `knowledge/inv-*.md`

### Conceito descoberto:
\`\`\`
Registre o conceito de [assunto] que aprendemos.
\`\`\`
Salvo em: `knowledge/con-*.md`

### Padrao reutilizavel:
\`\`\`
Registre o padrao de [assunto] para reutilizar.
\`\`\`
Salvo em: `knowledge/pat-*.md`

---

# Modelos de Trabalho

Escolha o modelo conforme a clareza da task. Os modelos podem ser combinados — uma task pode comecar como Assistente e terminar como AI-driven.

| Modelo | Quando usar | Voce faz |
|---|---|---|
| **AI-driven** | Objetivo claro, task bem definida | Revisa plano, spec e resultado final |
| **Pair Programming** | Objetivo claro, arquitetura ainda aberta | Decide junto com a IA, itera |
| **AI como Assistente** | Objetivo em formacao, spike, investigacao | Define cada passo, IA executa sob demanda |

---

# Pipelines por tipo de task

| Type | Modelo | Pipeline |
|---|---|---|
| feature simples | AI-driven ou Pair | start-task → task-plan → write-tests → regression-check → task-done → ship |
| feature AI-driven | AI-driven | start-task → analyze-task → **spec-review** → write-tests → regression-check → task-done → ship |
| bugfix simples | AI-driven | task-loop → ship |
| bugfix complexo | Pair | start-task → analyze-task → regression-check → task-done → ship |
| spike / exploracao | Assistente | start-task → task-plan → task-done |
| refactor | AI-driven ou Pair | start-task → regression-check → task-done → ship |
| chore | AI-driven | task-loop |

`spec-review` entra no pipeline AI-driven logo apos o plano — revisa a spec antes de implementar e evita retrabalho.

---

# Dicas praticas

## Linguagem natural
\`\`\`
"Comeca a task TK-010"
"O que mudou nessa task?"
"Finaliza e faz o ship"
"Me explica o que voce fez no auth"
\`\`\`

## A AI sabe onde esta tudo
Voce nao precisa informar caminhos — a AI le o AGENTS.md e sabe onde ficam tasks, templates, knowledge e runs.

## Se a AI errar
\`\`\`
1. Melhorar CODEBASE_MAP.md  ← AI nao achou o codigo certo (80% dos casos)
2. Melhorar AGENTS.md        ← AI nao seguiu as regras
3. Melhorar a task           ← contexto ou Code Surface insuficiente
\`\`\`

## Manter o kernel atualizado
Apos features grandes ou mudancas estruturais:
\`\`\`
"Rode kernel-check"
\`\`\`

## Chat dedicado para duvidas rapidas
Alem do Claude Code (que le o repo), vale ter um **chat separado para duvidas do dia a dia** — sem precisar abrir o projeto.

Como configurar:
1. Crie `[projeto]-gpt-prompt.md` em `.aiws/references/aiws/`
2. Cole o conteudo como system prompt em um GPT ou Claude chat dedicado
3. O chat ja conhece o sistema, o time e as ferramentas

Exemplos de uso:
\`\`\`
"O que pode causar N+1 nesse modulo?"
"Como justificar essa estimativa para o time?"
"Me ajuda a estruturar esse bug no issue tracker"
"Qual o risco de mudar essa interface agora?"
\`\`\`

O arquivo do prompt fica em `references/` — independente, nao afeta o workspace nem o kernel.

---

# Onboarding para novos membros

1. Leia este guia
2. Leia `references/aiws/generic-blueprint.md` para entender o modelo
3. Olhe uma task concluida em `tasks/done/` como exemplo — mesma estrutura de pasta das tasks ativas
4. Crie sua primeira task e peça: "Start task TK-XXX"

---

# Externalizacao e Sincronizacao

Em alguns projetos, os arquivos de kernel, workspace e AI bridges **nao podem ser commitados** no repositorio da empresa — seja por politica, privacidade ou preferencia.

A solucao e externalizar esses arquivos para uma pasta fora do repo e apontar um sync client (OneDrive, GDrive, GitHub privado) para ela. O projeto recebe **symlinks** — as ferramentas de IA (Claude, Copilot, Cursor) enxergam os arquivos normalmente.

## O que cada argumento externaliza

| Argumento | Arquivos movidos | Symlink criado no projeto |
|---|---|---|
| `--kernel <pasta>` | `.ai/` (pasta inteira) | `.ai/ → <pasta>/.ai/` |
| `--ops <pasta>` | `.aiws/` (pasta inteira) | `.aiws/ → <pasta>/.aiws/` |
| `--bridge <pasta>` | `CLAUDE.md`, `AGENTS.md`, `.github/copilot-instructions.md`, `.cursorrules`, `.windsurfrules` | symlink por arquivo |

Cada argumento e independente — use apenas o que precisar externalizar. Os tres podem apontar para a mesma pasta ou pastas diferentes.

## Como usar

\`\`\`bash
# Externalizar tudo para uma pasta sincronizada
python aiws_install.py --path /repo \
  --kernel C:/OneDrive/aiws-meu-projeto \
  --ops    C:/OneDrive/aiws-meu-projeto \
  --bridge C:/OneDrive/aiws-meu-projeto

# Externalizar apenas o kernel (mais comum — o .aiws/ pode ficar no repo)
python aiws_install.py --path /repo \
  --kernel C:/OneDrive/aiws-meu-projeto \
  --bridge C:/OneDrive/aiws-meu-projeto

# Usar pastas diferentes por tipo
python aiws_install.py --path /repo \
  --kernel C:/OneDrive/kernels/meu-projeto \
  --ops    D:/backup/aiws-ops \
  --bridge C:/OneDrive/bridges/meu-projeto
\`\`\`

## Estrutura resultante

Apos a externalizacao, a pasta externa fica assim:

\`\`\`
C:/OneDrive/aiws-meu-projeto/    ← OneDrive/GDrive sincroniza essa pasta
  .ai/                           ← kernel real
  .aiws/                         ← workspace real
  CLAUDE.md                      ← bridge real
  AGENTS.md
  copilot-instructions.md
  .cursorrules
  .windsurfrules
\`\`\`

E o projeto fica com symlinks:

\`\`\`
seu-projeto/
  .ai/          → C:/OneDrive/aiws-meu-projeto/.ai/
  .aiws/        → C:/OneDrive/aiws-meu-projeto/.aiws/
  CLAUDE.md     → C:/OneDrive/aiws-meu-projeto/CLAUDE.md
  AGENTS.md     → C:/OneDrive/aiws-meu-projeto/AGENTS.md
  .github/copilot-instructions.md → C:/OneDrive/aiws-meu-projeto/copilot-instructions.md
\`\`\`

## Configuracao do .gitignore

Adicione ao `.gitignore` conforme o que for externalizado:

\`\`\`gitignore
# AIWS — arquivos externalizados (symlinks locais, nao commitar)

# Kernel
.ai/

# Workspace operacional
.aiws/tasks/
.aiws/knowledge/
.aiws/runs/
.aiws/references/custom/

# AI Bridges
CLAUDE.md
AGENTS.md
.github/copilot-instructions.md
.cursorrules
.windsurfrules
\`\`\`

> Nao e necessario ignorar tudo — apenas o que foi externalizado ou que contem informacoes sensiveis do projeto. O `.aiws/references/aiws/` (modelo AIWS) pode ser commitado normalmente.

## Qual client de sync usar

| Client | Quando usar |
|---|---|
| **OneDrive** | Ambiente corporativo Windows, ja incluido no Windows |
| **Google Drive** | Ambiente pessoal ou multi-plataforma |
| **GitHub (repo privado)** | Quando quiser historico de versao do kernel e das tasks |
| **Qualquer pasta local** | Backup simples, sem sync automatico |

O script nao tem dependencia de nenhum client especifico — ele apenas move os arquivos e cria os symlinks. O sync e responsabilidade do client escolhido.
