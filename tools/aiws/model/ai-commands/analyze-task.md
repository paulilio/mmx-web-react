# analyze-task

## Description
Analise profunda de uma task antes de implementar. Segue 6 passos estruturados para garantir entendimento completo do sistema antes de propor qualquer mudança de codigo.

Use quando a task envolve multiplos modulos, fluxos complexos ou risco de regressao.
Para tasks simples, `start-task` + `task-plan` ja sao suficientes.

## Steps

### 1. Context Scan
- Ler o Context Kernel: AGENTS.md → SYSTEM.md → CODEBASE_MAP.md → CONTEXT_SURFACES.md
- Ler a task
- Localizar os modulos e arquivos relevantes no CODEBASE_MAP
- Explicar como a parte afetada do sistema funciona atualmente: fluxo de dados, responsabilidades, dependencias entre componentes

### 2. Problem / Feature Definition
- Delimitar com precisao onde a mudanca deve acontecer
- Identificar o escopo minimo de modificacao
- Listar efeitos colaterais possiveis em outros modulos

### 3. Implementation Plan
- Propor plano minimo seguindo os padroes existentes do projeto
- Listar arquivos a modificar e arquivos novos (se necessario)
- Nao propor refactoring fora do escopo da task

### 4. Code Generation
- Implementar as mudancas conforme o plano aprovado
- Seguir as convencoes do projeto (AGENTS.md)
- Mudancas minimas — nao alterar codigo nao relacionado

### 5. Regression Safety
- Identificar casos de borda introduzidos pela mudanca
- Listar features existentes que podem ser afetadas
- Verificar impacto nas surfaces criticas (CONTEXT_SURFACES.md)

### 6. Tests
- Gerar testes que validam a mudanca
- Incluir teste de regressao para o problema corrigido
- Cobrir casos de borda identificados no passo 5

## Output
Resultado de cada passo em sequencia. Aguardar aprovacao do usuario apos o passo 3 (Implementation Plan) antes de prosseguir para o passo 4.
