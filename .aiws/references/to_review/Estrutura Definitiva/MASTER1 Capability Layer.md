Sim. O **Capability Layer** é uma camada que descreve **o que o sistema faz**, não como ele é implementado.  
Isso ajuda muito a IA a propor mudanças corretas e evitar suposições erradas.

Essa ideia está começando a aparecer em workflows com Claude Code, Cursor e GitHub Copilot.

---

# Onde entra o Capability Layer

Ele normalmente fica em:

```
repo/

capabilities/
```

Estrutura:

```
capabilities/

billing.md
authentication.md
reporting.md
incident-processing.md
```

Cada arquivo descreve **uma capacidade do sistema**.

---

# Estrutura final com Capability Layer

```
repo/

AI_CONTEXT.md
PROJECT_INDEX.md
CODE_KNOWLEDGE.md

AGENTS.md
PROJECT_MAP.md
ENTRYPOINTS.md
ARCHITECTURE.md

capabilities/            ← novo

docs/
  decisions/
  guidelines/

engineering/
  backend/tasks/
  frontend/tasks/
  automation/tasks/

src/

.ai/
  commands/

.workspace/
```

---

# Exemplo de capability

Arquivo:

```
capabilities/billing.md
```

Conteúdo:

```
# Capability: Billing

Purpose
Generate invoices and apply discounts correctly.

Actors
Customer
Finance admin

Core operations
Create invoice
Apply discount
Calculate tax
Generate invoice total

Backend location
src/backend/billing/

Frontend location
src/frontend/billing/

Important rules
Discount must be applied before tax.

Related modules
DiscountPolicy
BillingService
```

---

# Outro exemplo

```
capabilities/incident-processing.md
```

```
# Capability: Incident Processing

Purpose
Process security incidents and enrich them with context.

Actors
SOC analyst
Automation pipeline

Core operations
Receive incident
Validate IP
Enrich threat intelligence
Store incident

Automation location
src/automation/incidents/

Important rule
IP validation must run before enrichment.
```

---

# Como a IA usa isso

Quando começa um trabalho:

```
Read AI_CONTEXT.md
Read capabilities/*
```

A IA entende rapidamente:

- o que o sistema faz
    
- quais áreas existem
    
- quais regras são críticas
    

---

# Diferença entre os arquivos

|Arquivo|Função|
|---|---|
|AI_CONTEXT|guia de leitura da IA|
|PROJECT_MAP|módulos técnicos|
|PROJECT_INDEX|arquivos do código|
|CODE_KNOWLEDGE|regras importantes|
|capabilities|funcionalidades do sistema|

---

# Benefício real

Sem capability layer  
IA pensa em termos de arquivos.

Com capability layer  
IA pensa em termos de **funcionalidades do produto**.

Isso melhora muito:

- planejamento de tasks
    
- análise de impacto
    
- geração de código
    

---

# Arquitetura completa

```
AI Dev OS
   │
   ├── Context Layer
   │       AI_CONTEXT.md
   │
   ├── Capability Layer
   │       capabilities/
   │
   ├── Memory Layer
   │       CODE_KNOWLEDGE.md
   │       ADRs
   │
   ├── Task Layer
   │       engineering/tasks/
   │
   ├── Code Layer
   │       src/
   │
   └── Command Layer
           .ai/commands/
```

---

# Resultado

Seu repositório passa a ter:

• Context-Driven Development  
• Task-Driven Development  
• Project Memory Layer  
• Capability Layer  
• AI Dev OS

Isso é muito próximo do que vários times chamam hoje de **AI-Native Engineering System**.

---

Se quiser, posso te mostrar **uma simplificação inteligente dessa arquitetura** que mantém todos esses conceitos mas reduz cerca de **30–40% dos arquivos de contexto**, o que melhora bastante a eficiência da IA em projetos reais.