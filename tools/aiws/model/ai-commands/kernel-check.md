# kernel-check

## Description
Verificar se o Context Kernel precisa de atualizacao apos mudancas no projeto.

## Steps
1. Revisar as mudancas recentes (git diff ou task concluida)
2. Avaliar:
   - Arquitetura do sistema mudou?
   - Novos modulos foram criados?
   - Novos entry points foram criados?
   - Dependencias entre modulos mudaram?
   - Workflow de engenharia mudou?
   - Critical Paths foram afetados?
3. Se nenhuma mudanca estrutural ocorreu, informar: "Kernel atualizado. Nenhuma alteracao necessaria."
4. Se atualizacao for necessaria, informar:
   - Arquivo a atualizar
   - Motivo
   - Alteracao sugerida
5. Aplicar as alteracoes aprovadas pelo usuario

## When to use
- Apos features estruturais
- Apos novos modulos
- Apos mudancas arquiteturais
- Apos criacao de workers, jobs ou APIs

## When NOT to use
- Bug fixes simples
- Refactors pequenos
- Ajustes locais

## Output
Kernel atualizado ou confirmacao de que nenhuma alteracao e necessaria.
