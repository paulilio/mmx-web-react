# update-docs

## Description
Verificar e atualizar toda a documentacao afetada pelas mudancas da sessao: READMEs, docs/, guides, CODEBASE_MAP e bridges de IA.

Consolida as responsabilidades de `update-docs` e `update-codemaps` em um unico comando.

## When to use
- Apos qualquer mudanca que afete arquitetura, contratos, seguranca, modulos ou runtime
- Como parte do ciclo `/learn` (passo final)
- Antes de finalizar um PR com mudancas estruturais

## When NOT to use
- Bugfixes locais sem impacto em contratos ou estrutura
- Ajustes de UI sem mudanca de comportamento

## Steps

### 1. Avaliar escopo da mudanca
Classificar o que foi alterado:
- Arquitetura ou modulos novos → atualizar `docs/architecture/`, `.ai/CODEBASE_MAP.md`, `.ai/SYSTEM.md`
- Contratos de API → atualizar `docs/architecture/api-contracts.md`
- Seguranca ou auth → atualizar `docs/architecture/architecture.md`, `.ai/AGENTS.md` secao Security Baseline
- Runtime ou infra → atualizar `docs/ops/`, `.ai/SYSTEM.md`
- Fluxo de onboarding → atualizar `docs/onboarding/`

### 2. Atualizar CODEBASE_MAP (se estrutural)
- Novos modulos, pastas ou entry points → refletir em `.ai/CODEBASE_MAP.md`
- Remocao de modulos ou paths → limpar referencias obsoletas
- Mudanca em critical paths → atualizar secao correspondente

### 3. Atualizar docs/
- Atualizar os arquivos identificados no passo 1
- Atualizar `docs/README.md` se algum documento foi adicionado ou removido

### 4. Atualizar bridges de IA
- `.ai/AGENTS.md` — se convencoes, regras arquiteturais ou security baseline mudaram
- `CLAUDE.md` — se novos commands ou bridges foram criados
- `.github/copilot-instructions.md` — manter em sincronia com CLAUDE.md

### 5. Executar checklist
Usar `docs/governance/documentation-governance-checklist.md` como verificacao final.
Para cada item nao aplicavel: registrar justificativa curta.

## Output
Lista de arquivos atualizados + confirmacao do checklist de governance.
