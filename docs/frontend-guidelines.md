# Diretrizes de Frontend

## Convencoes de Componentes

- Um componente por arquivo; o nome do arquivo deve seguir `kebab-case`
- Paginas ficam em `app/`; UI reutilizavel em `components/`
- Modais ficam co-localizados por feature (ex.: `components/budget/add-funds-modal.tsx`)
- Componentes primitivos/design-system ficam em `components/ui/` e nao devem ser editados diretamente

### Template de componente

\`\`\`tsx
// components/feature/my-component.tsx
"use client"

import { type FC } from "react"

interface MyComponentProps {
  title: string
  onAction: () => void
}

const MyComponent: FC<MyComponentProps> = ({ title, onAction }) => {
  return <div>{title}</div>
}

export default MyComponent
\`\`\`

## Convencoes de Nomenclatura

| Item | Convencao | Exemplo |
|---|---|---|
| Arquivos | kebab-case | `transaction-form-modal.tsx` |
| Componentes | PascalCase | `TransactionFormModal` |
| Hooks | camelCase + prefixo `use` | `useTransactions` |
| Tipos/Interfaces | PascalCase | `Transaction`, `AuthUser` |
| Constantes | SCREAMING_SNAKE | `MAX_RETRY_COUNT` |
| localStorage keys | `mmx_` prefix | `mmx_transactions` |

## Gerenciamento de Estado

- **Estado server/assinc**: SWR (`swr`) para dados que vao para API
- **Estado de auth**: React Context via `AuthProvider` (`hooks/use-auth.tsx`)
- **Estado de UI**: `useState` local no componente; nao elevar sem necessidade
- **Formularios**: React Hook Form + Zod; definir schemas em `lib/shared/validations.ts`

\`\`\`ts
// lib/shared/validations.ts
import { z } from "zod"

export const transactionSchema = z.object({
  description: z.string().min(1),
  amount: z.number().positive(),
  date: z.string(),
})
\`\`\`

## Diretrizes de Hooks

- Um hook por entidade de dominio: `use-transactions.ts`, `use-budget.ts`, etc.
- Hooks nunca devem conter JSX
- Expor retorno tipado: `{ data, isLoading, error, create, update, remove }`
- Sempre tratar estados de loading e erro

## Estilizacao

- Usar classes utilitarias do Tailwind CSS v4; evitar `style` inline
- Usar `cn()` de `lib/shared/utils.ts` para classes condicionais
- Design tokens em `app/globals.css` sob `@theme`
- Dark mode via `next-themes`; usar tokens semanticos (`bg-background`, `text-foreground`)

## Diretrizes de Testes

- Testes unitarios: Vitest + Testing Library
- Convencao de arquivo: `*.test.tsx` co-localizado com o componente
- Testar interacoes do usuario, nao detalhes de implementacao
- E2E: Playwright (opcional) na pasta `/e2e`

\`\`\`ts
// components/dashboard/summary-card.test.tsx
import { render, screen } from "@testing-library/react"
import SummaryCard from "./summary-card"

test("renders title", () => {
  render(<SummaryCard title="Saldo" value={1000} />)
  expect(screen.getByText("Saldo")).toBeInTheDocument()
})
\`\`\`

## Lint e Formatacao

- ESLint: `next lint` (extends `next/core-web-vitals`)
- Prettier: aspas duplas, indentacao de 2 espacos, trailing commas
- Rodar antes do commit: `pnpm lint && pnpm type-check`
- Evitar `console.*` em codigo de producao; usar logger central (`lib/shared/logger.ts`) e `audit-logger` apenas para trilhas de auditoria
