# Finance Manager

A personal finance tracking application built as a pnpm monorepo. Track income and expenses, organise transactions with hierarchical categories, and get an analytics breakdown of your spending.

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, Vite, TanStack Router, TanStack Query, Tailwind CSS v4, shadcn/ui |
| Backend | Fastify 5, Drizzle ORM, PostgreSQL 16 |
| Shared | Zod schemas and TypeScript types |
| Package manager | pnpm v10 (Node >=22 required) |

## Prerequisites

- Node.js >= 22
- pnpm >= 10 (`npm i -g pnpm`)
- Docker (for the database)

## Running the app (already set up)

```bash
docker compose up -d   # start the database
pnpm dev               # start API + frontend in parallel
```

That's it. Visit http://localhost:5173.

---

## Quick start (first time)

**1. Install dependencies**

```bash
pnpm install
```

**2. Start the database**

```bash
docker compose up -d
```

**3. Configure the API**

```bash
cp packages/api/.env.example packages/api/.env
```

The defaults connect to the Docker database — no edits needed for local development.

**4. Run migrations and seed**

```bash
pnpm --filter @finance-manager/api db:migrate
pnpm --filter @finance-manager/api db:seed
```

**5. Start everything**

```bash
pnpm dev
```

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| API | http://localhost:3001 |
| API health | http://localhost:3001/health |

## Common commands

```bash
# Run all packages in parallel dev mode
pnpm dev

# Run only the API or web
pnpm --filter @finance-manager/api dev
pnpm --filter @finance-manager/web dev

# Type-check all packages
pnpm typecheck

# Build all packages
pnpm build

# Lint all packages
pnpm lint

# Clean all packages
pnpm clean
```

## Database commands

```bash
# Generate a new migration after schema changes
pnpm --filter @finance-manager/api db:generate

# Apply pending migrations
pnpm --filter @finance-manager/api db:migrate

# Seed with default categories, currencies, and sample data
pnpm --filter @finance-manager/api db:seed

# Open Drizzle Studio (visual DB browser)
pnpm --filter @finance-manager/api db:studio
```

## Environment variables (API)

Copy `packages/api/.env.example` to `packages/api/.env`. Key variables:

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3001` | API listen port |
| `DATABASE_URL` | `postgresql://finance:finance@localhost:5432/finance_manager` | Postgres connection string |
| `CORS_ORIGIN` | *(unset)* | Allowed frontend origin; required in production |
| `LOG_LEVEL` | `info` | Pino log level |
| `AI_PROVIDER` | *(unset)* | `mock` / `openai` / `google` — receipt parsing (v2+) |

## API testing (Bruno)

Requests are tested with [Bruno](https://www.usebruno.com/). Open the collection:

1. Open Bruno → **Open Collection** → select the `bruno/` folder at the repo root.
2. Activate the **local** environment (`http://localhost:3001`).

Requests are organised by domain under `bruno/<domain>/`.

## Project structure

```
finance-manager/
├── packages/
│   ├── shared/     # @finance-manager/shared — Zod schemas, types, constants
│   ├── api/        # @finance-manager/api   — Fastify + Drizzle backend
│   └── web/        # @finance-manager/web   — Vite + React frontend
├── bruno/          # API request collection
└── docker-compose.yml
```

### Key data model decisions

- `amount` is always positive; direction is encoded in `type` (`income` | `expense`).
- `transaction_date` is a `DATE` — no timezone handling needed.
- Transfers are two linked transactions joined via a `transfer` table.
- Categories are self-referencing (`parent_id`) for infinite hierarchy.
- Default currency is **EUR**.
- Account balance is computed: `initial_balance + SUM(incomes) − SUM(expenses)`.

## Roadmap

- **v1 (current):** Transaction CRUD, hierarchical categories, merchants & tags, analytics breakdown.
- **v2:** Multi-account UI, transfers UI, AI receipt parsing, Docker/Pi deployment.
