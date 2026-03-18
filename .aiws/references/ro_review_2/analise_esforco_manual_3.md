Segue o **modelo Task-driven AI workspace**.
Ele permite que a IA planeje, quebre tarefas, implemente e revise. Você atua só como revisor.

---

# Estrutura de pastas

```
.workspace
│
├─ ai-engineer.md
│
├─ kernel
│  ├─ architecture.md
│  ├─ stack.md
│  ├─ conventions.md
│  └─ modules.md
│
├─ tasks
│  ├─ backlog
│  ├─ active
│  └─ done
│
├─ specs
│
├─ plans
│
├─ reviews
│
└─ knowledge
   ├─ patterns
   ├─ decisions
   └─ workarounds
```

Função de cada pasta

kernel
memória permanente do projeto.

tasks
tarefas do sistema.

plans
planos de implementação gerados pela IA.

specs
especificações detalhadas.

reviews
relatórios de revisão automática.

knowledge
aprendizado acumulado do projeto.

---

# Ciclo completo de execução

## 1 criar tarefa

Arquivo

```
.workspace/tasks/backlog/feature-public-api.md
```

Conteúdo

```
Goal

Expose read endpoints for public API.

Requirements

Return project metadata
Return bid summary
Follow existing authentication

Constraints

Follow Clean Architecture.
Reuse current services when possible.
```

---

# 2 pedir planejamento

Prompt

```
Read ai-engineer role.

Read kernel documentation.

Read the task file.

Generate an implementation plan.
```

Saída salva em

```
.workspace/plans/feature-public-api-plan.md
```

Plano inclui

* arquitetura
* arquivos
* dependências
* riscos

---

# 3 gerar spec

Prompt

```
Read the implementation plan.

Generate the implementation specification.
```

Resultado

```
.workspace/specs/feature-public-api-spec.md
```

Conteúdo

* endpoints
* modelos de dados
* regras
* testes

---

# 4 implementação automática

Prompt

```
Read the specification.

Implement the feature.

Modify the repository files accordingly.
```

A IA cria ou altera vários arquivos.

---

# 5 revisão automática

Prompt

```
Review the implementation.

Check architecture
Check naming
Check duplication
Check validation rules
Check security
```

Resultado salvo em

```
.workspace/reviews/feature-public-api-review.md
```

---

# Seu papel

Você faz três verificações rápidas

Plano
Spec
Review final

Você entra no código apenas para ajustes pequenos.

---

# Frequência de intervenção humana

Em setups maduros

IA escreve
80 a 90 por cento do código

Humano faz

* decisões
* revisão
* correções pequenas

---

# Dica que aumenta muito a qualidade

Adicione uma regra no `ai-engineer.md`

```
Never implement before producing a plan and specification.
```

Isso força disciplina na IA.

---

# Ferramentas que funcionam melhor com esse modelo

VS Code

Plugins

Copilot
Claude Code
Continue.dev

CLI

Aider
Claude CLI

---

# Benefício prático

Você muda de papel

antes
desenvolvedor

depois
arquiteto e revisor

---

Se quiser, posso te mostrar também **o erro número 1 que faz esse modelo falhar em muitos projetos**, mesmo quando a estrutura está correta. Esse detalhe muda completamente o resultado da IA.
