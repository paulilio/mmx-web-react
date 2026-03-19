# Monitor Platform

Monitoramento de browser baseado em Playwright para a aplicacao MMX.

Este documento separa claramente o que ja esta implementado para debugging e o que faz parte das proximas vertentes da plataforma.

---

## Visao Geral

O monitor tem dois blocos principais:

- Debug Runtime (implementado): detecta erros no browser, coleta evidencias e gera relatorio.
- Plataforma de Observabilidade (roadmap): telemetria centralizada, testes sinteticos, analise e dashboards.

---

## Status Por Vertente

| Vertente | Status | Objetivo | Pasta principal |
|---------|--------|----------|-----------------|
| Debug Runtime | Ativo (Phase 1) | Capturar erros de execucao e gerar pacote de evidencia | `monitor/engine`, `runtime/monitor/artifacts`, `runtime/monitor/reports/incidentes`, `runtime/monitor/logs/debug` |
| Sessions | Estrutura pronta | Persistir historico de execucoes/sessoes | `runtime/monitor/logs/sessions` |
| Observabilidade | Planejado (Phase 3+) | Correlacionar logs, traces e metricas | `monitor/telemetry`, `monitor/dashboards` |
| Synthetic Tests | Planejado (Phase 2+) | Executar fluxos automatizados para detectar regressao | `monitor/synthetic-tests` |
| AI Analysis | Planejado (Phase 4+) | Analisar incidentes e sugerir causa raiz | `monitor/ai-agents`, `runtime/monitor/reports/analysis` |

---

## Debug Runtime (Ativo Hoje)

Capacidades atuais:

- monitora `console.error`
- monitora `pageerror` (exception de runtime)
- monitora respostas HTTP `4xx` e `5xx`
- valida seletores criticos da pagina
- coleta screenshot, HTML e log de eventos
- gera relatorio Markdown em `runtime/monitor/reports/incidentes`

Fluxo atual:

1. `runner.js` inicia o browser e navega para a rota alvo.
2. `monitor.js` conecta listeners de console/pageerror/response.
3. `detector.js` classifica os eventos de erro.
4. `evidence.js` persiste artefatos em `runtime/monitor/artifacts` e `runtime/monitor/logs/debug`.
5. `report.js` gera o relatorio em `runtime/monitor/reports/incidentes`.

Checklist de monitoramento da Phase 1 (agora validado no relatorio):

- frontend tracking (Sentry detectado ou erro frontend capturado)
- stack traces de runtime (`pageerror`)
- contexto basico de request (`method`, `url`, `status`)
- correlacao por `x-request-id` quando presente

---

## Estrutura De Pastas

\`\`\`text
config/                          # Configuracao centralizada (raiz)
|-- app-config.json
`-- monitor.config.json

monitor/
|-- engine/                      # Runtime de debug
|   |-- runner.js
|   |-- monitor.js
|   |-- detector.js
|   |-- evidence.js
|   `-- report.js
runtime/
`-- monitor/
|   |-- logs/
|   |   |-- system/              # Logs do sistema/engine
|   |   |-- debug/               # Logs gerados por execucao
|   |   `-- sessions/            # Historico de sessoes (roadmap)
|   |-- artifacts/
|   |   |-- screenshots/
|   |   |-- html/
|   |   `-- network/             # Roadmap
|   `-- reports/
|       |-- incidentes/          # Relatorios de incidentes
|       `-- analysis/            # Analises (roadmap)
|-- telemetry/                   # Roadmap observabilidade
|-- synthetic-tests/             # Roadmap testes sinteticos
|-- ai-agents/                   # Roadmap IA
`-- dashboards/                  # Roadmap visualizacao
\`\`\`

---

## Como Executar O Debug Monitor

Pre-requisito (se necessario):

\`\`\`bash
pnpm exec playwright install chromium
\`\`\`

1. Subir a aplicacao:

\`\`\`bash
pnpm dev
\`\`\`

2. Rodar monitor (outro terminal):

\`\`\`bash
node monitor/engine/runner.js
\`\`\`

Overrides uteis:

\`\`\`bash
node monitor/engine/runner.js --startPath /transactions
node monitor/engine/runner.js --baseUrl http://localhost:3000 --startPath /dashboard
\`\`\`

Probe de validacao (forca 404):

\`\`\`bash
node monitor/engine/runner.js --startPath /monitor-probe-404
\`\`\`

Probe dedicado da Phase 1 (console + pageerror + http-error com x-request-id):

\`\`\`bash
node monitor/engine/runner.js --startPath /monitor-probe-phase1
\`\`\`

### Execucao via Docker

Com stack dev em Docker, o servico `monitor` executa em loop automaticamente.

Subir stack:

\`\`\`bash
pnpm docker:dev:up
\`\`\`

Ver logs do monitor:

\`\`\`bash
pnpm docker:dev:logs:monitor
\`\`\`

No compose, o monitor usa:

- `MONITOR_BASE_URL=http://host.docker.internal:3000`
- `MONITOR_START_PATH=/dashboard`
- `MONITOR_PHASE1_ENABLED=true`
- `MONITOR_PHASE1_ENFORCE=true`

Observacao:

- Em Docker Desktop (Windows/macOS), `host.docker.internal` evita falhas de navegacao do Chromium com hostname de servico.
- Em ambientes onde esse hostname nao existir, ajuste `MONITOR_BASE_URL` para a URL acessivel do app e mantenha `extra_hosts` quando suportado.

---

## Monitoramento Local E Remoto

Use esta secao quando quiser monitorar a aplicacao em ambientes diferentes.

### Modo Local (desenvolvimento)

Quando usar:

- desenvolvimento diario
- reproducao rapida de bugs
- validacao de alteracoes antes de merge

Passos:

1. Suba o app local com `pnpm dev`.
2. Execute o monitor com base local:

\`\`\`bash
node monitor/engine/runner.js --baseUrl http://localhost:3000 --startPath /dashboard
\`\`\`

### Modo Remoto (staging/producao)

Quando usar:

- validar comportamento em ambiente oficial
- investigar bugs que nao reproduzem localmente
- monitorar regressao apos deploy

Passos:

1. Confirme a URL alvo (exemplo: staging ou producao).
2. Execute o monitor apontando para o servidor remoto:

\`\`\`bash
node monitor/engine/runner.js --baseUrl https://seu-dominio.com --startPath /dashboard
\`\`\`

Exemplo com rota especifica:

\`\`\`bash
node monitor/engine/runner.js --baseUrl https://seu-dominio.com --startPath /transactions
\`\`\`

### Checklist Para Execucao Remota

- Ambiente remoto acessivel pela sua maquina (sem bloqueio de rede/firewall).
- Rota inicial publica ou com autenticacao tratada antes da validacao.
- Dados de teste disponiveis no ambiente remoto.
- Evitar cenarios destrutivos em producao (acoes de escrita sensiveis).
- Em caso de WAF/rate-limit, espacar execucoes para nao disparar bloqueio.

### Estrategia Recomendada

1. Rode primeiro local para validar pipeline do monitor.
2. Rode em staging com as mesmas rotas criticas.
3. Rode em producao apenas para verificacoes pontuais e seguras.
4. Compare os artefatos gerados entre local e remoto para identificar diferencas.

---

## Saidas Do Debug (Atuais)

Quando erros sao detectados:

- `runtime/monitor/reports/incidentes/bug-<timestamp>.md`
- `runtime/monitor/artifacts/screenshots/error-<timestamp>.png`
- `runtime/monitor/artifacts/html/error-<timestamp>.html`
- `runtime/monitor/logs/debug/error-<timestamp>.log`

O relatorio tambem inclui:

- secao `Phase 1 Checklist`
- secao `Request Context`

---

## Configuracao

Arquivo: `config/monitor.config.json`

| Campo | Descricao |
|-------|-----------|
| `baseUrl` | URL base da aplicacao |
| `startPath` | Caminho inicial de navegacao |
| `headless` | Executar browser headless |
| `timeoutMs` | Timeout de navegacao em milissegundos |
| `waitAfterLoadMs` | Espera apos carregamento da pagina |
| `criticalSelectors` | Seletores CSS obrigatorios |
| `maxHttpErrorsToCapture` | Limite de erros HTTP por execucao |
| `ignoreConsoleErrorPatterns` | Lista de regex para ignorar ruidos conhecidos de `console.error` |

---

## Roadmap Das Outras Vertentes

| Phase | Vertente | Resultado esperado |
|-------|----------|--------------------|
| Phase 2 | Synthetic Tests | Fluxos Playwright automatizados e reprodutiveis |
| Phase 3 | Observabilidade + Telemetria | OpenTelemetry + SigNoz + correlacao de sinais |
| Phase 4 | AI Analysis | Sumario de incidentes e hipoteses de causa raiz |
| Phase 5 | Plataforma em Producao | Stack completa operacional em ambiente oficial |

Referencia completa: `.dev-workspace/product/2-roadmap/roadmap-monitor.md`
