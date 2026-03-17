# task-done

## Description
Finalizar uma task. Registrar execucao e mover para done.

## Steps
1. Verificar que todos os itens do Plan estao marcados como concluidos
2. Criar registro de execucao em .ws-dev/runs/ usando template .ws-dev/templates/run.md
3. Mover task de .ws-dev/tasks/ para .ws-dev/tasks/done/
4. Avaliar se houve aprendizado tecnico relevante usando as perguntas abaixo:
   - Foi dificil entender? Exigiu investigacao de logs ou multiplos modulos? → knowledge/inv-*.md
   - Explica como o sistema funciona? Revela fluxo ou relacao entre componentes? → knowledge/con-*.md
   - Pode ser reutilizado como padrao de implementacao? → knowledge/pat-*.md
   - Houve escolha entre opcoes com trade-off? → knowledge/dec-*.md
   - Usuario pediu revisao do que foi feito? → knowledge/rev-*.md (sob demanda)
   - Se nenhuma condicao for verdadeira: nao gerar documento
5. Se a task envolveu mudancas estruturais, executar kernel-check (.ai/commands/kernel-check.md)
6. Informar o usuario que a task foi finalizada

## Output
Task movida para done/, run registrado, knowledge criado se aplicavel, kernel verificado se aplicavel.
