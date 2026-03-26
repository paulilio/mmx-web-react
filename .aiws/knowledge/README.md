# knowledge/ — Memória Técnica do Projeto

Armazena o conhecimento acumulado do projeto: decisões arquiteturais, padrões estabelecidos e conceitos de produto. É a memória de **por que as coisas são como são**.

---

## Quando usar

- Antes de iniciar uma task — leia os arquivos relevantes ao domínio para não contradizer decisões já tomadas
- Ao tomar uma decisão arquitetural relevante — registre aqui para que seja seguida em tasks futuras
- Ao identificar um padrão que deve ser replicado — documente para padronizar execuções futuras

---

## Estrutura

\`\`\`
knowledge/
  product/        — o que é o produto, roadmap e contexto estratégico
  architecture/   — decisões e padrões de código, backend, frontend e infra
  ops/            — decisões e padrões de operação do workspace (aiws, deploy, CI/CD)
\`\`\`

---

## Tipos de arquivo

O prefixo no nome do arquivo indica o tipo de conhecimento:

| Prefixo | Tipo | Quando criar |
|---|---|---|
| `con-` | Conceito | Explicar o que é algo — produto, módulo, domínio |
| `dec-` | Decisão | Registrar uma escolha arquitetural com alternativas descartadas e motivação |
| `pat-` | Padrão | Documentar como fazer algo de forma padronizada no projeto |
| `inv-` | Investigação | Resultado de spike ou análise exploratória |
| `rev-` | Review | Avaliação de qualidade de um módulo ou área do código |

---

## Como criar um arquivo

1. Escolha a subpasta correta (`product/`, `architecture/`, `ops/`)
2. Nome do arquivo: `<prefixo>-<nome-descritivo>.md`
3. Use o template em `.ai/templates/` correspondente ao tipo

---

## Regras

- Conhecimento aqui é **do projeto**, não de uma task específica — referências de task ficam em `tasks/<tk>/ref/`
- Não duplicar informação que já está no `.ai/` (AGENTS.md, SYSTEM.md) — knowledge complementa, não repete
- Manter arquivos atualizados quando decisões mudam — knowledge desatualizado é pior que ausente
- Um arquivo por conceito/decisão/padrão — sem misturar temas
