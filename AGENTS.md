# AGENTS

Use this file as the entrypoint for AI coding agents (Copilot, Codex, v0, and similar tools).

## Read Order (Mandatory)
1. `.github/copilot-instructions.md`
2. `.ai/project-context.md`
3. `.ai/architecture.md`
4. `.ai/coding-guidelines.md`
5. `.ai/testing-guidelines.md`
6. `.ai/repo-map.md`

## Operating Rules
- Follow repository conventions exactly (naming, file placement, TypeScript style).
- Respect architecture boundaries:
  - `app` for route pages/layouts
  - `components` for UI
  - `hooks` for domain logic
  - `lib/api.ts` as data boundary
- Prefer extending existing hooks/services over introducing parallel patterns.
- Do not edit `components/ui/**` unless explicitly requested.
- Keep user-facing messages in Portuguese when adding or changing UI copy.

## Data and API Constraints
- Use hooks + `lib/api.ts` for data access.
- Preserve `userId` isolation in reads/writes.
- Use `mmx_` prefix for mock storage keys.
- Keep transaction/form dates in `YYYY-MM-DD`.

## Testing Expectations
- For new behavior, add/update tests following `.ai/testing-guidelines.md`.
- Prefer mocking `lib/api.ts` boundary rather than deep implementation internals.

## Build and Validation
- Before finalizing changes, run:
  - `pnpm lint`
  - `pnpm tsc --noEmit`
  - `pnpm build`
