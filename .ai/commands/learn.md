# learn

## Description
Analisar a sessao atual e extrair padroes reutilizaveis que valem ser salvos como conhecimento tecnico.

## When to use
- Apos resolver um problema nao-trivial na sessao
- Quando a solucao envolveu investigacao de logs, multiplos modulos ou decisoes de trade-off
- Quando o padrao pode evitar retrabalho futuro

## When NOT to use
- Fixes triviais (typos, erros de sintaxe simples)
- Problemas pontuais que nao se repetem (outage de API, etc.)

## Steps
1. Revisar o contexto da sessao atual: o que foi resolvido, como foi resolvido
2. Avaliar se o aprendizado e reutilizavel usando os criterios:
   - Foi dificil entender? Exigiu investigacao? → `knowledge/inv-*.md`
   - Explica como o sistema funciona? → `knowledge/con-*.md`
   - Pode ser reutilizado como padrao? → `knowledge/pat-*.md`
   - Houve escolha com trade-off? → `knowledge/dec-*.md`
3. Se nenhum criterio for satisfeito: nao gerar documento
4. Rascunhar o artefato de conhecimento usando o template em `.aiws/templates/`
5. Apresentar o rascunho ao usuario para aprovacao antes de salvar
6. Salvar em `.aiws/knowledge/` com nome adequado
7. Executar `kernel-check` (.ai/commands/kernel-check.md) — verificar se o que foi aprendido implica atualizacao do kernel
8. Executar `update-docs` (.ai/commands/update-docs.md) — verificar e atualizar READMEs, docs/, guides e CODEBASE_MAP

## Output
Artefato de conhecimento criado em `.aiws/knowledge/` (se aplicavel) + kernel verificado + documentacao atualizada.
