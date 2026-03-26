## Arquitetura `aiws-castler`

```
aiws-castler/                              ← repo Git dedicado (fonte de verdade shared)
│
├── README.md                              ← como usar, como linkar em projetos
│
├── kernel/                                ← specs canônicas (lidas por qualquer AI)
│   ├── commands/                          ← 14 commands genéricos
│   │   ├── ship.md
│   │   ├── learn.md
│   │   ├── regression-check.md
│   │   ├── checkpoint.md
│   │   ├── kernel-check.md
│   │   ├── update-docs.md
│   │   ├── agentic-engineering.md
│   │   ├── start-task.md
│   │   ├── task-loop.md
│   │   ├── task-plan.md
│   │   ├── task-done.md
│   │   ├── write-tests.md
│   │   ├── analyze-task.md
│   │   └── spec-review.md
│   ├── rules/                             ← regras sem digital de projeto
│   │   ├── typescript.md
│   │   ├── security.md                    ← (a criar)
│   │   └── git.md                         ← (a criar)
│   └── templates/                         ← templates de artefatos .aiws/ (task, run, knowledge...)
│       ├── task.md
│       ├── run.md
│       ├── concept.md
│       ├── decision.md
│       ├── investigation.md
│       ├── pattern.md
│       ├── review.md
│       └── task-capsule/
│
├── claude/                                ← wrappers nativos Claude Code CLI
│   ├── settings.json                      ← hooks globais (block-no-verify, auto-format...)
│   └── commands/                          ← 14 wrappers .md (delegam para kernel/)
│       ├── ship.md
│       └── ...
│
└── copilot/                               ← wrappers nativos GitHub Copilot
    └── prompts/                           ← 14 wrappers .prompt.md (delegam para kernel/)
        ├── ship.prompt.md
        └── ...
```

---

## Como um projeto consome o `aiws-castler`

```
projeto-mmx/
│
├── .ai/                                   ← kernel do projeto (digital MMX)
│   ├── AGENTS.md                          ← próprio
│   ├── SYSTEM.md                          ← próprio
│   ├── CODEBASE_MAP.md                    ← próprio
│   ├── CONTEXT_SURFACES.md                ← próprio
│   ├── commands/   ─────────────────────── symlink → aiws-castler/kernel/commands/
│   ├── rules/      ─────────────────────── symlink → aiws-castler/kernel/rules/
│   ├── templates/  ─────────────────────── symlink → aiws-castler/kernel/templates/
│   └── commands-project/                  ← commands com digital MMX
│       ├── performance-check-custom-mmx.md
│       └── security-check-custom-mmx.md
│
├── .claude/
│   ├── settings.json                      ← próprio (hooks específicos do projeto)
│   └── commands/  ──────────────────────── symlink → aiws-castler/claude/commands/
│
└── .github/
    ├── copilot-instructions.md            ← próprio (bridge do projeto)
    └── prompts/   ──────────────────────── symlink → aiws-castler/copilot/prompts/
```

---

## Como o AGENTS.md referencia o castler

```markdown
## Shared Layer (aiws-castler)
Commands genéricos e rules de linguagem vivem em aiws-castler e são
linkados via symlink. Leia antes de qualquer task:
- .ai/commands/        → aiws-castler/kernel/commands/
- .ai/rules/           → aiws-castler/kernel/rules/
- .ai/templates/       → aiws-castler/kernel/templates/

Commands específicos deste projeto:
- .ai/commands-project/ → sem symlink, digital MMX
```

---

## Fluxo de atualização

```
# 1. Edita o command no castler
aiws-castler/kernel/commands/ship.md

# 2. Commit + push
git commit -m "feat: improve ship workflow"
git push

# 3. Todos os projetos com symlink já veem — sem ação adicional

# 4. Wrappers Claude e Copilot também são symlinks
#    → atualizam automaticamente junto com o kernel
```

---

## Inicialização de um projeto novo

```bash
# 1. Clonar o castler em local fixo na máquina
git clone https://github.com/pauli/aiws-castler ~/aiws-castler

# 2. No projeto, criar symlinks
ln -s ~/aiws-castler/kernel/commands    .ai/commands
ln -s ~/aiws-castler/kernel/rules       .ai/rules
ln -s ~/aiws-castler/kernel/templates   .ai/templates
ln -s ~/aiws-castler/claude/commands    .claude/commands
ln -s ~/aiws-castler/copilot/prompts    .github/prompts

# 3. Criar os arquivos próprios do projeto
# .ai/AGENTS.md, SYSTEM.md, CODEBASE_MAP.md, CONTEXT_SURFACES.md
# .ai/commands-project/ (commands com digital do projeto)
# .claude/settings.json (hooks do projeto)
# .github/copilot-instructions.md
```

---

O próximo passo natural é criar o repositório `aiws-castler` com os artefatos que já existem aqui no MMX — os 14 commands genéricos, a rule de TypeScript, os wrappers Claude e Copilot. O MMX seria o primeiro projeto a consumir via symlink.
