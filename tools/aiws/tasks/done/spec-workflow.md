# DONE: Workflow de Spec e Execução com IA

## O que foi implementado

Modelo de trabalho AI-driven com separação clara de papéis:

- **Humano**: decisões, revisão de plano, revisão de resultado
- **IA**: planejamento técnico, implementação, self-review

Ciclo por task: Context → Plan → Spec → Implementation → Review

## Decisões de design aplicadas

### Spec como instrução de engenharia (não documentação)
Spec boa tem: objetivo em 1 frase, escopo (in/out), arquitetura, contratos de dados, fluxo de execução, edge cases, critérios de aceite. Tamanho ideal: 500–800 palavras para feature média.

### Workflow de 5 prompts
1. Context — IA entende o projeto
2. Planning — design técnico
3. Spec — especificação executável
4. Implementation — código
5. Self-review — validação automática

Resultado esperado: 30–90 min por feature vs. 3–6 horas manual.

### Checklist de revisão de spec (10 pontos)
Objetivo claro, escopo definido, estrutura técnica, contratos de dados, fluxo de execução, edge cases, testes, riscos técnicos, impacto no sistema, critério de aceite.

## Fonte
Consolidado a partir de: `ro_review_2/analise_prompts.md`, `ro_review_2/analise_spec.md`, `ro_review_2/analise_specs_prompts.md`, `ro_review_2/analise_esforco_manual_3.md`
