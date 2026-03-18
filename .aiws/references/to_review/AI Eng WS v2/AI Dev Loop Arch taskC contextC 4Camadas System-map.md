O **SYSTEM_MAP.md** é um truque simples, mas muito poderoso em projetos grandes. Ele funciona como um **mapa mental do sistema para a IA**. Em vez da IA tentar deduzir tudo lendo código, você entrega **uma visão estrutural pronta**.

Isso melhora bastante a qualidade das respostas em ferramentas como:

* Claude Code
* Cursor
* GitHub Copilot

---

# Onde colocar o SYSTEM_MAP

Você pode colocar na raiz:

```
SYSTEM_MAP.md
```

ou dentro de docs:

```
docs/system-map.md
```

Eu recomendo na raiz para a IA encontrar rápido.

---

# Estrutura ideal do SYSTEM_MAP

Ele deve responder **4 perguntas**:

1. quais módulos existem
2. onde ficam no código
3. qual responsabilidade
4. quais dependências principais

---

# Exemplo de SYSTEM_MAP.md

```text
# System Map

## Backend

billing
src/backend/billing/
responsibility: invoices, subscriptions, coupons

auth
src/backend/auth/
responsibility: authentication, sessions, tokens

notifications
src/backend/notifications/
responsibility: email and event notifications

---

## Frontend

dashboard
src/frontend/dashboard/
responsibility: main user interface

admin
src/frontend/admin/
responsibility: administrative tools

---

## Automation

incident-processing
src/automation/incidents/
responsibility: incident enrichment and classification

ip-enrichment
src/automation/ip/
responsibility: IP intelligence enrichment
```

---

# O que isso resolve

Sem SYSTEM_MAP:

IA precisa:

* explorar pastas
* entender dependências
* deduzir arquitetura

Com SYSTEM_MAP:

IA entende **estrutura do sistema em segundos**.

---

# Estrutura final recomendada para seu repo

```
repo/

AGENTS.md
SYSTEM_MAP.md
PROJECT_MAP.md
ENTRYPOINTS.md
ARCHITECTURE.md

.ai/
  commands/
  context/

docs/
  decisions/
  guidelines/

engineering/
  backend/tasks/
  frontend/tasks/
  automation/tasks/

src/

.workspace/
```

---

# Diferença entre esses arquivos

| Arquivo         | Papel                          |
| --------------- | ------------------------------ |
| AGENTS.md       | regras para IA                 |
| SYSTEM_MAP.md   | mapa estrutural do sistema     |
| PROJECT_MAP.md  | visão de alto nível do projeto |
| ENTRYPOINTS.md  | onde o sistema começa          |
| ARCHITECTURE.md | decisões arquiteturais         |

---

# Benefício real

Esse arquivo costuma:

* reduzir alucinação da IA
* melhorar navegação no código
* acelerar onboarding
* melhorar planejamento de tasks

---

💡 Um detalhe interessante: alguns times evoluem isso para algo ainda melhor chamado **MODULE_MAP.md**, onde cada módulo tem **responsabilidades, limites e contratos**.

Isso deixa a IA muito mais precisa ao modificar código.

Se quiser, posso te mostrar **a arquitetura final perfeita (minimalista e muito poderosa) com apenas ~12 arquivos que controlam todo o desenvolvimento com IA**.
