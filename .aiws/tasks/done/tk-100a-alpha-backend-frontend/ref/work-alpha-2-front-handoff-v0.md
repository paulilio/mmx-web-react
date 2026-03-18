# Handoff para v0 - Execucao Frontend Alpha

Data de referencia: 2026-03-11
Objetivo: executar backlog frontend minimo para liberar Alpha testavel.

## 2. Regras obrigatorias para execucao

1. Nao criar caminho paralelo de dados fora de hooks/** + lib/client/api.ts.
2. Nao usar fallback automatico para mock em NEXT_PUBLIC_USE_API=true.
3. Nao editar components/ui/**.
4. Preservar mensagens de erro amigaveis em portugues.
5. Preservar comportamento de auth e protecao de rotas atual.

## 3. Backlog pronto para execucao (P0)

### P0-01 - Auth e sessao (API mode)
- confirmar estabilidade de login/logout/refresh
- confirmar tratamento de expiracao de sessao e conectividade
- Criterios: sem token valido fluxo protegido responde corretamente; refresh sem dependencia de sessao local

### P0-02 - Transacoes + dashboard
- validar CRUD de transacoes no fluxo principal
- garantir reflexo correto nos cards de dashboard

### P0-03 - Categorias, grupos e contatos
- validar CRUD funcional dos tres dominios no frontend

### P0-04 - Budget principal
- validar fluxo principal via use-budget-allocations
- cobrir add funds, transfer funds e rollover

### P0-05 - Settings maintenance
- validar import/export/clear via rotas first-party
- nenhum bypass direto de storage na pagina

## 6. Smoke test obrigatorio (final)

Executar em NEXT_PUBLIC_USE_API=true:
1. Login valido e invalido
2. Refresh e logout
3. CRUD de transacoes
4. CRUD de categorias/grupos/contatos
5. Add funds, transfer e rollover
6. Import/export/clear em settings
