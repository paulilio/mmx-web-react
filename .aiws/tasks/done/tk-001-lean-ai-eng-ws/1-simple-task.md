# TK-001: Lean AI Engineering Workspace

## Objective
Estruturar e validar o Lean AI Engineering Workspace do projeto MMX.

## Context
O projeto precisa de uma estrutura que permita colaboracao eficiente com multiplas IAs (Claude, Copilot, Codex) sem duplicacao de contexto. A referencia do modelo esta em `.aiws/references/lean-ai-eng-ws.md`.

## Scope
- [x] Definir modelo do Lean AI Engineering Workspace
- [x] Criar Context Kernel em .ai/ (AGENTS, SYSTEM, CODEBASE_MAP, CONTEXT_SURFACES)
- [x] Criar AI Bridges (CLAUDE.md, AGENTS.md raiz, copilot-instructions.md)
- [x] Criar Workspace Operacional (.aiws/)
- [x] Migrar conteudo dos 6 arquivos antigos para os 4 novos
- [x] Salvar referencia do ZeroPaper em .aiws/references/
- [x] Atualizar documento de referencia lean-ai-eng-ws.md
- [x] Validar que nenhuma informacao foi perdida na migracao
- [x] Revisar CONTEXT_SURFACES.md com dados reais do codigo
- [x] Revisar CODEBASE_MAP.md com paths reais verificados
- [x] Commit final

## Code Surface
- .ai/AGENTS.md
- .ai/SYSTEM.md
- .ai/CODEBASE_MAP.md
- .ai/CONTEXT_SURFACES.md
- CLAUDE.md
- AGENTS.md
- .github/copilot-instructions.md
- .aiws/

## Constraints
- Zero duplicacao entre ferramentas de IA
- Fonte unica de verdade no .ai/
- Estrutura lean — subpastas so quando necessario

## Validation
- Todos os 4 arquivos do kernel existem e tem conteudo completo
- Pontes apontam corretamente para .ai/
- Nenhum conteudo dos arquivos antigos foi perdido
- Paths no CODEBASE_MAP correspondem a arquivos reais

## Definition of Done
- Context Kernel funcional e validado
- AI Bridges configurados para Claude e Copilot
- Workspace operacional com estrutura minima ativa
- Documento de referencia atualizado
- Commit limpo
