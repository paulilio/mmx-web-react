# Frontend Guidelines

## Component Conventions

- One component per file; filename matches export name in `kebab-case`
- Pages live in `app/`; reusable UI in `components/`
- Modals are co-located with their feature folder (e.g. `components/budget/add-funds-modal.tsx`)
- Primitive/design-system components live in `components/ui/` — do not edit directly

### Component template

```tsx
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
```

## Naming Conventions

| Thing | Convention | Example |
|---|---|---|
| Files | kebab-case | `transaction-form-modal.tsx` |
| Components | PascalCase | `TransactionFormModal` |
| Hooks | camelCase + `use` prefix | `useTransactions` |
| Types/Interfaces | PascalCase | `Transaction`, `AuthUser` |
| Constants | SCREAMING_SNAKE | `MAX_RETRY_COUNT` |
| localStorage keys | `mmx_` prefix | `mmx_transactions` |

## State Management

- **Server / async state**: SWR (`swr`) for data that will hit an API
- **Auth state**: React Context via `AuthProvider` (`hooks/use-auth.tsx`)
- **UI state**: local `useState` inside the component — do not lift unless shared
- **Forms**: React Hook Form + Zod schema; define schemas in `lib/validations.ts`

```ts
// lib/validations.ts
import { z } from "zod"

export const transactionSchema = z.object({
  description: z.string().min(1),
  amount: z.number().positive(),
  date: z.string(),
})
```

## Hooks Guidelines

- One hook per domain entity: `use-transactions.ts`, `use-budget.ts`, etc.
- Hooks must never contain JSX
- Expose typed return: `{ data, isLoading, error, create, update, remove }`
- Always handle loading and error states

## Styling

- Tailwind CSS v4 utility classes only — no inline `style` props
- Use `cn()` from `lib/utils.ts` for conditional classes
- Design tokens defined in `app/globals.css` under `@theme`
- Dark mode via `next-themes`; use semantic tokens (`bg-background`, `text-foreground`)

## Testing Guidelines

- Unit tests: Vitest + Testing Library
- File convention: `*.test.tsx` co-located with the component
- Test user interactions, not implementation details
- E2E: Playwright (optional) in `/e2e` folder

```ts
// components/dashboard/summary-card.test.tsx
import { render, screen } from "@testing-library/react"
import SummaryCard from "./summary-card"

test("renders title", () => {
  render(<SummaryCard title="Saldo" value={1000} />)
  expect(screen.getByText("Saldo")).toBeInTheDocument()
})
```

## Lint & Formatting

- ESLint: `next lint` (extends `next/core-web-vitals`)
- Prettier: single quotes, 2-space indent, trailing commas
- Run before commit: `pnpm lint && pnpm format`
- No `console.log` in production code; use `lib/audit-logger.ts` for tracing
