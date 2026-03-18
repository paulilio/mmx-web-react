Para reduzir ainda mais seu esforço manual, você pode criar um **engenheiro virtual permanente** no workspace.
A ideia é simples. A IA passa a trabalhar seguindo **um papel fixo, regras fixas e memória do projeto**.

Isso elimina muitas explicações repetidas.

---

# 1. Arquivo de identidade da IA

Crie um arquivo no workspace.

Caminho sugerido

```text
.workspace/ai-engineer.md
```

Conteúdo exemplo

```text
Role

You are the lead AI engineer responsible for implementing and improving this system.

Goals

Understand the architecture
Implement features according to specifications
Maintain consistency with project conventions
Write maintainable code

Rules

Always read kernel documentation before implementing changes.
Follow naming conventions and folder structure.
Prefer simple and maintainable solutions.

Workflow

1 Analyze the repository and relevant files
2 Read the task or specification
3 Plan the implementation
4 Implement changes
5 Run a self review
6 Suggest improvements if necessary
```

Sempre que iniciar uma tarefa, peça para a IA **ler esse arquivo primeiro**.

---

# 2. Memória do projeto

Coloque documentação essencial em:

```text
.workspace/kernel
```

Arquivos comuns

```text
architecture.md
stack.md
conventions.md
modules.md
```

Esses arquivos explicam:

* arquitetura
* dependências
* padrões de código
* organização de pastas

A IA consulta isso antes de executar tarefas.

---

# 3. Estrutura de execução

Workspace completo

```text
.workspace
│
├─ ai-engineer.md
│
├─ kernel
│  ├─ architecture.md
│  ├─ stack.md
│  └─ conventions.md
│
├─ specs
│
├─ tasks
│
├─ knowledge
│
└─ prompts
```

Função de cada pasta

kernel
memória permanente do sistema

specs
especificações detalhadas

tasks
tarefas atuais

knowledge
descobertas e decisões

prompts
comandos reutilizáveis

---

# 4. Prompt padrão de execução

Quando quiser delegar trabalho para a IA

```text
Read the AI engineer role description.

Read kernel documentation.

Read the task or specification.

Execute the implementation following the defined workflow.
```

Esse prompt dispara todo o processo.

---

# 5. Prompt de validação

Depois da implementação

```text
Review the implementation.

Check architecture consistency
Check naming conventions
Check edge cases
Check security considerations
Suggest improvements.
```

---

# 6. Seu papel no sistema

Você atua como:

Tech lead

Responsabilidades principais

* revisar plano
* aprovar spec
* revisar código final
* corrigir detalhes pequenos

A IA faz a maior parte do trabalho.

---

# 7. Frequência típica de intervenção humana

Em setups maduros:

IA executa cerca de 80 a 90 por cento do código.

O desenvolvedor atua mais em:

* arquitetura
* decisões técnicas
* revisão final

---

# 8. Benefício principal

Esse modelo resolve três problemas comuns ao usar IA:

perda de contexto
decisões inconsistentes
repetição de instruções

A IA passa a trabalhar **com memória e regras fixas**.

---

Se quiser, posso também te mostrar **uma estrutura ainda mais eficiente usada por equipes de engenharia que trabalham quase 100 por cento com IA**, chamada **Context Engineering Workspace**. Ela melhora muito o planejamento e a execução automática.
