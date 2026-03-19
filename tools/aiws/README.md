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

A instalacao e feita inteiramente via IA — sem scripts, sem dependencias externas.
Funciona com Claude Code, Cursor ou GitHub Copilot.

### Passo 1 — Copiar os arquivos do AIWS

Copie a pasta `tools/aiws/` para dentro do seu projeto:

```
seu-projeto/tools/aiws/
```

### Passo 2 — Executar a instalacao via IA

Abra o repositorio no editor com IA e siga as 3 etapas do arquivo de instalacao:

```
tools/aiws/commands/install.md
```

| Etapa | O que faz |
|---|---|
| 1 — Backup | Copia `.ai/` e AI bridges existentes para `.aiws-backup/` |
| 2 — Estrutura | Cria toda a estrutura AIWS (pastas, arquivos base, bridges) |
| 3 — Migracao | Move conteudo do backup para os lugares certos na nova estrutura |

### Passo 3 — Gerar o Context Kernel com IA

Execute os prompts em sequencia:

```
tools/aiws/commands/init-kernel.md
```

| Prompt | Arquivo gerado | Conteudo |
|---|---|---|
| 1 | `.ai/AGENTS.md` | Regras operacionais — como a AI deve trabalhar |
| 2 | `.ai/SYSTEM.md` | Arquitetura e proposito do sistema |
| 3 | `.ai/CODEBASE_MAP.md` | Mapa modular do codigo |
| 4 | `.ai/CONTEXT_SURFACES.md` | Superficies de impacto de mudanca |
| Validacao | — | Verifica consistencia do kernel gerado |

### Passo 4 — Gerar os arquivos custom do projeto

```
tools/aiws/commands/init-custom.md
```

| Prompt | Arquivo gerado | Conteudo |
|---|---|---|
| 1 | `references/aiws/aiws-guide.md` | Guia de uso do workspace adaptado ao projeto |
| 2 | `references/aiws/gpt-prompt.md` | System prompt para chat GPT/Claude dedicado |
| 3 | `references/aiws/v0-instructions.md` | Instrucoes para v0 (Vercel) — colar em Project Knowledge |

### Passo 5 — Comecar a usar

Leia `tools/aiws/generic-guide-ops.md` para entender como criar tasks, executar comandos e escolher o modelo de trabalho adequado.

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
