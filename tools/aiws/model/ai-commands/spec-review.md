# spec-review

## Description
Revisao arquitetural de uma spec antes de implementar. Avalia clareza, completude e risco — como um arquiteto senior faria. Use sempre antes de executar uma task capsule com spec definida.

## Steps

1. Ler a spec da task (arquivo `3-spec.md` ou equivalente)
2. Avaliar cada criterio abaixo:

### 1. Clareza do objetivo
O objetivo esta descrito em uma frase clara e sem ambiguidade?

### 2. Escopo definido
O que entra e o que nao entra esta explicito? Ha risco de expansao de escopo?

### 3. Alinhamento arquitetural
A spec respeita a arquitetura do projeto (lida em CODEBASE_MAP.md)?
As responsabilidades estao distribuidas corretamente entre camadas?

### 4. Contratos de dados
Request e response estao definidos? Ha campos ou restricoes faltando?

### 5. Fluxo de execucao
O fluxo logico esta claro e tecnicamente correto?

### 6. Edge cases
Os cenarios de falha estao cobertos? Quais estao faltando?

### 7. Riscos e debito tecnico
Ha riscos ocultos, problemas de performance ou manutencao?

### 8. Complexidade desnecessaria
Alguma parte esta superengenheirada para o que a task exige?

### 9. Detalhes faltando
Quais lacunas podem causar erros na implementacao?

### 10. Prontidao para implementacao
A spec esta pronta para implementar ou precisa de ajustes?

## Output

\`\`\`
## Architecture Review

### Strengths
- [pontos fortes da spec]

### Issues
- [problemas ou fraquezas]

### Missing Elements
- [informacoes que precisam ser adicionadas antes de implementar]

### Architectural Recommendations
- [sugestoes para melhorar o design]

### Implementation Risk Score
[1-10] — [justificativa]
\`\`\`

Se o Risk Score for >= 6, aguardar correcao da spec antes de prosseguir.
