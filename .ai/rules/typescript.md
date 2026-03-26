# TypeScript Rules — MMX

Regras especificas para TypeScript/TSX no projeto MMX. Complementam as convencoes gerais em `.ai/AGENTS.md`.

## Types e Interfaces

- Adicionar tipos de parametro e retorno em funcoes exportadas, utilities compartilhadas e metodos publicos de classe
- Deixar TypeScript inferir tipos obvios de variaveis locais
- Usar `interface` para formas de objeto que podem ser estendidas ou implementadas
- Usar `type` para unions, interseccoes, tuplas, mapped types e utility types
- Preferir string literal unions sobre `enum` salvo necessidade de interoperabilidade
- Evitar `any` — usar `unknown` para input externo/nao-confiavel e narrowing seguro

```typescript
// WRONG
export function formatUser(user) { return `${user.name}` }

// CORRECT
interface User { firstName: string; lastName: string }
export function formatUser(user: User): string { return `${user.firstName} ${user.lastName}` }
```

## React Props

- Definir props com `interface` ou `type` nomeado
- Tipar callback props explicitamente
- Nao usar `React.FC` sem razao especifica

## Imutabilidade

- Usar spread operator para updates imutaveis
- Nao mutar objetos recebidos como parametro

```typescript
// WRONG: mutation
user.name = name
// CORRECT: immutability
return { ...user, name }
```

## Error Handling

- Usar `async/await` com `try/catch`
- Narrow `unknown` errors com instanceof antes de acessar propriedades

```typescript
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return "Unexpected error"
}
```

## Input Validation

- Usar Zod para validacao baseada em schema nos limites do sistema (input do usuario, APIs externas)
- Inferir tipos do schema Zod — nao duplicar

```typescript
const schema = z.object({ email: z.string().email() })
type Input = z.infer<typeof schema>
```

## Console.log

- Sem `console.log` em codigo de producao
- Usar logger estruturado quando necessario
- Hook automatico de aviso esta ativo no Claude Code (ver `.claude/settings.json`)

## Relacao com AGENTS.md

Estas regras complementam — nao substituem — as convencoes em `.ai/AGENTS.md`:
- Style geral (double quotes, no semicolons, 2-space indent) permanece em AGENTS.md
- Naming conventions (PascalCase, camelCase, etc.) permanecem em AGENTS.md
- Regras de hooks e arquitetura DDD permanecem em AGENTS.md
