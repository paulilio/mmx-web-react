# agentic-engineering

## Description
Operar como engenheiro agentico: definir criterios de conclusao antes de executar, decompor trabalho em unidades verificaveis, rotear modelos por complexidade, medir com evals.

## When to use
- Tasks que envolvem multiplos modulos ou agentes
- Quando e necessario definir criterios de sucesso antes de implementar
- Refactors ou features com risco de regressao

## Operating Principles
1. Definir criterios de conclusao antes de executar
2. Decompor em unidades de 15 minutos (verificavel, risco unico, done condition clara)
3. Rotear modelos por complexidade:
   - Haiku: classificacao, boilerplate, edicoes pontuais
   - Sonnet: implementacao e refactors
   - Opus: arquitetura, root-cause analysis, invariantes multi-arquivo
4. Medir com evals e regression checks

## Steps
1. Definir capability eval: o que a implementacao deve fazer
2. Definir regression eval: o que nao pode quebrar
3. Decompor a task em unidades seguindo a regra dos 15 minutos
4. Atribuir modelo e done condition para cada unidade
5. Executar unidade por unidade, aguardando aprovacao entre fases criticas
6. Re-executar evals ao final e comparar deltas

## Session Strategy
- Continuar sessao para unidades fortemente acopladas
- Nova sessao apos transicoes de fase major
- Compactar apos milestone, nao durante debugging ativo

## Review Focus (codigo gerado por IA)
Priorizar na revisao:
- Invariantes e edge cases
- Error boundaries
- Assumptions de seguranca e auth
- Acoplamento oculto e rollout risk

NAO desperdicar ciclos de revisao em desacordos de estilo quando lint/format ja enforcea.

## Output
Lista de unidades decompostas com done conditions, modelo atribuido e criterios de eval.
