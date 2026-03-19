# ship

## Description
Preparar e enviar as mudancas para o repositorio remoto. Gerar descricoes para PR e Jira.

## Steps
1. Executar regression-check (se nao foi feito ainda)
2. Revisar git status — verificar arquivos staged e unstaged
3. Criar commit com mensagem descritiva
4. Push para o branch atual
5. Gerar descricoes (ver Output Templates abaixo)
6. Criar pull request se aplicavel (gh pr create)
7. Informar o usuario com link do PR e descricao para Jira

## Output
Commit criado, push feito, PR aberto (se aplicavel).
Alem disso, gerar as descricoes abaixo para o usuario copiar.

## Output Templates

### PR Description
\`\`\`markdown
## Summary
[1-3 bullet points do que foi feito]

## Changes
- [Lista de mudancas relevantes]

## Code Surface
- [Arquivos principais modificados]

## Testing
- [ ] Unit tests
- [ ] Integration tests
- [ ] Regression check

## Related
- Task: TK-XXX
- Jira: [ticket se houver]
\`\`\`

### Jira Comment
\`\`\`markdown
## O que foi feito
[Resumo curto das mudancas — 2-3 frases]

## Detalhes tecnicos
- [Mudancas relevantes para o time]

## PR
[Link do PR]

## Proximos passos
- [Pendencias ou acoes futuras, se houver]
\`\`\`
