# Deployment

## Local Development

**Requirements:** Node.js 22, pnpm

```bash
# Install dependencies
pnpm install

# Start dev server (http://localhost:3000)
pnpm dev

# Type check
pnpm tsc --noEmit

# Lint
pnpm lint

# Build (validate before pushing)
pnpm build
```

**Direct login shortcut** (mock only): On `/auth`, use the "Login Direto" button to authenticate as `paulilio.ferreira@gmail.com`. Remove this button before production.

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_API_BASE` | No | Base URL for API calls (empty = mock mode) |
| `NEXT_PUBLIC_USE_API` | No | `"true"` switches from localStorage to real API |

Create a `.env.local` for local overrides (never commit this file):

```bash
NEXT_PUBLIC_API_BASE=http://localhost:4000
NEXT_PUBLIC_USE_API=false
```

On Vercel, set these under **Project Settings → Environment Variables** per environment.

## CI Pipeline (GitHub Actions)

```yaml
# .github/workflows/ci.yml (recommended setup)
on: [push, pull_request]
jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - uses: actions/setup-node@v4
        with: { node-version: 22 }
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm tsc --noEmit
      - run: pnpm build
```

## Vercel Deployment

| Event | Environment | URL |
|---|---|---|
| PR opened / push to branch | Preview | `*.vercel.app` (unique per PR) |
| Merge to `main` | Production | Custom domain |

**Deploy flow:**
1. Push to any branch → Vercel builds preview automatically
2. Share preview URL with team for review
3. Merge PR to `main` → production deploy triggers

**Node.js version:** Set to **22** in Vercel Project Settings → General → Node.js Version (matches `engines` in `package.json`).

## Mock vs Production Mode

```
NEXT_PUBLIC_USE_API=false  → localStorage (mock, default)
NEXT_PUBLIC_USE_API=true   → lib/api.ts hits real endpoints
```

To switch to production API:
1. Set `NEXT_PUBLIC_USE_API=true` and `NEXT_PUBLIC_API_BASE=<url>` in Vercel env vars
2. Implement the fetch calls in `lib/api.ts` (stubs are already in place)
3. Remove the "Login Direto" button from `app/auth/page.tsx`
4. Remove `lib/migration-service.ts` logic after data is fully migrated to the database

## App Version

Version is tracked in `package.json` and read at runtime via `lib/config.ts`. Update `package.json` version on every release — the footer picks it up automatically.
