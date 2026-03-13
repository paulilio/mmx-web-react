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
- docs/local-development.md e/ou docs/deployment.md (quando houver impacto operacional)
- AGENTS.md
- .github/copilot-instructions.md
- .ai/project-context.md
- .ai/architecture.md
- .ai/coding-guidelines.md
- .ai/testing-guidelines.md
- .ai/repo-map.md

## 3) Regras de consistencia

- A documentacao reflete o estado atual do codigo (sem itens legados apresentados como atuais).
- O fluxo server em app/api segue composition root em lib/server/services/index.ts.
- Rotas app/api nao importam repositories/prisma diretamente.
- Contrato HTTP padrao permanece { data, error }.
- Comportamento NEXT_PUBLIC_USE_API=true permanece sem fallback automatico para mock.
- Chamadas externas via NEXT_PUBLIC_API_BASE usam credentials: "include".

## 4) Regras editoriais

- Terminologia consistente entre docs e .ai (ex.: "de primeira parte", "adaptador", "modo API").
- PT-BR para textos voltados ao time/produto; ingles tecnico apenas quando necessario.
- Sem placeholders ambiguuos (ex.: ADR-XXXX) em documentos finais.
- Titulos e secoes seguem estrutura clara e objetiva.

## 5) Evidencia de validacao

- Rodei: pnpm lint
- Rodei: pnpm type-check
- Rodei: pnpm test:integration (quando alterar app/api, middleware ou contratos)
- Rodei: pnpm test:unit (quando alterar regras de dominio/servico)
- Rodei: pnpm build (quando alterar estrutura ou comportamento de runtime)

## 6) Resultado do checklist

- Marquei itens nao aplicaveis com justificativa curta no PR.
- Registrei quais arquivos de docs foram atualizados no resumo final do PR.
- Confirmei que nao ha divergencia entre README, docs, AGENTS, .github e .ai.
