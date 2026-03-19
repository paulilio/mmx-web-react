# Decisao: AIWS em ecossistema multi-sistema

**Status:** Em analise — pendente definir estrutura de repositorios
**Contexto:** O usuario atua em um ecossistema de 4+ sistemas autonomos que se integram via banco de dados e API.

---

## Cenario

- 4+ sistemas autonomos, cada um com seu proprio repositorio (a confirmar)
- Integracao via API e banco de dados — sem codigo compartilhado
- Usuario atua ativamente em 3 dos sistemas
- Existe um diretorio wiki com documentacao dos sistemas, onboarding tecnico, scripts de setup
- Sistemas se complementam mas sao independentes em deploy e ciclo de vida

---

## Decisao recomendada

**Kernel por sistema + Workspace unico compartilhado + Kernel global leve**

### Estrutura proposta

```
ecosystem/                        <- repositorio ou pasta raiz
  .ai/                            <- Kernel Global (leve)
    SYSTEM.md                     <- o que e cada sistema e como se integram
    CONTEXT_SURFACES.md           <- APIs compartilhadas, schemas de banco comuns
  .aiws/                          <- Workspace UNICO compartilhado
    tasks/
    knowledge/
    runs/
    references/

  sistema-a/                      <- repositorio proprio
    .ai/                          <- Kernel local completo
    src/

  sistema-b/
    .ai/
    src/
```

### Convencao de nomenclatura de tasks

Prefixo no nome da pasta para identificar escopo sem subpastas:

```
.aiws/tasks/
  sistema-a--tk-001-auth-flow/
  sistema-b--tk-015-report-export/
  integration--tk-003-sync-orders/    <- tasks de integracao ficam explicitas
```

---

## Racional

| Opcao | Prós | Contras |
|---|---|---|
| Workspace por sistema | Isolamento total | Tasks de integracao ficam partidas; knowledge fragmentado |
| Workspace unico compartilhado | Visao coerente do ecossistema; tasks de integracao com contexto completo | Requer convencao de nomenclatura |

Como os sistemas sao autonomos, a **maioria das tasks e interna** de um sistema. O workspace unico funciona bem com prefixo no nome — deixa claro o escopo sem burocracia extra.

## Por que o Kernel Global e leve

Sistemas autonomos com integracao via API/banco significa que as interfaces sao **contratos estaveis** — nao ha codigo compartilhado. O kernel global nao precisa mapear modulos internos, apenas:
- O que cada sistema faz (visao geral)
- Quais APIs um sistema expoe para os outros
- Quais schemas de banco sao lidos por multiplos sistemas

Isso cabe num `SYSTEM.md` e `CONTEXT_SURFACES.md` globais pequenos.

## Regra de leitura de contexto (para o AGENTS.md global)

```
Task interna de um sistema:
  leia -> ecosystem/.ai/ -> sistema-X/.ai/ -> task

Task de integracao entre sistemas:
  leia -> ecosystem/.ai/ -> sistema-A/.ai/ -> sistema-B/.ai/ -> task
```

---

## Pendencias para decidir

- [ ] Monorepo unico ou repositorios separados por sistema?
  - Se monorepo: ecosystem/ e a raiz, `.aiws/` fica na raiz
  - Se repos separados: criar um repositorio dedicado `ecosystem/` so para `.ai/` e `.aiws/`
- [ ] Qual sistema iniciar primeiro para validar o modelo?
- [ ] A wiki existente pode alimentar o `init-kernel.md` global — mapear quais documentos cobrem quais sistemas

---

## Referencias

- Conversa original: sessao de 2026-03-17
- Modelo AIWS: `.aiws/references/aiws/generic-blueprint.md`
