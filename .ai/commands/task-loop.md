# task-loop

## Description
Loop unico para tasks simples. Executa o ciclo completo: entender, planejar, implementar, validar, registrar.

## When to use
- Bugfixes simples e isolados
- Chores (atualizar deps, limpar codigo, ajustes pequenos)
- Tasks com escopo claro e sem trade-offs

## When NOT to use
- Features novas com decisoes arquiteturais
- Spikes ou investigacoes
- Refactors estruturais (usar comandos separados + kernel-check)

## Steps
1. **Understand** — Ler o Context Kernel (.ai/AGENTS.md → SYSTEM.md → CODEBASE_MAP.md), ler a task, resumir objective e code surface
2. **Plan** — Produzir plano minimo e seguro. Listar arquivos a modificar e possiveis regressoes
3. **Implement** — Implementar seguindo o plano. Manter mudancas minimas. Evitar modificacoes nao relacionadas
4. **Validate** — Executar regression-check (pnpm test:unit, lint, type-check, build)
5. **Record** — Criar run em .ws-dev/runs/ usando template .ws-dev/templates/run.md
6. **Finalize** — Mover task para .ws-dev/tasks/done/. Se houve aprendizado, criar artefato em .ws-dev/knowledge/

## Output
Task concluida, validada, run registrado, task movida para done/.
