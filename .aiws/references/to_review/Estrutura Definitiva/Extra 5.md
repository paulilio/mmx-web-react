Agora vamos para o nível mais avançado: **Runtime Code Map**.
Ele mostra **como o sistema realmente executa**, não apenas como o código está organizado.
Isso ajuda muito quando você precisa:
- entender bugs complexos
- investigar performance
- analisar fluxo real de requests
---
# Diferença entre os mapas
Code map simples.
```text
controllers
services
repositories
```
Semantic map.
```text
controller → service → repository
```
Runtime map.
```text
HTTP request
→ controller
→ service
→ repository
→ database
→ response
```
Ele mostra **o caminho real da execução**.
---
# Estrutura no projeto
```text
repo/
memory/
  system.md
  architecture.md
  runtime-map.md
src/
tests/
```
---
# Exemplo de runtime-map.md
Backend.
```text
# Runtime Flow
HTTP Request
→ TransactionsController.GetSummary
→ TransactionService.CalculateSummary
→ TransactionRepository.GetTransactions
→ PostgreSQL
→ response JSON
```
Outro fluxo.
```text
HTTP Request
→ AuthController.Login
→ AuthService.ValidateUser
→ UserRepository.GetUser
→ Database
→ JWT generation
→ response
```
---
# Frontend runtime flow
```text
User opens report page
→ ReportPage.tsx
→ useTransactions hook
→ transactionService.getTransactions()
→ API /transactions
→ backend flow
```
---
# Benefício prático
Quando aparece um bug.
Exemplo.
```
Summary total incorreto
```
Você olha o runtime map.
```
ReportPage
→ useTransactions
→ /transactions endpoint
→ TransactionService
→ aggregation logic
```
Agora fica claro **onde investigar**.
---
# Como gerar runtime map
Existem três formas.
### 1. Manual
Escrever fluxos principais.
Funciona muito bem.
---
### 2. Logs estruturados
Se você usa logs como:
- Serilog
- OpenTelemetry
Você pode reconstruir fluxos.
---
### 3. Distributed tracing
Ferramentas como:
- Jaeger
- Zipkin
- Application Insights
Mostram a execução completa.
---
# Exemplo de fluxo real
Trace simplificado.
```text
Request 9a2d
GET /transactions/summary
TransactionsController
TransactionService
TransactionRepository
SQL query
```
Esse fluxo pode virar runtime map.
---
# Estrutura recomendada
```text
repo/
memory/
  system.md
  architecture.md
  semantic-map.md
  runtime-map.md
tasks/
src/
tests/
```
---
# Quando usar runtime map
Vale a pena quando o sistema tem:
- várias camadas
- múltiplos serviços
- fluxos complexos
---
# Insight importante
Para IA, existem três níveis de entendimento.
Arquitetura.
```
architecture.md
```
Dependências.
```
semantic-map.md
```
Execução real.
```
runtime-map.md
```
Quanto mais desses níveis existem, melhor a IA entende o sistema.
---
Se quiser, posso te mostrar **o modelo final que junta tudo que vimos** em uma única estrutura extremamente elegante, usada por alguns engenheiros sênior em 2026.