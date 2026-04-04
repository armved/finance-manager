# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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
- Exactly one category has `is_default = true` (seed: "Uncategorized").
- Account balance = `initial_balance` + SUM(incomes) − SUM(expenses) — never stored directly.

### AI adapter pattern (v2+)

`packages/api/src/ai/ai.adapter.ts` defines `IAITransactionParser` with a single method `parseImage(image, mimeType)`. Provider implementations (OpenAI, Google, Mock) are selected via `AI_PROVIDER` env var. The interface is defined now so it can be plugged in later without refactoring.

### Routing structure (`packages/api`)

Modules follow the pattern: `<domain>.routes.ts` → `<domain>.service.ts` → `<domain>.repository.ts`. All modules live under `src/modules/`.

### MVP scope

v1 covers: transaction CRUD, category management (infinite hierarchy), merchants & tags, and a basic analytics breakdown. Multi-account UI, transfers UI, AI parsing, and Docker/Pi deployment are v2+.
