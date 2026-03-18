# AI Engineering Workspace (AIWS)

Estrutura padronizada de projeto para desenvolvimento assistido por IA.

Permite que engenheiros e agentes de IA entendam rapidamente o sistema, executem tarefas com seguranca e mantenham rastreabilidade tecnica sem burocracia.

---

## O que e o AIWS

O AIWS organiza o trabalho em tres camadas:

| Camada | Pasta | Funcao |
|---|---|---|
| **Context Kernel** | `.ai/` | Explica o sistema — fonte unica de verdade para qualquer AI |
| **AI Bridges** | `CLAUDE.md`, `copilot-instructions.md`, `.cursorrules` | Ponteiros que direcionam cada AI para o kernel |
| **Workspace Operacional** | `.aiws/` | Onde o trabalho acontece — tasks, runs, knowledge, referencias |

---

## Instalacao

### Requisitos

- Python 3.8+
- Repositorio git existente (pode estar vazio)

### Passo 1 — Copiar os arquivos do AIWS

Copie a pasta `references/aiws/` (este repositorio) para dentro do seu projeto em:

```
seu-projeto/.aiws/references/aiws/
```

### Passo 2 — Executar o script de instalacao

```bash
# Instalar no diretorio atual
python .aiws/references/aiws/commands/aiws_install.py

# Opoes basicas
python aiws_install.py --path /repo   # outro repositorio
python aiws_install.py --dry-run      # simular sem criar arquivos
python aiws_install.py --force        # sobrescrever existentes
```

O script cria toda a estrutura de pastas e arquivos base — placeholders prontos para preencher com IA.

#### Externalizacao para sincronizacao (OneDrive / GDrive / GitHub)

Para manter kernel, workspace e bridges **fora do repositorio** (backup, sync, privacidade):

```bash
python aiws_install.py --path /repo \
  --kernel C:/OneDrive/aiws-meu-projeto \
  --ops    C:/OneDrive/aiws-meu-projeto \
  --bridge C:/OneDrive/aiws-meu-projeto
```

Os arquivos vivem na pasta externa. O projeto recebe symlinks — as ferramentas de IA funcionam normalmente.
Aponte o OneDrive, GDrive ou qualquer sync client para a pasta externa.

Cada argumento e independente — use apenas o que precisar externalizar.
Para detalhes e configuracao do `.gitignore`, veja `generic-guide-ops.md`.

### Passo 3 — Gerar o Context Kernel com IA

Abra o repositorio no editor com IA (Claude Code, Cursor, Copilot) e execute os prompts em sequencia:

```
.aiws/references/aiws/commands/init-kernel.md
```

Contem 4 prompts — um para cada arquivo do kernel:

| Prompt | Arquivo gerado | Conteudo |
|---|---|---|
| 1 | `.ai/AGENTS.md` | Regras operacionais — como a AI deve trabalhar |
| 2 | `.ai/SYSTEM.md` | Arquitetura e proposito do sistema |
| 3 | `.ai/CODEBASE_MAP.md` | Mapa modular do codigo |
| 4 | `.ai/CONTEXT_SURFACES.md` | Superficies de impacto de mudanca |
| Validacao | — | Verifica consistencia do kernel gerado |

### Passo 4 — Gerar os arquivos custom do projeto

```
.aiws/references/aiws/commands/init-custom.md
```

Contem 3 prompts independentes (executar na ordem ou conforme necessidade):

| Prompt | Arquivo gerado | Conteudo |
|---|---|---|
| 1 | `references/aiws-custom/custom-workspace-guide.md` | Guia de uso do workspace adaptado ao projeto |
| 2 | `references/aiws-custom/custom-gpt-prompt.md` | System prompt para chat GPT/Claude dedicado |
| 3 | `references/aiws-custom/custom-v0-instructions.md` | Instrucoes para v0 (Vercel) — colar em Project Knowledge |

### Passo 5 — Comecar a usar

Leia `.aiws/references/aiws/generic-guide-ops.md` para entender como criar tasks, executar comandos e escolher o modelo de trabalho adequado.

---

## Conteudo deste repositorio

```
references/aiws/
  README.md                        ← este arquivo
  generic-blueprint.md             ← blueprint completo: estrutura, camadas, governanca
  generic-guide-ops.md             ← guia operacional: tasks, comandos, pipelines
  commands/
    aiws_install.py                ← script de instalacao
    init-kernel.md                 ← prompts para gerar o Context Kernel com IA
    init-custom.md                 ← prompts para gerar arquivos custom do projeto
  model/
    ai-commands/                   ← comandos base prontos para uso (.ai/commands/)
    templates/                     ← templates de task, spec, run, knowledge
```

> `references/aiws-custom/` nao faz parte deste repositorio — e gerado por projeto, conforme necessidade.

---

## Documentacao

| Arquivo | O que cobre |
|---|---|
| [generic-blueprint.md](generic-blueprint.md) | Estrutura completa, checklist de setup, camadas, governanca de pastas |
| [generic-guide-ops.md](generic-guide-ops.md) | Como criar tasks, executar comandos, modelos de trabalho, pipelines |
| [commands/init-kernel.md](commands/init-kernel.md) | Prompts para gerar o Context Kernel com IA |
| [commands/init-custom.md](commands/init-custom.md) | Prompts para gerar arquivos customizados do projeto |
