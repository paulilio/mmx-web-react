# Etapa 2 - Readiness Frontend para Alpha

Data de referencia: 2026-03-11
Camada: Operacional
Origem: Etapa 2 do roadmap Alpha

## 1. Objetivo

Definir e executar o escopo minimo de frontend para liberar testes Alpha com baixa ambiguidade para implementacao pelo v0.

## 2. Guardrails obrigatorios

- Seguir fluxo client: app/** -> components/** -> hooks/** -> lib/client/api.ts
- Nao acessar storage/localStorage diretamente em tela para dados de feature
- Preservar contrato de erro em API mode (ApiError) sem fallback automatico para mock
- Preservar mensagens amigaveis em portugues
- Nao editar components/ui/**

## 3. Escopo por prioridade

## P0 - Obrigatorio para Alpha

1. Auth e sessao estaveis em API mode
2. Fluxo principal de transacoes (CRUD + dashboard)
3. Fluxos de cadastros base (categorias, grupos, contatos)
4. Fluxo principal de budget (add funds, transfer, rollover via use-budget-allocations)
5. Settings maintenance via first-party API (import, export, clear)

## P1 - Importante (entra se houver capacidade)

1. Melhorias de UX em estados de loading/erro para telas de P0
2. Cobertura adicional de testes de componente para modais criticos de budget
3. Ajustes de consistencia visual e mensagens de validacao

## P2 - Pos-Alpha

1. Refino de UX nao bloqueante
2. Incrementos de produtividade
3. Limpeza adicional de legado nao critico

## 5. Gate de saida da Etapa 2

A etapa frontend so fecha quando:
1. Todos os itens P0 estiverem concluidos
2. Nao houver bloqueador funcional em jornada principal
3. Smoke test P0 passar em API mode
4. Nao houver regressao arquitetural nos guardrails
