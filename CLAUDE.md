# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Ground rules

- **Never commit or push without explicit user request.** Always wait to be told before running any `git commit` or `git push`.
- **Shell is bash on Windows.**
- **Every clickable element must have `cursor-pointer`** (buttons, toggles, links, icon buttons). Add `disabled:cursor-not-allowed` on submit buttons that can be disabled. The working directory is already set to the repo root — never use `cd` to navigate there. Paths like `/mnt/c/...` do not exist; use Windows-style absolute paths (e.g. `C:\Users\...`) only when a tool requires an absolute path. For `pnpm` commands, run them directly from the repo root without a `cd` prefix.

## Commands

```bash
# Run all packages in dev mode (parallel)
pnpm dev

# Build all packages
pnpm build

# Lint all packages
pnpm lint

# Run in a specific package
pnpm --filter @finance-manager/api dev
pnpm --filter @finance-manager/web dev
pnpm --filter @finance-manager/shared typecheck

# Clean all packages
pnpm clean
```

Package manager: **pnpm** (v10.8.1). Node >=22 required. Do not use npm or yarn.

## API Testing

API requests are tested with **Bruno**. The collection lives in `bruno/` at the repo root.

To use it: open Bruno → **Open Collection** → select the `bruno/` folder → activate the **local** environment (`http://localhost:3001`).

Requests are organised into subdirectories by domain (e.g. `bruno/health/`, `bruno/transactions/`). Add a new `.bru` file in the matching subdirectory whenever a new endpoint is implemented.

## Architecture

This is a **pnpm monorepo** with three packages under `packages/`:

- `packages/shared` — `@finance-manager/shared`: Zod schemas, TypeScript types, and constants shared by both frontend and backend. No build step — other packages import TypeScript source directly via the `exports` field.
- `packages/api` — Fastify + Drizzle ORM + PostgreSQL backend.
- `packages/web` — Vite + React 19 SPA frontend.

### Stack

**Frontend** (`packages/web`): React 19, TanStack Router (type-safe routing), TanStack Query (server state), Zustand (client state), shadcn/ui + Radix UI, Tailwind CSS v4, Recharts, React Hook Form + Zod, Lucide React.

**Backend** (`packages/api`): Fastify, Drizzle ORM, PostgreSQL 16, Zod (shared from `@finance-manager/shared`).

### Data model key decisions

- `amount` is always a positive decimal; direction is encoded in `type` (`income` | `expense`).
- `transaction_date` is a `DATE` (not timestamp) — no timezone handling needed.
- Transfers are modeled as two linked transactions (expense on source, income on destination) joined via a `transfer` table — keeps aggregation queries clean.
- Categories are self-referencing (`parent_id`) for infinite hierarchy; PostgreSQL recursive CTEs are used to query the full tree.
- Each transaction type has exactly one default category with `is_default = true` (seed: "Uncategorized" for both `income` and `expense`). There is no `any` category type.
- Default currency is **EUR**.
- Account balance = `initial_balance` + SUM(incomes) − SUM(expenses) — never stored directly.

### AI adapter pattern (v2+)

`packages/api/src/ai/ai.adapter.ts` defines `IAITransactionParser` with a single method `parseImage(image, mimeType)`. Provider implementations (OpenAI, Google, Mock) are selected via `AI_PROVIDER` env var. The interface is defined now so it can be plugged in later without refactoring.

### Frontend API layer (`packages/web/src/api/`)

- All API calls go through `apiFetch<T>(path, options?)` from `src/api/client.ts`. Never call `fetch()` directly in hooks — `apiFetch` throws `ApiError` on non-2xx responses, which TanStack Query needs to treat them as errors.
- Every query hook file exports a `*QueryKey` const alongside the hook. This allows other parts of the app to invalidate or prefetch the same query without duplicating the key string.
- Query hook files are co-located by domain: `src/api/health.ts`, `src/api/transactions.ts`, etc.
- ReactQueryDevtools is mounted in `main.tsx` (automatically excluded from production builds).
- `staleTime` is `0` in dev (always refetch) and `60s` in production (`import.meta.env.PROD`).

### Routing structure (`packages/api`)

Business domain modules live under `src/modules/` and follow the pattern: `<domain>.routes.ts` → `<domain>.service.ts` → `<domain>.repository.ts`.

Infrastructure routes (health checks, etc.) that have no service/repository layer live under `src/routes/`.

### MVP scope

v1 covers: transaction CRUD, category management (infinite hierarchy), merchants & tags, and a basic analytics breakdown. Multi-account UI, transfers UI, AI parsing, and Docker/Pi deployment are v2+.
