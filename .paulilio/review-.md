# Revisao Tecnica Detalhada - MMX Web React

## Escopo da revisao
- Analise de estrutura, configuracoes e codigo fonte (app, hooks, lib, components).
- Foco em: bugs funcionais, riscos de seguranca, consistencia de contratos, confiabilidade e manutencao.
- Metodo: leitura de arquivos criticos + varredura de padroes de risco no workspace.

## Achados Prioritarios (ordem de criticidade)

### 1) Critico - Build permite ir para producao com erro de TypeScript e ESLint
- Evidencia: `next.config.mjs:4` (`ignoreBuildErrors: true`), `next.config.mjs:11` (`ignoreDuringBuilds: true`).
- Impacto: regressao silenciosa em producao; bugs de tipagem e qualidade passam sem bloqueio.
- Ajuste recomendado:
	- Definir ambos como `false`.
	- Fazer o CI falhar em `pnpm tsc --noEmit` e `pnpm lint`.

### 2) Critico - Autenticacao mock exposta com dados sensiveis e segredos hardcoded
- Evidencias:
	- Loga senha em texto puro: `hooks/use-auth.tsx:74`, `hooks/use-auth.tsx:86`, `hooks/use-auth.tsx:93`.
	- Armazena senha em texto puro: `hooks/use-auth.tsx:232`.
	- Token/codigo hardcoded: `hooks/use-auth.tsx:302` (`RESET-123`), `hooks/use-auth.tsx:333` (`XPX-7F5G`).
	- Login direto com senha fixa: `app/auth/page.tsx:90`.
	- Exposicao visual dos codigos de teste: `app/auth/confirm/page.tsx:151`, `app/auth/reset-password/page.tsx:181`.
- Impacto: risco alto de vazamento de credencial, bypass de fluxo de autenticacao e comportamento inseguro em ambiente real.
- Ajuste recomendado:
	- Remover logs de credenciais imediatamente.
	- Proteger fluxo de mock por flag de ambiente estrita (apenas dev local).
	- Eliminar codigos fixos em build de producao.

### 3) Critico - Limpeza de dados do usuario apos autenticacao (risco de perda de dados)
- Evidencias:
	- `components/auth/auth-guard.tsx:63` chama `initializeCleanData()` ao autenticar.
	- `lib/storage.ts:168` implementa a limpeza.
	- `lib/storage.ts:177` grava arrays vazios para todas as chaves do usuario.
- Impacto: dados do usuario podem ser apagados ao logar; comportamento destrutivo e inesperado.
- Ajuste recomendado:
	- Remover a limpeza automatica no `AuthGuard`.
	- Se necessario, manter apenas via acao explicita de reset com confirmacao do usuario.

### 4) Critico - Varios hooks chamam endpoints inexistentes no adapter `lib/api.ts`
- Evidencias de hooks chamando rotas nao implementadas:
	- `hooks/use-budget-allocations.ts:8`, `hooks/use-budget-allocations.ts:18`.
	- `hooks/use-budget-groups.ts:6`, `hooks/use-budget-groups.ts:9`.
	- `hooks/use-budget.ts:6`, `hooks/use-budget.ts:21`.
	- `hooks/use-grupos-categorias.ts:6`, `hooks/use-grupos-categorias.ts:9`.
- Evidencia do adapter limitado + excecao:
	- `lib/api.ts:40`, `lib/api.ts:47`, `lib/api.ts:54`, `lib/api.ts:61`, `lib/api.ts:64` (rotas suportadas).
	- `lib/api.ts:222`, `lib/api.ts:253`, `lib/api.ts:305`, `lib/api.ts:345` (throw `Mock endpoint not implemented`).
- Impacto: falhas em runtime e funcionalidades de orcamento/grupos quebradas.
- Ajuste recomendado:
	- Implementar as rotas faltantes no `lib/api.ts` ou alinhar hooks para apenas rotas suportadas.
	- Adicionar testes de contrato do adapter para garantir cobertura de endpoints usados pelos hooks.

### 5) Critico - Protecao de rota depende quase totalmente do client
- Evidencias:
	- Middleware le cookie mas nao valida sessao: `middleware.ts:12`.
	- Para rotas privadas, apenas segue e aplica headers: `middleware.ts:17`, `middleware.ts:33`.
- Impacto: seguranca fraca para cenarios sem JS/ataques de navegacao direta; controle de acesso inconsistente.
- Ajuste recomendado:
	- Validar sessao/token no middleware (quando migrar para backend).
	- Sincronizar estrategia server/client para evitar janelas de acesso indevido.

## Achados Altos

### 6) Alto - Inconsistencia de contrato: `category_id` vs `categoryId`
- Evidencias:
	- `lib/persistence-service.ts:301` usa `t.category_id`.
	- `lib/migration-service.ts:310` e `lib/migration-service.ts:311` usam `tx.category_id`.
	- `lib/storage.ts:400` filtra por `t.category_id`.
	- Em diversos componentes/paginas de transacao o padrao e `categoryId`.
- Impacto: estatisticas/filtros incorretos, validacoes inconsistentes, bugs silenciosos.
- Ajuste recomendado:
	- Padronizar em `categoryId` em todo o projeto.
	- Criar migracao de dados legado com mapeamento `category_id -> categoryId`.

### 7) Alto - Chave de auditoria divergente da estrutura unificada
- Evidencias:
	- Logger e pagina admin usam `audit_log`: `lib/audit-logger.ts:82`, `lib/audit-logger.ts:90`, `app/admin/audit-logs/page.tsx:31`.
	- Estrutura unificada define `mmx_audit_log`: `lib/migration-service.ts:24`, `lib/migration-service.ts:91`.
- Impacto: logs de auditoria fora do padrao multiusuario e possivel perda de integridade/migracao.
- Ajuste recomendado:
	- Unificar para `mmx_audit_log` com `userId`.
	- Atualizar leitura da pagina admin para a mesma chave e padrao de isolamento.

### 8) Alto - Fluxo async potencialmente inconsistente em limpeza total
- Evidencias:
	- `lib/storage.ts:231` (`clearAllData`).
	- `lib/storage.ts:240` usa `forEach(async ...)` sem await do conjunto.
- Impacto: funcao retorna antes de concluir a limpeza; estado parcial e condicoes de corrida.
- Ajuste recomendado:
	- Trocar por `await Promise.all(Object.values(...).map(...))`.

## Achados Medios

### 9) Medio - Excesso de logs operacionais em caminhos de producao
- Evidencias: muitos `console.log` em `lib/api.ts`, `lib/storage.ts`, `hooks/use-transactions.ts`, `hooks/use-auth.tsx`.
- Impacto: ruido em observabilidade, possivel exposicao de dados, queda de performance e manutencao.
- Ajuste recomendado:
	- Substituir por logger central com niveis (`debug/info/warn/error`) e sanitizacao de dados.

### 10) Medio - Uso recorrente de `any` em pontos de dominio
- Evidencias: `lib/api.ts:29`, `lib/date-utils.ts:81`, `hooks/use-category-groups.ts:23`, `hooks/use-grupos-categorias.ts:23`, entre outros.
- Impacto: reduz seguranca de tipo, dificulta refatoracao e mascara bugs.
- Ajuste recomendado:
	- Tipar entidades e respostas de API corretamente.
	- Eliminar `any` dos hooks/servicos de negocio por prioridade.

### 11) Medio - Duplicidade e divergencia de hooks para o mesmo dominio
- Evidencias:
	- `hooks/use-category-groups.ts` (padrao `category-groups`).
	- `hooks/use-grupos-categorias.ts` (padrao `grupos-categorias`, nao suportado pelo adapter atual).
- Impacto: aumenta custo de manutencao e gera comportamentos diferentes para funcionalidades similares.
- Ajuste recomendado:
	- Consolidar em um unico hook/caminho canonico.
	- Manter alias apenas de compatibilidade com descontinuidade planejada.

## Qualidade e testes

### 12) Gap - Ausencia de suite de testes automatizados no estado atual
- Observacao: nao foram encontrados arquivos `*.test.ts` ou `*.test.tsx` no workspace.
- Impacto: risco alto de regressao em alteracoes de auth, recorrencia e persistencia.
- Ajuste recomendado:
	- Priorizar testes em:
		- `hooks/use-auth.tsx` (login/confirmacao/reset).
		- `lib/api.ts` (contrato de endpoints).
		- `hooks/use-transactions.ts` (recorrencia e edicao em serie).
		- fluxo de budget (modais e hooks relacionados).

## Plano objetivo de correcoes (ordem sugerida)
1. Reativar bloqueios de qualidade no build (`next.config.mjs` + CI).
2. Remover credenciais/tokens hardcoded e logs sensiveis.
3. Corrigir `initializeCleanData` no fluxo de auth para evitar perda de dados.
4. Alinhar contratos de endpoint entre hooks e `lib/api.ts`.
5. Padronizar `categoryId` e migrar dados legados.
6. Unificar chave/persistencia de audit log em `mmx_audit_log`.
7. Corrigir `forEach(async ...)` em `clearAllData`.
8. Reduzir `any` e iniciar suite minima de testes automatizados.

## Resumo executivo
- O projeto esta funcional para prototipacao, mas ainda possui riscos criticos para producao.
- Os principais problemas estao em seguranca de auth, consistencia de contratos de dados e confiabilidade de persistencia.
- A correcao dos itens 1 a 5 elimina a maior parte do risco operacional imediato.
