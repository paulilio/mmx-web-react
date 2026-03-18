Existe um erro que aparece quase sempre quando alguém adota essas arquiteturas para IA.
O erro é **confundir estrutura com contexto**.
Muitos engenheiros criam muitas pastas, muitos arquivos e acreditam que isso ajuda a IA. Na prática acontece o contrário.
A IA precisa de **poucos arquivos com informação clara**.
---
# Erro mais comum
Criar memória grande demais.
Exemplo ruim.
```text
memory/
  architecture.md
  system.md
  patterns.md
  decisions.md
  flows.md
  modules.md
  services.md
  domain.md
  api.md
```
Problema.
- contexto espalhado
- IA lê pouco de cada arquivo
- respostas ficam inconsistentes
---
# Como deveria ser
Memória pequena.
```text
memory/
system.md
architecture.md
decisions.md
```
Três arquivos já resolvem a maior parte dos casos.
---
# Outro erro comum
Tasks viram documentação.
Exemplo ruim.
```text
tasks/
feature-authentication-refresh-token-full-implementation-plan.md
```
Com dezenas de seções.
Isso não ajuda a IA.
---
# Task boa
Uma task deve ser simples.
```text
Title
Add refresh token endpoint
Goal
Allow session renewal without login.
Constraints
Do not change login endpoint.
Steps
1 create refresh endpoint
2 update middleware
3 add tests
```
Curta e clara.
---
# Outro erro frequente
Misturar código com contexto.
Exemplo ruim.
```text
src/
  architecture.md
  system.md
```
Contexto precisa ficar separado.
---
# Estrutura realmente eficiente
Depois de muitos experimentos, a estrutura que mais funciona é esta.
```text
repo/
memory/
  system.md
  architecture.md
  decisions.md
tasks/
  active/
  done/
src/
tests/
```
Opcional.
```text
.ai/
```
---
# Regra de ouro
Cada camada tem uma responsabilidade.
memory explica o sistema.
tasks define o trabalho.
src contém o código.
---
# Outra regra importante
Memória deve caber em poucos minutos de leitura.
Se a IA precisa ler muito, a qualidade cai.
---
# Heurística prática
Use esta regra.
system.md  
menos de 200 linhas
architecture.md  
menos de 200 linhas
decisions.md  
apenas decisões relevantes
---
# Insight importante
O ganho real não vem da estrutura.
O ganho vem de duas coisas.
- contexto curto e claro
- tasks bem escritas
---
# O que engenheiros experientes fazem
Eles mantêm apenas três coisas organizadas.
```text
memory
tasks
code
```
Todo o resto é opcional.
---
Se quiser, posso te mostrar **como transformar essa estrutura em algo que o Copilot ou Claude realmente navega sozinho**, usando um pequeno truque que poucos engenheiros usam ainda.