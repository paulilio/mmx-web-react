# MoedaMix - Fase 2 (Core Features)

Data de referencia: 2026-03-09
Status geral estimado: 28%

## Status por PR

| PR | Tema | Status | Progresso |
|---|---|---|---|
| PR-10 | Contas bancarias (CRUD de contas corrente/poupanca/cartao) | Inicial | 10% |
| PR-11 | Transferencias entre contas bancarias | Parcial inicial | 20% |
| PR-12 | Relatorios avancados + exportacao (PDF/Excel) | Parcial avancado | 45% |
| PR-13 | Notificacoes de vencimento/limite | Parcial inicial | 20% |
| PR-14 | Busca global unificada | Parcial | 35% |
| PR-15 | Importacao OFX/CSV de extratos | Inicial | 5% |

## Plano de execucao (blocos)

Bloco A - Dominio de contas (base para fase toda):
1. Modelagem + repositorio + servico + endpoints de contas
2. Hook client e pagina inicial de contas
3. Testes unitarios/integracao do CRUD de contas

Bloco B - Transferencias bancarias:
1. Casos de uso de transferencia entre contas com consistencia de saldo
2. Endpoint e validacoes
3. UI de transferencia e feedback de erro/sucesso

Bloco C - Relatorios e exportacao:
1. Consolidar tela de relatorios
2. Implementar exportacao PDF e Excel

Bloco D - Notificacoes + busca global:
1. Motor simples de regras e feed in-app
2. Busca global unificada com endpoint dedicado

Bloco E - Importacao OFX/CSV:
1. Parser e normalizacao
2. Preview + confirmacao
3. Idempotencia/deduplicacao + trilha de auditoria

## Recomendacao de proximo passo

1. Iniciar por PR-10 (dominio de contas) como fundacao obrigatoria.
2. Encadear PR-11 (transferencias bancarias) imediatamente apos CRUD de contas.
3. Fechar PR-12 em paralelo.
4. Tratar PR-13, PR-14 e PR-15 em trilha incremental.
