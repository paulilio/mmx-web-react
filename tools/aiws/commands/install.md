# AIWS Install — Instalação via IA (Claude Code / Copilot)

Instala a estrutura AIWS em qualquer repositório usando IA como executor.
Funciona com Claude Code, Cursor ou GitHub Copilot.

---

## Etapa 1 — Backup dos arquivos existentes

> Se o projeto já tiver `.ai/` ou arquivos de AI bridge (CLAUDE.md, copilot-instructions.md, .cursorrules), faça backup antes de continuar.

Cole este prompt na IA:

```
Verifique se existem os seguintes arquivos/pastas neste repositório:
- .ai/ (pasta)
- CLAUDE.md
- .github/copilot-instructions.md
- .cursorrules
- AGENTS.md (na raiz)

Para cada um que existir, copie para .aiws-backup/<nome-original> preservando a estrutura.
Exemplo: .ai/ → .aiws-backup/ai/, CLAUDE.md → .aiws-backup/CLAUDE.md

Se nenhum existir, informe e prossiga para a Etapa 2.
Ao final, liste o que foi copiado.
```

---

## Etapa 2 — Criar a estrutura AIWS

Cole este prompt na IA:

```
Crie a estrutura completa do AI Engineering Workspace (AIWS) neste repositório.

Estrutura a criar:

.ai/
  AGENTS.md          (arquivo vazio — será preenchido no init-kernel)
  SYSTEM.md          (arquivo vazio)
  CODEBASE_MAP.md    (arquivo vazio)
  CONTEXT_SURFACES.md (arquivo vazio)
  commands/          (copiar de tools/aiws/model/ai-commands/)

.aiws/
  README.md          (copiar de tools/aiws/generic-guide-ops.md como base)
  knowledge/
    README.md        (arquivo vazio — descreve como usar a pasta)
    product/
    architecture/
    ops/
  tasks/
    backlog/
    doing/
    done/
  references/
    aiws/
  runs/
  templates/         (copiar de tools/aiws/model/templates/)

Arquivos de bridge na raiz:
  CLAUDE.md          — com conteúdo: "# Context\n\nRead these files in order before any task:\n\n1. .ai/AGENTS.md\n2. .ai/SYSTEM.md\n3. .ai/CODEBASE_MAP.md\n4. .ai/CONTEXT_SURFACES.md\n\nWorkspace operacional: .aiws/"
  .github/copilot-instructions.md — com conteúdo apontando para .ai/ (mesmo padrão do CLAUDE.md)

Adicionar ao .gitignore (se não existir):
  .aiws-backup/
  .aiws/runs/
  runtime/

Ao final, liste todos os arquivos e pastas criados.
```

---

## Etapa 3 — Migrar conteúdo do backup para a nova estrutura

> Execute apenas se a Etapa 1 encontrou arquivos existentes.

Cole este prompt na IA:

```
O backup dos arquivos originais está em .aiws-backup/.

Migre o conteúdo para a nova estrutura AIWS seguindo estas regras:

1. .aiws-backup/ai/AGENTS.md (se existir)
   → Extraia as seções relevantes (Engineering Principles, Code Rules, Conventions)
   → Incorpore no novo .ai/AGENTS.md, preservando o formato do template AIWS
   → Não sobrescreva — mescle o conteúdo relevante

2. .aiws-backup/ai/SYSTEM.md (se existir)
   → Copie o conteúdo para .ai/SYSTEM.md
   → Ajuste apenas se o formato for incompatível com o template AIWS

3. .aiws-backup/ai/CODEBASE_MAP.md (se existir)
   → Copie o conteúdo para .ai/CODEBASE_MAP.md

4. .aiws-backup/ai/CONTEXT_SURFACES.md (se existir)
   → Copie o conteúdo para .ai/CONTEXT_SURFACES.md

5. .aiws-backup/CLAUDE.md (se existir)
   → Verifique se tinha instruções além do ponteiro para .ai/
   → Se sim, mova instruções relevantes para .ai/AGENTS.md
   → O novo CLAUDE.md deve ser apenas o ponteiro padrão AIWS

6. .aiws-backup/copilot-instructions.md (se existir)
   → Mesmo tratamento do CLAUDE.md acima

Ao final:
- Liste o que foi migrado e para onde
- Liste o que foi descartado (e por quê)
- Confirme que .aiws-backup/ ainda está intacto como referência
```

---

## Próximo passo

Com a estrutura criada e o backup migrado, execute os prompts de geração do Context Kernel:

```
tools/aiws/commands/init-kernel.md
```

Em seguida, gere os arquivos customizados do projeto:

```
tools/aiws/commands/init-custom.md
```
