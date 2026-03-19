# AIWS Update — ref/ vs references/

## O que atualizar

Adicionar distinção explícita entre `tasks/<tk>/ref/` e `references/` na documentação do workspace.

## Onde aplicar

**`.aiws/README.md`** — na tabela de estrutura, adicionar linha para `tasks/<tk>/ref/`:

\`\`\`
| `tasks/<tk>/ref/` | Historico e referencias especificas da task — documentos originais, specs, rascunhos |
\`\`\`

E atualizar a descrição de `references/`:

\`\`\`
| `references/` | Referencias globais do projeto — material de pesquisa, seed data, guias externos |
\`\`\`

## Regra resultante

- `tasks/<tk>/ref/` — documentos, rascunhos e histórico **específicos da task**
- `references/` — material de referência **global** para o projeto (pesquisa, seed data, guias externos)

---

# AIWS Update — knowledge/ com subpastas e README

## O que atualizar

Reorganizar `knowledge/` em subpastas por domínio e adicionar README explicativo.

## Onde aplicar

**`knowledge/`** — criar subpastas:

\`\`\`
knowledge/
  README.md
  product/        — conceitos de produto, roadmap, contexto estratégico
  architecture/   — decisões e padrões de código, backend, frontend, infra
  ops/            — decisões e padrões de operação (workspace, deploy, CI/CD)
\`\`\`

**`knowledge/README.md`** — criar arquivo documentando:
- propósito da pasta
- quando usar
- estrutura de subpastas
- tipos de arquivo com prefixos (`con-`, `dec-`, `pat-`, `inv-`, `rev-`)
- como criar um arquivo
- regras de manutenção

## Regra resultante

- Arquivos de knowledge organizados por domínio, não todos no mesmo nível
- Prefixo no nome do arquivo indica o tipo: `con-` conceito, `dec-` decisão, `pat-` padrão, `inv-` investigação, `rev-` review
- Knowledge é do projeto — referências de task específica ficam em `tasks/<tk>/ref/`

---

# AIWS Update — docs/ com subpastas por audiência

## O que atualizar

Reorganizar `docs/` em subpastas por tipo/audiência, separando onboarding, arquitetura, operacional e governança.

## Onde aplicar

**`docs/`** — criar subpastas e mover arquivos:

\`\`\`
docs/
  README.md
  adr/              — ADRs numerados (já existente)
  onboarding/       — system-overview, project-structure, historia-criacao
  architecture/     — architecture, api-contracts, frontend-guidelines
  ops/              — local-development, docker, deployment
  governance/       — documentation-governance-checklist
\`\`\`

**`docs/README.md`** — atualizar links para refletir nova estrutura de subpastas, com descrição por seção.

## Regra resultante

- `onboarding/` — para quem está chegando no projeto (humano ou dev novo)
- `architecture/` — decisões e padrões técnicos do sistema
- `ops/` — como rodar, configurar e fazer deploy
- `governance/` — checklists e regras de manutenção da documentação
- `adr/` — registro formal de decisões arquiteturais numeradas
- Novos documentos sempre entram na subpasta correspondente + linha no README
