# Coding Guidelines

## Code Style
- TypeScript strict-first; avoid `any` unless no safe alternative exists.
- Use double quotes, no semicolons, 2-space indentation.
- Keep changes minimal and composable.

## Naming Conventions
- Files: `kebab-case` (`transaction-form-modal.tsx`, `use-transactions.ts`).
- Components/interfaces/types: `PascalCase`.
- Variables/functions/hooks: `camelCase`.
- Hooks must start with `use`.
- Constants: `SCREAMING_SNAKE_CASE`.

## Component Patterns
- One primary component per file.
- Keep feature UI under `components/<feature>/`.
- Keep route pages in `app/<feature>/page.tsx`.
- Use `"use client"` only when browser APIs/stateful hooks are required.

## Hook and Service Patterns
- Hooks should expose typed state + typed operations.
- Hooks must not contain JSX.
- Reuse existing hooks/services before creating new abstractions.
- Keep API/storage details out of components.

## TypeScript and Contracts
- Domain contracts: `lib/types.ts`.
- Auth contracts: `types/auth.ts`.
- Keep date fields in `YYYY-MM-DD` for transactions/forms.
- Preserve existing union literals for status/type fields.

## Validation and Forms
- Use React Hook Form + Zod.
- Prefer schemas from `lib/validations.ts`.
- Return user-facing validation messages in Portuguese.

## Styling
- Use Tailwind utility classes.
- Use `cn` from `lib/utils.ts` for conditional class composition.
- Avoid inline style props unless unavoidable.

## Error Handling
- Use typed errors where available (for example `ApiError`).
- Do not surface raw technical errors directly to users.
- Keep technical logs namespaced when needed (`[transactions] ...`).

## Avoid
- Do not edit `components/ui/**` unless requested.
- Do not introduce new direct storage access in feature UI.
- Do not add production-path test shortcuts or hardcoded auth tokens/codes.
