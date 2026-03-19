# init-custom

## Description
Prompts para geracao dos arquivos customizados do projeto em `.aiws/references/aiws/`.
Executar apos o init-kernel — os arquivos custom dependem do kernel estar preenchido.

Os 3 prompts sao independentes — executar na ordem ou conforme necessidade.

---

## Prompt 1 — custom-workspace-guide.md

\`\`\`
Leia o Context Kernel completo (.ai/AGENTS.md, SYSTEM.md, CODEBASE_MAP.md, CONTEXT_SURFACES.md).

Gere o arquivo .aiws/references/aiws/aiws-guide.md — guia de uso do workspace
adaptado para as particularidades deste projeto.

O arquivo deve cobrir:

1. Stack e ferramentas de AI utilizadas
   - Quais ferramentas de AI estao configuradas (Claude Code, Copilot, Cursor, etc.)
   - Como cada uma e usada no projeto

2. Convencoes especificas do projeto
   - Nomenclatura de tasks (se diferente do padrao tk-XXX)
   - Padroes de branch e commit
   - Issue tracker utilizado (Jira, GitHub Issues, Linear, etc.)

3. Comandos custom existentes
   - Listar comandos em .ai/commands/ com sufixo -custom-[projeto]
   - Quando usar cada um

4. Pipelines recomendados para este projeto
   - Adaptar os pipelines genericos para a stack especifica
   - Exemplos reais com os modulos do projeto

5. Dicas especificas
   - Armadilhas conhecidas
   - O que a IA tende a errar neste projeto
   - Como usar o chat dedicado (se configurado)

Formato: markdown limpo, direto, sem introducoes longas.
\`\`\`

---

## Prompt 2 — custom-gpt-prompt.md

\`\`\`
Leia o Context Kernel completo (.ai/AGENTS.md, SYSTEM.md, CODEBASE_MAP.md).

Gere o arquivo .aiws/references/aiws/gpt-prompt.md — system prompt para um chat
GPT/Claude dedicado ao projeto, usado para duvidas rapidas do dia a dia sem abrir o editor.

Para gerar, preciso de algumas informacoes. Responda cada item:

1. Nome do projeto e descricao em uma frase
2. Stack principal (linguagem, framework, banco de dados)
3. Modulos principais (ja identificados no CODEBASE_MAP)
4. Composicao do time: quais papeis existem?
   (ex: product manager, tech lead, devs, qa, scrum master)
5. Ferramentas de gestao: qual issue tracker? (Jira, Linear, GitHub Issues, Azure DevOps)
6. Para que o chat sera mais usado?
   (ex: duvidas tecnicas, decisoes de produto, estimativas, revisao de bugs)
7. Tom preferido: formal, casual ou tecnico direto?

Com base nas respostas, gerar um system prompt que:
- Apresenta o projeto e seu contexto
- Descreve o time e seus papeis
- Lista as ferramentas usadas
- Define os tipos de uso esperados
- Define o tom e formato de resposta
- Instrui a IA a ser direta e pratica, sem introducoes longas

O prompt deve caber em ~300-500 palavras — conciso o suficiente para ser colado em qualquer chat.
\`\`\`

---

## Prompt 3 — custom-v0-instructions.md

\`\`\`
Leia .ai/SYSTEM.md e .ai/CODEBASE_MAP.md.

Gere o arquivo .aiws/references/aiws/v0-instructions.md — instrucoes para o v0 (Vercel)
que serao coladas em Project → Knowledge.

O arquivo deve cobrir:

1. Contexto do projeto
   - O que e o sistema
   - Stack de frontend (framework, bibliotecas de UI, design system)

2. Convencoes de componentes
   - Nomenclatura de componentes
   - Estrutura de pastas de UI
   - Padroes de props e typescript

3. Design system e estilos
   - Biblioteca de componentes usada (shadcn, MUI, Chakra, etc.)
   - Variaveis de CSS ou tokens de design
   - Padroes de responsividade

4. Padroes de data fetching no frontend
   - Como o frontend busca dados (SWR, React Query, fetch direto, etc.)
   - Formato de resposta esperado das APIs

5. O que o v0 NAO deve fazer
   - Restricoes especificas do projeto
   - Padroes que nao devem ser alterados

Formato: instrucoes diretas em ingles (v0 funciona melhor com instrucoes em ingles).
Limite: ~200 linhas.
\`\`\`
