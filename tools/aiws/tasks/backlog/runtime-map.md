# BACKLOG: Runtime Code Map (Fluxos de Execução)

## Ideia

Criar um mapa de fluxos de execução reais do sistema — diferente do mapa estrutural de pastas, registra como os dados fluem em runtime.

## Estrutura proposta

```
.ai/runtime-map.md
```

Conteúdo:
- **HTTP Request flow**: Browser → Next.js → lib/client/api.ts → apps/api → Controller → Service → Repository → Prisma → PostgreSQL
- **Auth flow**: login → JWT gerado → cookie HttpOnly → refresh rotation
- **Frontend data flow**: UI → Hook → lib/client/api.ts → envelope {data,error} → Hook state → UI render
- **Background jobs**: (quando existirem)

## Por que fazer

- Muito útil para investigar bugs complexos (onde exatamente algo quebra?)
- IA entende dependências de runtime, não só estrutura de arquivos
- Reduz alucinação em tasks que cruzam múltiplas camadas

## Diferença dos mapas existentes

- `CODEBASE_MAP.md` → onde está o código (estrutural)
- `runtime-map.md` → como o código executa (dinâmico)

## Fonte
`to_review/AI Eng WS v2/AI Dev Loop Arch taskC contextC minimalista.md`, `to_review/Estrutura Definitiva/Extra 5.md`
