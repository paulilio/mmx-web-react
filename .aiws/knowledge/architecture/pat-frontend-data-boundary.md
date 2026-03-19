# PAT: Frontend Data Boundary

## Concept
Todo acesso a dados no frontend deve passar obrigatoriamente pela cadeia: UI → hooks → packages/web/lib/client/api.ts → packages/api. Nenhum componente ou página acessa storage, repositórios ou backend diretamente.

## When to Use
Sempre que criar ou modificar componentes, páginas ou hooks que precisam de dados do backend ou persistência.

## How to Apply
1. Criar/usar hook dedicado para o domínio (ex: useTransactions, useCategories)
2. Hook usa packages/web/lib/client/api.ts para chamadas HTTP
3. packages/web/lib/client/api.ts desembrulha envelope { data, error }
4. Em NEXT_PUBLIC_USE_API=true: erro explícito (ApiError), sem fallback automático para mock
5. Para requests externos (NEXT_PUBLIC_API_BASE): usar credentials: "include"
6. Para first-party (/api/*): comportamento padrão preservado

Violações a evitar:
- Acessar lib/server/storage diretamente em componentes client
- Usar localStorage para dados de feature
- Fazer fetch direto sem passar por packages/web/lib/client/api.ts
- Criar mock fallback automático em API mode

## Example in This Project
- packages/web/lib/client/api.ts:handleResponse — desembrulha envelope, erro explícito
- packages/web/lib/client/api.ts:requestApi — credentials: "include" para requests externos
- packages/web/hooks/use-auth.tsx — login/logout/refresh integrados com /api/auth/*
- packages/web/hooks/use-settings-maintenance.ts — settings via /api/settings/* (criado em tk-103)
- packages/web/app/settings/page.tsx — removido bypass de lib/server/storage (tk-103)

## Notes
Este padrão foi formalizado e reforçado em tk-103. O AGENTS.md documenta as regras como API Boundary Rules. Qualquer nova feature deve seguir este padrão sem exceção.
