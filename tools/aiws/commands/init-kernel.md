# init-kernel

## Description
Prompts para analise inicial do repositorio e geracao do Context Kernel (.ai/).
Executar logo apos a instalacao do AIWS (`aiws_install.py`).
Os 4 prompts devem ser executados em sequencia — cada um gera um arquivo do kernel.

---

## Prompt 1 — AGENTS.md

\`\`\`
Analise este repositorio e gere o conteudo do arquivo .ai/AGENTS.md.

O AGENTS.md e o manual operacional da IA — define como trabalhar neste projeto.

Para gerar, analise:
- Estrutura de pastas e arquitetura geral
- Convencoes de codigo existentes (nomenclatura, organizacao de arquivos)
- Padroes de testes encontrados
- Configuracoes de lint, build e CI/CD (se existirem)
- Qualquer documentacao existente (README, docs/)

Gere o AGENTS.md com as seguintes secoes:
1. Engineering Principles — 3 a 5 principios identificados no codigo
2. Context Reading Order — ordem padrao de leitura (manter: AGENTS → SYSTEM → MAP → task → SURFACES)
3. Code Change Rules — regras para alteracoes baseadas no que voce viu
4. Coding Conventions — convencoes identificadas no codigo
5. Testing Rules — padroes de teste encontrados
6. Security Baseline — requisitos minimos de seguranca observados
7. Validation Checklist — checklist de validacao antes de finalizar uma task
8. Documentation Governance — regras de documentacao
9. Workspace Operacional — referencia ao .aiws/ (manter o padrao do template)
10. Comandos disponiveis — referencia ao .ai/commands/ (manter o padrao do template)

Limite: 200 linhas. Ser direto e operacional — sem texto explicativo desnecessario.
\`\`\`

---

## Prompt 2 — SYSTEM.md

\`\`\`
Analise este repositorio e gere o conteudo do arquivo .ai/SYSTEM.md.

O SYSTEM.md explica o sistema em nivel conceitual para engenheiros e agentes de IA.

Para gerar, analise:
- README.md e qualquer documentacao existente
- Estrutura de pastas src/ e principais modulos
- Package.json, requirements.txt ou equivalente (dependencias revelam muito)
- Arquivos de configuracao (docker-compose, .env.example, etc.)
- Codigo dos entry points principais

Gere o SYSTEM.md com as seguintes secoes:
1. Purpose — o que o sistema faz (1-2 frases)
2. Architecture Overview — como a arquitetura funciona em alto nivel
3. Main Components — lista dos componentes principais com responsabilidade
4. Data Flow — como os dados fluem entre os componentes
5. Tech Stack — linguagem, frameworks, banco de dados, infraestrutura
6. Environment Variables — variaveis de ambiente relevantes (baseado em .env.example ou equivalente)
7. Constraints — restricoes tecnicas ou de negocio identificadas
8. Known Limitations — limitacoes conhecidas

Limite: 150-200 linhas. Foco em clareza conceitual — detalhes tecnicos profundos vao em docs/.
\`\`\`

---

## Prompt 3 — CODEBASE_MAP.md

\`\`\`
Analise este repositorio e gere o conteudo do arquivo .ai/CODEBASE_MAP.md.

O CODEBASE_MAP e o mapa modular do codigo — ajuda a IA a localizar rapidamente onde cada funcionalidade esta.
E o arquivo com maior impacto em qualidade de resposta — priorizá-lo reduz 80% dos erros de localizacao.

Para gerar, analise:
- Estrutura completa de src/ (ou equivalente)
- Entry points de cada modulo (rotas, controllers, use cases, services)
- Dependencias entre modulos
- Localizacao dos testes

Gere o CODEBASE_MAP.md seguindo este formato por modulo:

## Module: [nome]
Purpose: [descricao curta — uma frase]
Core files:
  - path/to/file
Entry points:
  - [metodo] /path/to/endpoint ou [funcao principal]
Dependencies:
  - [modulos dos quais depende]
Tests:
  - tests/path/

Regras:
- Organizar por modulos funcionais (nao por estrutura de pastas)
- Listar apenas arquivos centrais — nao listar todos os arquivos
- Manter cada modulo com ate 20 linhas
- Incluir no final uma secao "Critical Paths" com os 3-5 fluxos end-to-end mais importantes

Limite: 10-15 modulos (~200 linhas). Se houver mais, agrupar por dominio.
\`\`\`

---

## Prompt 4 — CONTEXT_SURFACES.md

\`\`\`
Analise este repositorio e gere o conteudo do arquivo .ai/CONTEXT_SURFACES.md.

O CONTEXT_SURFACES define superficies de impacto de mudanca — ajuda a prever quais partes do sistema
podem ser afetadas por uma alteracao.

Para gerar, analise:
- Modulos com maior numero de dependencias (mais provaveis de causar regressoes)
- Endpoints publicos ou contratos de API
- Logica de autenticacao e autorizacao
- Camadas de acesso a dados (queries, migrations)
- Integrações externas (APIs terceiras, webhooks, filas)
- Shared utilities usados em multiplos lugares

Gere o CONTEXT_SURFACES.md seguindo este formato por superficie:

## [Nome] Surface
Core files:
  - path/to/files
Adjacent surfaces:
  - [outras surfaces que podem ser afetadas]
Risk level: High | Medium | Low
Notes: [contexto adicional — por que esta superficie e critica]

Incluir apenas superficies criticas — nao mapear tudo, so o que pode quebrar algo importante.
Limite: ~150 linhas.
\`\`\`

---

## Validacao final

Apos gerar os 4 arquivos, execute:

\`\`\`
Verifique se o Context Kernel esta completo e consistente:
1. AGENTS.md tem ordem de leitura definida?
2. CODEBASE_MAP.md esta organizado por modulos funcionais (nao por pastas)?
3. CODEBASE_MAP.md tem Critical Paths?
4. CONTEXT_SURFACES.md tem risk levels definidos?
5. Algum dos arquivos ultrapassou o limite recomendado?
6. Ha informacao duplicada entre os arquivos?

Reportar o que esta OK e o que precisa de ajuste.
\`\`\`
