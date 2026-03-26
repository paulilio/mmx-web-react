# security-check-custom-mmx

## Description
Analise de seguranca focada nas superficies criticas do MMX. Verifica regressoes contra a Security Baseline definida no AGENTS.md.

## Steps
1. Ler `.ai/AGENTS.md` secao "Security Baseline"
2. Verificar cada item da baseline no codigo afetado pela task ou area indicada:

   **Auth & Tokens**
   - JWT access + refresh tokens estao sendo gerados e validados corretamente?
   - Refresh token rotation e revogacao estao funcionando?
   - Cookies com HttpOnly, SameSite, Secure (em producao)?

   **OAuth**
   - State-validation flow preservado para Google e Microsoft?
   - Nenhum redirect_uri dinamico sem validacao?

   **API & Transporte**
   - CORS configurado por ambiente (nao wildcard em producao)?
   - Rate limiting ativo nos endpoints sensiveis (auth, transacoes)?
   - Credenciais incluidas (credentials: include) em requests para NEXT_PUBLIC_API_BASE?

   **Contratos e Erros**
   - Envelope `{ data, error }` preservado — nenhum dado sensivel exposto no campo `error`?
   - ApiError retornado explicitamente (sem fallback silencioso para mock)?

   **Frontend**
   - Nenhuma chamada direta a `fetch` fora de `lib/client/api.ts`?
   - Nenhum token ou credencial armazenado em localStorage?

3. Para cada item com problema: descrever o risco, localizar o arquivo e propor correcao
4. Reportar resultado: OK / Problemas encontrados

## Output
Lista de itens verificados com status (OK / Atencao) e, para cada problema: arquivo, risco e sugestao de correcao.
