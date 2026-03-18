# Checklist de Governanca de Documentacao (PR)

Use este checklist quando o PR alterar arquitetura, contratos, seguranca, fluxos de dominio, variaveis de ambiente, comportamento de API ou padroes de implementacao.

## 1) Escopo da mudanca

- Descrevi no PR o que mudou e por que mudou.
- Classifiquei o tipo de mudanca: arquitetura, contrato, seguranca, fluxo de negocio, infraestrutura ou apenas editorial.

## 2) Arquivos obrigatorios para revisao

- README.md
- docs/system-overview.md
- docs/architecture.md
- docs/api-contracts.md
- docs/project-structure.md
- docs/local-development.md e/ou docs/deployment.md
- AGENTS.md
- .github/copilot-instructions.md
- .ai/project-context.md
- .ai/architecture.md
- .ai/coding-guidelines.md
- .ai/testing-guidelines.md
- .ai/repo-map.md

## 3) Regras de consistencia

- A documentacao reflete o estado atual do codigo.
- O backend segue ADR-0012 (Modular Monolith + DDD).
- O backend source of truth e apps/api.
- Frontend usa lib/client/api.ts como fronteira unica de dados.
- Contrato HTTP padrao permanece { data, error }.
- Em NEXT_PUBLIC_USE_API=true nao existe fallback automatico para mock.
- Chamadas externas via NEXT_PUBLIC_API_BASE usam credentials include.

## 4) Regras editoriais

- Terminologia consistente entre docs e .ai.
- PT-BR para textos de produto/time; ingles tecnico quando necessario.
- Sem placeholders ambiguos em documentos finais.
- Titulos e secoes objetivas.

## 5) Evidencia de validacao

- Rodei: pnpm lint
- Rodei: pnpm type-check
- Rodei: pnpm test:unit
- Rodei: pnpm test:integration
- Rodei: pnpm build

## 6) Resultado do checklist

- Marquei itens nao aplicaveis com justificativa curta no PR.
- Registrei quais docs foram atualizados.
- Confirmei ausencia de divergencia entre README, docs, AGENTS, .github e .ai.
