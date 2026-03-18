Vou mostrar **como gerar o code-map automaticamente**.  
A ideia é manter `memory/code-map.md` sempre atualizado sem esforço.
Você usa um script simples que varre `src/` e cria o mapa.
---
# Estrutura do projeto
```text
repo/
AGENTS.md
memory/
  system.md
  architecture.md
  code-map.md
tasks/
scripts/
src/
tests/
```
---
# Script de geração automática
Crie:
scripts/generate-code-map.sh
```bash
#!/bin/bash
OUTPUT="memory/code-map.md"
echo "# Project Code Map" > $OUTPUT
echo "" >> $OUTPUT
echo "## Backend" >> $OUTPUT
echo "" >> $OUTPUT
find src/backend -type d >> $OUTPUT
echo "" >> $OUTPUT
echo "## Frontend" >> $OUTPUT
echo "" >> $OUTPUT
find src/frontend -type d >> $OUTPUT
```
---
# Executar o script
No terminal.
```bash
./scripts/generate-code-map.sh
```
Ele gera algo assim.
```text
# Project Code Map
## Backend
src/backend/controllers
src/backend/services
src/backend/repositories
src/backend/models
## Frontend
src/frontend/pages
src/frontend/components
src/frontend/hooks
src/frontend/services
```
---
# Melhorar o mapa
Você pode listar também arquivos principais.
Atualize o script.
```bash
echo "" >> $OUTPUT
echo "## Key Files" >> $OUTPUT
echo "" >> $OUTPUT
find src -name "*.cs" -o -name "*.ts" -o -name "*.tsx" | head -n 30 >> $OUTPUT
```
---
# Automatizar com git hook
Crie:
```text
.git/hooks/pre-commit
```
Conteúdo.
```bash
#!/bin/bash
./scripts/generate-code-map.sh
git add memory/code-map.md
```
Agora o mapa atualiza automaticamente antes de cada commit.
---
# Fluxo completo
1 alterar código  
2 git commit  
3 script roda  
4 code-map atualizado
---
# Como a IA usa
Quando você inicia uma task, envie:
- AGENTS.md
- memory/system.md
- memory/architecture.md
- memory/code-map.md
- task atual
Isso dá **navegação completa do projeto**.
---
# Resultado prático
A IA passa a:
- localizar módulos rapidamente
- sugerir mudanças corretas
- entender dependências
---
# Dica importante
Evite colocar **arquivos demais** no code-map.
Ideal.
- diretórios principais
- alguns arquivos chave
Menos contexto irrelevante melhora as respostas.
---
Se quiser, posso te mostrar **uma versão muito mais poderosa desse code-map**, usada em projetos grandes:  
um **semantic code map**, que mostra dependências entre módulos e funções, não apenas pastas.