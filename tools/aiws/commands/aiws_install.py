#!/usr/bin/env python3
"""
AIWS Install — AI Engineering Workspace
Cria a estrutura completa do AIWS em um repositorio existente,
copiando os modelos de referencia de model/.

Uso:
    python aiws_install.py
    python aiws_install.py --path /caminho/para/o/repo
    python aiws_install.py --dry-run
    python aiws_install.py --force

    # Externalizar para OneDrive/GDrive (cria symlinks no projeto):
    python aiws_install.py --path /repo --kernel C:/OneDrive/aiws-meu-projeto
    python aiws_install.py --path /repo --ops    C:/OneDrive/aiws-meu-projeto
    python aiws_install.py --path /repo --bridge C:/OneDrive/aiws-meu-projeto
    python aiws_install.py --path /repo --kernel C:/OneDrive/aiws-meu-projeto --ops C:/OneDrive/aiws-meu-projeto --bridge C:/OneDrive/aiws-meu-projeto

Argumentos de externalizacao:
    --kernel <pasta>   Move .ai/ para <pasta>/.ai/ e cria symlink no projeto
    --ops    <pasta>   Move .aiws/ para <pasta>/.aiws/ e cria symlink no projeto
    --bridge <pasta>   Move AI bridges para <pasta>/ e cria symlinks no projeto
                       Bridges: CLAUDE.md, AGENTS.md, .github/copilot-instructions.md,
                                .cursorrules, .windsurfrules

O script:
    1. Usa model/ (pasta irma de commands/) como fonte de todos os arquivos
    2. Cria as pastas necessarias no destino
    3. Copia model/ai-commands/ → .ai/commands/
    4. Copia model/templates/   → .aiws/templates/
    5. Copia os guias e comandos AIWS (generic-blueprint, generic-guide-ops, init-*)
    6. Cria os AI Bridges (CLAUDE.md, copilot-instructions.md, .cursorrules)
    7. Cria placeholders para o Context Kernel (.ai/*.md) — a serem preenchidos com IA
    8. (Opcional) Externaliza kernel/.aiws/bridges para pasta externa e cria symlinks

Apos a instalacao, usar os prompts em:
    .aiws/references/aiws/commands/init-kernel.md  <- gerar kernel com IA
    .aiws/references/aiws/commands/init-custom.md  <- gerar arquivos custom
"""

import os
import sys
import shutil
import argparse
from pathlib import Path


# ─── Mapeamento de externalizacao ────────────────────────────────────────────
# Define o que cada argumento externaliza: (pasta_no_projeto, nome_na_externa)
# Para bridges, cada item e um arquivo individual

EXTERNALIZE = {
    "kernel": [
        (".ai", ".ai"),                          # pasta inteira
    ],
    "ops": [
        (".aiws", ".aiws"),                      # pasta inteira
    ],
    "bridge": [
        ("CLAUDE.md",                        "CLAUDE.md"),
        ("AGENTS.md",                        "AGENTS.md"),
        (".github/copilot-instructions.md",  "copilot-instructions.md"),
        (".cursorrules",                     ".cursorrules"),
        (".windsurfrules",                   ".windsurfrules"),
    ],
}


# ─── Pastas a criar no destino ───────────────────────────────────────────────

FOLDERS = [
    ".ai",
    ".aiws/tasks/backlog",
    ".aiws/tasks/done",
    ".aiws/knowledge",
    ".aiws/runs",
    ".aiws/references/aiws/custom",
    ".aiws/references/aiws/commands",
    "docs/adr",
]

# ─── Arquivos copiados de model/ ────────────────────────────────────────────
# model/ fica em: commands/../model/ → referencias/aiws/model/
# src relativo ao script, dst relativo a raiz do destino

COPY_RULES = [
    # Modelos de referencia
    ("../model/ai-commands",    ".ai/commands"),
    ("../model/templates",      ".aiws/templates"),
    # Guias e comandos AIWS
    ("../generic-blueprint.md", ".aiws/references/aiws/generic-blueprint.md"),
    ("../generic-guide-ops.md", ".aiws/references/aiws/generic-guide-ops.md"),
    ("init-kernel.md",          ".aiws/references/aiws/commands/init-kernel.md"),
    ("init-custom.md",          ".aiws/references/aiws/commands/init-custom.md"),
    ("aiws_install.py",         ".aiws/references/aiws/commands/aiws_install.py"),
    # Copiar model/ inteiro para o destino (para futuras re-exportacoes)
    ("../model",                ".aiws/references/aiws/model"),
]

# ─── AI Bridges ─────────────────────────────────────────────────────────────

BRIDGES = {
    "CLAUDE.md": """\
# Context

Read these files in order before any task:

1. .ai/AGENTS.md
2. .ai/SYSTEM.md
3. .ai/CODEBASE_MAP.md
4. .ai/CONTEXT_SURFACES.md

Workspace operacional: .aiws/
""",
    ".github/copilot-instructions.md": """\
# Context

Read these files in order before any task:

1. .ai/AGENTS.md
2. .ai/SYSTEM.md
3. .ai/CODEBASE_MAP.md
4. .ai/CONTEXT_SURFACES.md

Workspace operacional: .aiws/
""",
    ".cursorrules": """\
Read these files in order before any task:
1. .ai/AGENTS.md
2. .ai/SYSTEM.md
3. .ai/CODEBASE_MAP.md
4. .ai/CONTEXT_SURFACES.md

Workspace operacional: .aiws/
""",
}

# ─── Placeholders do Context Kernel ─────────────────────────────────────────
# Criados apenas se nao existirem — a serem preenchidos via init-kernel.md

KERNEL_PLACEHOLDERS = {
    ".ai/AGENTS.md": """\
# AGENTS.md
> Placeholder — preencher com o prompt: .aiws/references/aiws/commands/init-kernel.md (Prompt 1)

## Engineering Principles
- [A ser preenchido]

## Context Reading Order
1. .ai/AGENTS.md
2. .ai/SYSTEM.md
3. .ai/CODEBASE_MAP.md
4. Task file (se aplicavel)
5. .ai/CONTEXT_SURFACES.md

## Code Change Rules
- [A ser preenchido]

## Coding Conventions
- [A ser preenchido]

## Testing Rules
- [A ser preenchido]

## Security Baseline
- [A ser preenchido]

## Validation Checklist
- [ ] [A ser preenchido]

## Documentation Governance
- [A ser preenchido]

## Workspace Operacional
- Tasks: .aiws/tasks/
- Knowledge: .aiws/knowledge/
- Runs: .aiws/runs/
- Templates: .aiws/templates/
- References: .aiws/references/

## Comandos disponíveis
Disponiveis em .ai/commands/. Usar /nome-do-comando para executar.
""",
    ".ai/SYSTEM.md": """\
# SYSTEM.md
> Placeholder — preencher com o prompt: .aiws/references/aiws/commands/init-kernel.md (Prompt 2)

## Purpose
[A ser preenchido]

## Architecture Overview
[A ser preenchido]

## Main Components
- [A ser preenchido]

## Data Flow
[A ser preenchido]

## Tech Stack
- [A ser preenchido]

## Environment Variables
- [A ser preenchido]

## Constraints
- [A ser preenchido]

## Known Limitations
- [A ser preenchido]
""",
    ".ai/CODEBASE_MAP.md": """\
# CODEBASE_MAP.md
> Placeholder — preencher com o prompt: .aiws/references/aiws/commands/init-kernel.md (Prompt 3)

## Module: [nome]
Purpose: [A ser preenchido]
Core files:
  - path/to/file
Entry points:
  - GET /api/endpoint
Dependencies:
  - [modulo]
Tests:
  - tests/module/

---

## Critical Paths

[A ser preenchido]
""",
    ".ai/CONTEXT_SURFACES.md": """\
# CONTEXT_SURFACES.md
> Placeholder — preencher com o prompt: .aiws/references/aiws/commands/init-kernel.md (Prompt 4)

## [Nome] Surface
Core files:
  - path/to/files
Adjacent surfaces:
  - [surface relacionada]
Risk level: High | Medium | Low
Notes: [A ser preenchido]
""",
    ".aiws/README.md": """\
# .aiws — Workspace Operacional

Segue a estrutura **AI Engineering Workspace (AIWS)** — modelo estruturado de desenvolvimento assistido por IA.

Para entender o modelo completo, veja: `references/aiws/generic-blueprint.md`
Para uso no dia a dia, veja: `references/aiws/generic-guide-ops.md`

## Estrutura

| Pasta | Proposito |
|---|---|
| `tasks/` | Tarefas — uma pasta por task, independente da complexidade |
| `tasks/backlog/` | Tasks planejadas, ainda nao iniciadas |
| `tasks/done/` | Tasks concluidas — mesma estrutura das ativas |
| `knowledge/` | Memoria tecnica — investigacoes, conceitos, padroes, decisoes, reviews |
| `runs/` | Historico de execucao de tasks |
| `references/` | Referencias externas e material de pesquisa |
| `references/aiws/` | Guias e arquivos customizados do modelo AIWS |
| `references/aiws/generic-blueprint.md` | Blueprint do modelo AIWS |
| `references/aiws/generic-guide-ops.md` | Guia operacional |
| `references/aiws/commands/aiws_install.py` | Script de instalacao |
| `references/aiws/commands/init-kernel.md` | Prompts para gerar o Context Kernel |
| `references/aiws/commands/init-custom.md` | Prompts para gerar os arquivos custom |
| `references/aiws-custom/` | Arquivos customizados do projeto |
| `templates/` | Templates obrigatorios para artefatos |

## Modelos de trabalho

| Modelo | Quando usar |
|---|---|
| **AI-driven** | Objetivo claro — IA lidera execucao, voce revisa plano, spec e resultado |
| **Pair Programming** | Objetivo claro, arquitetura aberta — decisoes tomadas juntos |
| **AI como Assistente** | Objetivo em formacao, spike, investigacao — voce define cada passo |

## Relacao com outras camadas

- `.ai/` = Context Kernel — como trabalhar, arquitetura, regras
- `.aiws/` = Workspace Operacional — o que fazer, o que foi feito, o que aprendi
""",
    "docs/README.md": """\
# Documentacao Tecnica

Indice navegavel da documentacao do projeto.

## Guias
| Documento | O que cobre |
|---|---|

## ADRs
| ADR | Decisao |
|---|---|

---
> Regra: sempre que um novo documento for criado aqui, adicionar uma entrada neste indice.
""",
}


# ─── Helpers ─────────────────────────────────────────────────────────────────

def make_symlink(src: Path, link: Path, dry_run: bool):
    """Cria symlink em link apontando para src. Remove link existente se necessario."""
    if link.exists() or link.is_symlink():
        if link.is_symlink():
            if not dry_run:
                link.unlink()
        else:
            print(f"  Aviso: {link} ja existe e nao e symlink — pulando.")
            return False

    if not dry_run:
        link.parent.mkdir(parents=True, exist_ok=True)
        link.symlink_to(src, target_is_directory=src.is_dir())
    return True


def externalize(dest: Path, ext_path: Path, mappings: list, dry_run: bool):
    """
    Para cada (projeto_rel, externa_nome) em mappings:
      1. Move o item de dest/projeto_rel para ext_path/externa_nome (se existir)
      2. Cria symlink dest/projeto_rel → ext_path/externa_nome
    Itens que ainda nao existem no projeto sao ignorados (serao criados pelo install
    e o symlink sera criado depois — nesse caso apenas cria o symlink apontando para
    o local externo, mesmo que ainda vazio).
    """
    results = []
    ext_path.mkdir(parents=True, exist_ok=True) if not dry_run else None

    for proj_rel, ext_name in mappings:
        proj_item = dest / proj_rel
        ext_item  = ext_path / ext_name

        # Mover item existente para o externo
        if proj_item.exists() and not proj_item.is_symlink():
            if not dry_run:
                ext_item.parent.mkdir(parents=True, exist_ok=True)
                shutil.move(str(proj_item), str(ext_item))
            results.append(f"  moved  {proj_rel} → {ext_item}")
        elif not ext_item.exists():
            # Item ainda nao existe — sera criado pelo install dentro do externo
            # Garantir que pasta pai existe para o symlink
            if not dry_run:
                ext_item.parent.mkdir(parents=True, exist_ok=True)
            results.append(f"  new    {ext_item} (sera criado pelo install)")

        # Criar symlink no projeto apontando para o externo
        ok = make_symlink(ext_item, proj_item, dry_run)
        if ok:
            results.append(f"  link   {proj_rel} → {ext_item}")

    return results


def copy_item(src: Path, dst: Path, dry_run: bool, force: bool):
    """Copia arquivo ou pasta. Retorna lista de itens copiados e ignorados."""
    copied, skipped = [], []

    if src.is_dir():
        for item in src.rglob("*"):
            if item.is_file():
                rel = item.relative_to(src)
                dst_file = dst / rel
                c, s = copy_item(item, dst_file, dry_run, force)
                copied.extend(c)
                skipped.extend(s)
    elif src.is_file():
        if dst.exists() and not force:
            skipped.append(str(dst))
        else:
            if not dry_run:
                dst.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(src, dst)
            copied.append(str(dst))
    return copied, skipped


# ─── Script principal ────────────────────────────────────────────────────────

def parse_args():
    parser = argparse.ArgumentParser(description="AIWS Install — AI Engineering Workspace")
    parser.add_argument("--path",    default=".", help="Caminho do repositorio destino (default: diretorio atual)")
    parser.add_argument("--dry-run", action="store_true", help="Simular sem criar arquivos")
    parser.add_argument("--force",   action="store_true", help="Sobrescrever arquivos existentes")
    parser.add_argument("--kernel",  default=None, metavar="PASTA", help="Externalizar .ai/ para PASTA e criar symlink")
    parser.add_argument("--ops",     default=None, metavar="PASTA", help="Externalizar .aiws/ para PASTA e criar symlink")
    parser.add_argument("--bridge",  default=None, metavar="PASTA", help="Externalizar AI bridges para PASTA e criar symlinks")
    return parser.parse_args()


def main():
    args = parse_args()
    script_path = Path(__file__).resolve()
    dest = Path(args.path).resolve()

    if not dest.exists():
        print(f"Erro: caminho destino nao encontrado: {dest}")
        sys.exit(1)

    # Verificar que model/ existe ao lado de commands/
    model_path = script_path.parent.parent / "model"
    if not model_path.exists():
        print(f"Erro: pasta model/ nao encontrada em: {model_path}")
        print("Certifique-se de que o script esta em .aiws/references/aiws/commands/")
        sys.exit(1)

    print(f"Fonte (model/): {model_path}")
    print(f"Destino: {dest}")
    if args.dry_run:
        print("Modo: DRY RUN (nenhum arquivo sera criado)")
    if args.force:
        print("Modo: FORCE (arquivos existentes serao sobrescritos)")
    if args.kernel:
        print(f"Kernel externo: {args.kernel}")
    if args.ops:
        print(f"Ops externo:    {args.ops}")
    if args.bridge:
        print(f"Bridge externo: {args.bridge}")

    all_copied, all_skipped = [], []

    # 1. Criar pastas
    created_folders = []
    for folder in FOLDERS:
        full = dest / folder
        if not full.exists():
            if not args.dry_run:
                full.mkdir(parents=True, exist_ok=True)
            created_folders.append(folder)

    # 2. Copiar arquivos de model/ e commands/
    for src_rel, dst_rel in COPY_RULES:
        src = (script_path.parent / src_rel).resolve()
        dst = dest / dst_rel
        if not src.exists():
            print(f"  Aviso: fonte nao encontrado: {src}")
            continue
        c, s = copy_item(src, dst, args.dry_run, args.force)
        all_copied.extend(c)
        all_skipped.extend(s)

    # 3. Criar AI Bridges
    for rel_path, content in BRIDGES.items():
        full = dest / rel_path
        if full.exists() and not args.force:
            all_skipped.append(rel_path)
        else:
            if not args.dry_run:
                full.parent.mkdir(parents=True, exist_ok=True)
                full.write_text(content, encoding="utf-8")
            all_copied.append(rel_path)

    # 4. Criar placeholders do kernel (nunca sobrescrever)
    for rel_path, content in KERNEL_PLACEHOLDERS.items():
        full = dest / rel_path
        if full.exists():
            all_skipped.append(rel_path)
        else:
            if not args.dry_run:
                full.parent.mkdir(parents=True, exist_ok=True)
                full.write_text(content, encoding="utf-8")
            all_copied.append(rel_path)

    # 5. Externalizar (symlinks) — kernel, ops, bridge
    ext_results = []
    for arg_name, mappings in EXTERNALIZE.items():
        ext_folder = getattr(args, arg_name)
        if ext_folder:
            ext_path = Path(ext_folder).resolve()
            results = externalize(dest, ext_path, mappings, args.dry_run)
            ext_results.extend(results)

    # ── Sumario ──────────────────────────────────────────────────────────────
    prefix = "[DRY RUN] " if args.dry_run else ""
    print(f"\n{prefix}AIWS Install — Resultado")
    print("=" * 50)

    if created_folders:
        print(f"\n📁 Pastas criadas ({len(created_folders)}):")
        for f in created_folders:
            print(f"   + {f}/")

    if all_copied:
        print(f"\n📄 Arquivos copiados/criados ({len(all_copied)}):")
        for f in all_copied:
            rel = Path(f).relative_to(dest) if Path(f).is_absolute() else f
            print(f"   + {rel}")

    if all_skipped:
        print(f"\n⏭  Ignorados — ja existem ({len(all_skipped)}):")
        for f in all_skipped:
            print(f"   ~ {f}")
        print("   Use --force para sobrescrever.")

    if ext_results:
        print(f"\n🔗 Externalizacao (symlinks):")
        for r in ext_results:
            print(f"  {r}")

    print("\n" + "=" * 50)
    print("✅ Instalacao concluida!" if not args.dry_run else "🔍 Simulacao concluida.")
    print("\nProximos passos:")
    print("  1. Abra o repositorio no editor com IA (Claude Code, Cursor, Copilot)")
    print("  2. Execute: .aiws/references/aiws/commands/init-kernel.md")
    print("     → Gera o Context Kernel (.ai/) analisando o repositorio")
    print("  3. Execute: .aiws/references/aiws/commands/init-custom.md")
    print("     → Gera os arquivos custom em .aiws/references/aiws-custom/")
    print("  4. Leia .aiws/references/aiws/generic-guide-ops.md para comecar\n")


if __name__ == "__main__":
    main()
