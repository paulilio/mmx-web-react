# performance-check-custom-mmx

## Description
Analise de performance focada nos padroes criticos do MMX: queries Prisma, hooks SWR, renderizacao de listas e endpoints de relatorios.

## Steps
1. Ler `.ai/CODEBASE_MAP.md` para identificar os modulos relevantes ao escopo da analise
2. Verificar as areas abaixo no codigo indicado:

   **Backend — Prisma / Queries**
   - Existem queries N+1? (ex: buscar transacoes em loop sem include/join)
   - Falta `select` explícito retornando campos desnecessarios?
   - Falta paginacao em listagens que podem crescer? (transacoes, lancamentos)
   - Indices necessarios para os filtros mais usados (data, categoria, area)?
   - Transacoes de banco desnecessariamente longas?

   **Backend — Endpoints**
   - Endpoints de reports (`/reports/summary`, `/reports/cashflow`, `/reports/aging`) fazem agregacao em memoria em vez de no banco?
   - Algum endpoint sem cache que poderia ter (dados que mudam pouco)?

   **Frontend — SWR / Data Fetching**
   - Hooks SWR com `revalidateOnFocus` ativo onde nao faz sentido?
   - Falta `dedupingInterval` em hooks chamados multiplas vezes na mesma pagina?
   - Algum hook refazendo fetch de dados que ja estao no cache?
   - `mutate` sendo chamado sem necessidade apos operacoes que ja retornam o dado atualizado?

   **Frontend — Renderizacao**
   - Listas grandes (transacoes, lancamentos) sem virtualizacao ou paginacao?
   - Componentes re-renderizando desnecessariamente por props instáveis (objetos/arrays inline)?
   - `useEffect` com dependencias que mudam a cada render?

3. Para cada problema encontrado: descrever o impacto, localizar o arquivo e propor correcao
4. Reportar resultado: OK / Problemas encontrados

## Output
Lista de areas verificadas com status (OK / Atencao) e, para cada problema: arquivo, impacto estimado e sugestao de correcao.
