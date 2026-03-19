# BACKLOG: Boot Sequence da IA (Inicialização Estruturada)

## Ideia

Criar um arquivo `.ai/boot-sequence.md` que define a sequência exata de carregamento de contexto quando a IA inicia uma sessão de trabalho.

## Estrutura proposta

```
.ai/boot-sequence.md
```

Sequência:
1. Carregar AGENTS.md (regras operacionais)
2. Carregar .ai/SYSTEM.md (propósito e arquitetura)
3. Carregar .ai/CODEBASE_MAP.md (onde está o código)
4. Identificar task ativa em .aiws/tasks/doing/
5. Carregar 1-task.md da task ativa
6. Carregar context capsule do módulo relevante (se existir)
7. Planejar antes de implementar
8. Executar com checklist de entrega

## Por que fazer

- Hoje a IA depende do CLAUDE.md para saber o que ler primeiro
- Boot sequence torna o processo explícito e auditável
- Reduz chance de a IA começar a implementar sem ter lido o contexto completo
- Facilita onboarding de novos modelos ou ferramentas de IA

## Considerações

- Pode ser integrado ao AGENTS.md em vez de arquivo separado
- Só vale se houver context capsules implementadas (backlog: context-capsules.md)

## Fonte
`to_review/AI Eng WS v3/AI CLI 2 ws entry index cap boot.md`
