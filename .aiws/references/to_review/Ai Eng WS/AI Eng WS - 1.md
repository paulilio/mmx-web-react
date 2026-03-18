Sim. O **AI Workspace Split** resolve um problema comum: misturar no mesmo lugar coisas que devem ir para o **git** e coisas que são apenas **contexto local da IA**.

A ideia é dividir o ambiente em **duas camadas claras**.

---

# 1. Camada do repositório (versionada)

Tudo que faz parte do projeto e deve ser compartilhado.

```text
repo/

AI_CONTEXT.md
SYSTEM.md
WORKFLOW.md
KNOWLEDGE.md
PROJECT_INDEX.md

engineering/
  tasks/
    backend/
    frontend/
    automation/

docs/
  decisions/

src/

.ai/
  commands/

.github/
```

Isso é o **AI-Native Repository**.

---

# 2. Camada de workspace local

Coisas que são **temporárias ou pessoais da IA**.

```text
.workspace/

session.md
notes.md
active-task.md
scratchpad.md
```

Esses arquivos servem para:

• notas de raciocínio  
• planejamento temporário  
• contexto de sessão  
• experimentos

Eles **não devem ir para o git**.

---

# 3. Fluxo prático

Quando começar a trabalhar:

```
workspace session
      │
      ▼
.workspace/session.md

AI lê contexto
      │
      ▼
AI_CONTEXT.md
SYSTEM.md
WORKFLOW.md
```

A implementação continua no repo.

---

# 4. Exemplo de `.workspace/session.md`

```
# Session

Current Task
BE-004

Goal
Fix invoice discount calculation.

Notes
Discount must be applied before tax.

Next Steps
Analyze BillingService.cs
```

Isso ajuda muito quando a IA está fazendo análise longa.

---

# 5. `.gitignore`

Adicione:

```
.workspace/
```

Assim nada da sessão entra no versionamento.

---

# 6. Estrutura final recomendada

```
repo/

AI_CONTEXT.md
SYSTEM.md
WORKFLOW.md
KNOWLEDGE.md
PROJECT_INDEX.md

engineering/
docs/
src/

.ai/commands/

.workspace/     ← contexto local
```

---

# Resultado

Você separa claramente:

|Camada|Função|
|---|---|
|Repository|código e arquitetura|
|AI Dev OS|comandos|
|Workspace|contexto de sessão|

Isso cria um ambiente ideal para trabalhar com IA em ferramentas como:

- Claude Code
    
- Cursor
    
- GitHub Copilot
    

---

✔ contexto persistente no repo  
✔ memória local da IA  
✔ workflow estruturado  
✔ tasks organizadas

Esse padrão é exatamente o que muitos times chamam hoje de **AI Engineering Workspace**.

---

Se quiser, posso te mostrar **uma versão final ultra-limpa dessa arquitetura (menos de 10 arquivos de contexto)** que mantém todos os conceitos que discutimos e é a que mais funciona bem com IA na prática.