# 🚀 Finance Manager — Implementation Plan

> **Who this is for:** You. A person with ADHD who is great at starting things and terrible at finishing them. Every step in this plan is designed to be completable in **one sitting (30–90 min)** and end with something **visible and satisfying** on screen.

> [!CAUTION]
> **THE GOLDEN RULE:** Never end a session in a broken state. If you're running out of time, stop at the last working checkpoint — not in the middle of something. A broken project is an abandoned project.

---

## How This Plan Works

```
📦 Milestone    = a meaningful chunk of progress (1-3 sessions)
   └── 🔨 Step  = one session of work (30-90 min), always ends with a visible win
       └── 📋 Tasks = the exact things you do, in order
```

**The plan has 3 acts:**

| Act | Milestones | Goal | Sessions |
|-----|-----------|------|----------|
| **Act 1: Get It Running** | M1 → M3 | Empty repo → API + Web + Database all talking to each other | ~4 sessions |
| **Act 2: Make It Usable** | M4 → M8 | Add transactions, see them, categorize them, view stats | ~8 sessions |
| **Act 3: Make It Good** | M9 → M13 | Merchants, tags, category trees, polish, deploy to Pi | ~8 sessions |

> [!IMPORTANT]
> **Your "I won't quit" milestone is at the end of Act 2 (M8).** After that, you have a working personal finance tracker with monthly stats. Everything in Act 3 is bonus. Optimize for reaching M8 as fast as possible.

---

## Act 1: Get It Running 🏗️

> **Goal:** Go from an empty folder to a running API + frontend + database.
> **Sessions needed:** ~4
> **Difficulty:** Mostly setup. A bit boring, but SHORT. Push through.

---

### M1: Environment & Monorepo Skeleton

> *"Hello world from both the API and the frontend."*

#### ✅ Step 1.1 — Install everything (~30 min)

- [x] Install **Node.js 22+** from [nodejs.org](https://nodejs.org) (LTS is fine)
- [x] Install **pnpm** globally: `npm install -g pnpm`
- [x] Install **Docker Desktop** from [docker.com](https://www.docker.com/products/docker-desktop/) — just install and start it, that's all for now
- [x] Install these **VS Code extensions** (optional but helpful):
  - ESLint
  - Tailwind CSS IntelliSense
  - Docker
  - Drizzle ORM (community)

**Win:** Run `node -v`, `pnpm -v`, `docker -v` — all three print version numbers.

---

#### ✅ Step 1.2 — Monorepo + Shared package (~45 min)

- [x] In `finance-manager/`, create the root config files:
  - `pnpm-workspace.yaml` — defines `packages/*` as workspaces
  - `package.json` — root with scripts
  - `tsconfig.base.json` — shared TypeScript config
- [x] Create `packages/shared/`:
  - `package.json` (name: `@finance-manager/shared`)
  - `tsconfig.json` extending the base
  - `src/types/index.ts` — export a simple `Transaction` type
  - `src/schemas/index.ts` — export a simple Zod schema for a transaction
  - `src/index.ts` — barrel export
- [x] Run `pnpm install` from root — confirm no errors

**Win:** You have a monorepo structure. The shared package compiles. You can import types from it.

---

#### ✅ Step 1.3 — API "Hello World" with Fastify (~45 min)

- [x] Create `packages/api/`:
  - `package.json` (name: `@finance-manager/api`, depends on `@finance-manager/shared`)
  - `tsconfig.json`
  - Install deps: `fastify`, `@fastify/cors`, `tsx` (for dev running)
  - `src/app.ts` — create a Fastify server with one route: `GET /api/health` → `{ status: "ok" }`
  - Add a `dev` script: `tsx watch src/app.ts`
- [x] Run `pnpm --filter api dev` → see `Server listening on http://localhost:3001`
- [x] Open browser → `http://localhost:3001/api/health` → see `{ "status": "ok" }`

**Win:** You have a running API. It responds. It's real. 🎉

---

#### ✅ Step 1.4 — Web "Hello World" with Vite + React (~45 min)

- [x] Create `packages/web/` using Vite:
  - Run `pnpm create vite packages/web --template react-ts` (or scaffold manually)
  - Name: `@finance-manager/web`, add dependency on `@finance-manager/shared`
  - Install additional deps: TanStack Router, TanStack Query, Tailwind CSS v4
  - Set up Tailwind CSS v4 (just the base import — no custom config needed yet)
- [x] Create a minimal `App.tsx` with TanStack Router:
  - Root layout with just `<h1>Finance Manager</h1>`
  - One route: `/` → `<p>It works!</p>`
- [x] Add a `dev` script, run `pnpm --filter web dev`
- [x] Open browser → `http://localhost:5173` → see "Finance Manager" and "It works!"

**Win:** Frontend is running. Both API and web can run simultaneously. The monorepo works.

---

### M2: Database Setup

> *"PostgreSQL is running, the schema exists, and seed data is in."*

#### ✅ Step 2.1 — PostgreSQL via Docker + Drizzle schema (~60 min)

- [x] Create `docker-compose.yml` in root with **just PostgreSQL**:
  ```yaml
  services:
    db:
      image: postgres:16
      ports:
        - "5432:5432"
      environment:
        POSTGRES_USER: finance
        POSTGRES_PASSWORD: finance
        POSTGRES_DB: finance_manager
      volumes:
        - pgdata:/var/lib/postgresql/data
  volumes:
    pgdata:
  ```
- [x] Run `docker compose up -d` — PostgreSQL is now running. That's it. That's Docker for now.
- [x] In `packages/api/`:
  - Install: `drizzle-orm`, `postgres` (driver), `drizzle-kit`, `dotenv`
  - Create `.env`: `DATABASE_URL=postgresql://finance:finance@localhost:5432/finance_manager`
  - Create `src/db/schema.ts` — define ALL tables from the architecture plan:
    - `currencies`, `accounts`, `categories`, `merchants`, `tags`, `transactions`, `transactionTags`, `transfers`
  - Create `drizzle.config.ts` pointing to the schema
- [x] Run `pnpm drizzle-kit generate` → see SQL migration files appear
- [x] Run `pnpm drizzle-kit migrate` → tables are created in PostgreSQL

**Win:** Open Docker Desktop → click on the postgres container → open terminal → `psql -U finance finance_manager` → `\dt` → see all your tables listed. Your database is REAL.

---

#### ✅ Step 2.2 — Seed data + DB connection in the API (~45 min)

- [x] Create `src/db/index.ts` — export a `db` instance using the Drizzle postgres driver
- [x] Create `src/db/seed.ts`:
  - Insert the default currency (EUR)
  - Insert the default account (Main Account)
  - Insert default categories (Uncategorized for `income` and `expense` separately, `isDefault: true`)
  - Make it idempotent (check before insert, so you can run it multiple times)
- [x] Add a `db:seed` script to `package.json`: `node --env-file=.env --import tsx/esm src/db/seed.ts`
- [x] Run `pnpm --filter api db:seed` → seed data is inserted
- [x] Create a Fastify plugin (`src/plugins/db.ts`) that attaches `db` to the Fastify instance
- [x] Update `GET /api/health` to also query `SELECT 1` from the DB and confirm connection

**Win:** Hit `GET /api/health` → see `{ "status": "ok", "db": "connected" }`. The API talks to the database.

---

### M3: Connect Frontend to Backend

> *"The web app fetches real data from the API."*

#### ✅ Step 3.1 — TanStack Query + first API call (~45 min)

- [x] In `packages/web/`:
  - Set up TanStack Query provider in `main.tsx` (QueryClient + QueryClientProvider)
  - Create `src/api/client.ts` — a typed `apiFetch<T>` wrapper with the base URL (`/api` — relative); throws `ApiError` on non-2xx
  - Create `src/api/health.ts` — a `useHealthCheck()` query hook
  - Proxy API requests in `vite.config.ts` (proxy `/api` → `localhost:3001`) to avoid CORS issues
- [x] Update the home page to call `useHealthCheck()` and display the result

**Win:** Open the web app → see "🟢 API Connected, DB: connected". **The full stack is wired up.** Frontend → API → Database. This is the foundation. Everything else is building on top of this.

---

> [!IMPORTANT]
> **🎉 ACT 1 COMPLETE.** You have a working full-stack app with a monorepo, running API, running frontend, and a real database. Total: ~4 sessions. Now the fun begins.

---

## Act 2: Make It Usable 💸

> **Goal:** Be able to add transactions, see them in a list, categorize them, and view monthly stats.
> **Sessions needed:** ~8
> **This is where the dopamine starts.** Every session adds a visible feature.

---

### M4: Transaction API

> *"You can create, read, update, and delete transactions via the API."*

#### Step 4.1 — Transaction CRUD endpoints (~60 min)

- [x] Create `src/modules/transactions/`:
  - `transaction.repository.ts` — database queries:
    - `findAll(filters)` — with optional date range, category, type filters + pagination (limit/offset)
    - `findById(id)`
    - `create(data)` — default `transactionDate` to today if not provided
    - `update(id, data)`
    - `delete(id)`
  - `transaction.service.ts` — business logic (thin wrapper for now, validates category exists, etc.)
  - `transaction.routes.ts` — Fastify routes:
    - `GET /api/transactions` (list with query params)
    - `GET /api/transactions/:id`
    - `POST /api/transactions`
    - `PUT /api/transactions/:id`
    - `DELETE /api/transactions/:id`
- [x] Register the routes in `app.ts`
- [x] Add Bruno request files in `bruno/transactions/` for each endpoint
- [x] Test manually using Bruno:
  - `POST /api/transactions` with `{ "type": "expense", "amount": 42.50, "categoryId": "<uncategorized-uuid>" }`
  - `GET /api/transactions` → see your transaction in the list

**Win:** You can create a transaction via Bruno and get it back. The data persists in PostgreSQL. CRUD works.

---

### M5: App Shell & Layout

> *"The web app has a real layout with sidebar navigation."*

#### ✅ Step 5.1 — Custom design system + app shell (~60 min)

> **Note:** This was implemented outside the original plan using a custom CSS design system instead of shadcn/ui. The result looks better and is fully owned.

- [x] Built a custom CSS design system in `src/styles/`:
  - `semantic.css` — CSS variables for all semantic color tokens (background, surface, primary, income, expense, etc.)
  - `themes/dark.css` — dark theme implementation
  - `bindings.css` — Tailwind utility bindings
  - `base.css` — typography and resets
- [x] Created `src/lib/tokens.ts` — design tokens for runtime JS contexts (Recharts, canvas)
- [x] Created `src/lib/category-meta.ts` — maps category names to icons + colors (10 categories)
- [x] Created the app shell layout:
  - `src/components/layout/sidebar.tsx` — collapsible sidebar (w-14 collapsed / w-56 expanded), brand logo, nav links, net worth display
  - `src/components/layout/top-bar.tsx` — period navigation (month prev/next), "Add Transaction" button
  - `src/routes/__root.tsx` — root layout composing Sidebar + TopBar + Outlet
- [x] Set up TanStack Router file-based routing with these routes:
  - `/` → Dashboard page
  - `/accounts` → Accounts page (stub)
  - `/theme` → Theme showcase page

**Win:** A beautiful app shell with collapsible sidebar and period navigation. Dark, polished, custom. It already looks like a real product.

---

### ~~M5.5~~ Dashboard UI Shell (done early, wired to static data)

> *"The dashboard looks complete — but runs on hardcoded numbers. Wiring it to real API data happens in M8."*

#### ✅ Step — Dashboard components with static data

- [x] Created `src/components/dashboard/summary-cards.tsx` — three cards: Total Income, Total Expenses, Net Cash Flow with vs-last-month percentage
- [x] Created `src/components/dashboard/expenses-by-category.tsx` — CSS conic-gradient donut chart + 5-column category grid with icons and amounts
- [x] Created `src/components/dashboard/recent-transactions.tsx` — table with merchant avatar, category badge, date, color-coded amount
- [x] Wired into `src/routes/index.tsx` (the `/` route) with hardcoded placeholder data

**Win:** The dashboard is visually complete and satisfying. All the hard UI work is done. It just needs real data.

---

### M6: Transaction List UI

> *"You can see your transactions in the web app."*

#### Step 6.1 — Transaction list page (~60–90 min)

- [ ] Create TanStack Query hooks in `src/api/transactions.ts`:
  - Export `transactionsQueryKey` const
  - `useTransactions(filters)` — `GET /api/transactions`
  - `useCreateTransaction()` — `POST /api/transactions` (mutation)
  - `useUpdateTransaction()` — `PUT /api/transactions/:id` (mutation)
  - `useDeleteTransaction()` — `DELETE /api/transactions/:id` (mutation)
- [ ] Add `/transactions` route: `src/routes/transactions.tsx`
- [ ] Add "Transactions" nav link to the sidebar
- [ ] Create `src/components/transactions/TransactionList.tsx`:
  - Fetch transactions with `useTransactions()`
  - Display as a styled table (match the design language from `recent-transactions.tsx`):
    - Each row: date | merchant/description | category badge | amount (green income / red expense)
    - Empty state: "No transactions yet. Add your first one!"
  - Loading skeleton state

**Win:** Open `/transactions` → see your transactions listed. **You're looking at real data from your database in a real UI.**

---

### M7: Add Transaction Form

> *"You can add a transaction from the UI without touching the API directly."*

#### ✅ Step 7.1 — "Add Transaction" dialog (~60–90 min)

- [x] Install: `react-hook-form`, connect with Zod schemas from `@finance-manager/shared`
- [x] Build a modal/dialog using CSS (or a headless Radix `Dialog` — `pnpm add @radix-ui/react-dialog`)
- [x] Create `src/components/transactions/TransactionDialog.tsx`:
  - Triggered by the "Add Transaction" button in `top-bar.tsx` (already exists — just wire it up)
  - Form fields:
    - **Type**: toggle — Income or Expense (default: Expense)
    - **Amount**: number input (required)
    - **Date**: date input, type="date" (defaults to today)
    - **Category**: `<select>` fetching categories from `GET /api/categories` (add that endpoint first — see note below)
  - On submit: call `useCreateTransaction()` mutation
  - On success: close dialog, invalidate `transactionsQueryKey`
- [x] Add a minimal `GET /api/categories` endpoint (flat list, no hierarchy needed yet) so the form has categories to pick from

**Win:** Click "Add Transaction" → fill in the form → submit → dialog closes → transaction appears in the list instantly. **This is the core loop of the entire app. You just built it.** 🎉

---

#### ✅ Step 7.2 — Edit & Delete transactions (~45–60 min)

- [x] Click a transaction row → opens the same dialog pre-filled with existing data
- [x] Add "Edit" mode to `TransactionDialog` — calls `useUpdateTransaction()`
- [x] Add a "Delete" button (with confirmation) — calls `useDeleteTransaction()`
- [x] On success: list refreshes, brief visual feedback (e.g. row flash or count update)

**Win:** Full CRUD from the UI. Add, edit, delete — all from the browser. You never need to touch the API directly again.

---

### M8: Category Management

> *"You can create, rename, and organize your categories."*

#### ✅ Step 8.1 — Category CRUD API (~45 min)

- [x] Expand `src/modules/categories/` (stub already exists from M7 step 7.1):
  - `category.repository.ts`:
    - `findAll()` — return flat list
    - `create(data)` — name, type (income/expense), icon, color
    - `update(id, data)`
    - `delete(id, reassignToCategoryId)` — reassign transactions, then delete
  - `category.routes.ts` — full CRUD endpoints
- [x] Protect the default "Uncategorized" categories from deletion (check `isDefault` flag)
- [x] Add Bruno request files in `bruno/categories/`

**Win:** Category CRUD works via API. Default categories can't be deleted.

---

### M9: Dashboard with Monthly Stats 📊

> *"You can see how much you spent vs earned this month."*

> [!IMPORTANT]
> **This is your "I won't quit" milestone.** After this step, the app is genuinely useful to you personally.

#### Step 9.1 — Analytics API endpoint (~45 min)

Single endpoint that returns everything the dashboard needs in one request.

- [ ] Create `src/modules/analytics/`:
  - `analytics.repository.ts`:
    - `getDashboard(startDate, endDate)` — runs two queries:
      1. SUM income / SUM expenses → `{ totalIncome, totalExpenses, net }`
      2. LEFT JOIN all expense categories with their transaction totals → always returns every category, `amount: 0` when no transactions
  - `analytics.routes.ts`:
    - `GET /api/analytics/dashboard?start=2026-04-01&end=2026-04-30`
    - Response: `{ summary: { totalIncome, totalExpenses }, expensesByCategory: [{ categoryId, name, icon, color, amount }] }`
    - `start`/`end` are plain date strings — client derives them from the month picker, API stays range-agnostic (ready for future week/year views)
- [ ] Register routes in `app.ts`
- [ ] Add Bruno request file in `bruno/analytics/`
- [ ] Test: add a few transactions via the UI, then hit the endpoint in Bruno

**Win:** The API returns your spending summary. Real numbers from real data you entered.

---

#### Step 9.2 — Wire dashboard to real data (~45–60 min)

> **Note:** The dashboard UI is already built (summary cards, donut chart, recent transactions table). This step replaces the hardcoded placeholder data with real API calls.

- [ ] Create `src/api/analytics.ts`:
  - Export `analyticsBreakdownQueryKey`, `analyticsSummaryQueryKey`
  - `useAnalyticsBreakdown(startDate, endDate)`
  - `useAnalyticsSummary(startDate, endDate)`
- [ ] Create `src/api/transactions.ts` if not done in M6 (or reuse) — need recent transactions
- [ ] Update `src/routes/index.tsx`:
  - Read selected month from TopBar's period state via **TanStack Router search params** (URL-based — shareable, bookmarkable, browser back/forward works for free)
  - Pass date range (start/end of month) to the hooks
  - Feed real data into `<SummaryCards>`, `<ExpensesByCategory>`, `<RecentTransactions>`
- [ ] Handle loading state (skeleton) and empty state ("No transactions this month. Start tracking!")

**Win:** Open the dashboard → see your actual monthly income, expenses, net balance, and real category breakdown. **The app is now genuinely useful.** You can track your finances. This is the moment.

---

> [!IMPORTANT]
> **🎉 ACT 2 COMPLETE.** You have a fully functional personal finance tracker. You can add income/expenses, see them in a list, categorize them, and view monthly statistics. **If you stop here, you still have a useful app.** Everything after this is enhancement.

---

## Act 3: Make It Good ✨

> **Goal:** Add the nice-to-haves that make the app feel complete.
> **Sessions needed:** ~8
> **Every milestone here is independent.** Do them in any order. Skip any you don't care about.

---

### M9: Dashboard Enhancements

> *"Richer stats — income breakdown and month-over-month comparison."*

#### Step 9.1 — Income breakdown toggle (~30 min)

- [ ] Add `incomeByCategory` array to `GET /api/analytics/dashboard` response (same shape as `expensesByCategory`)
- [ ] Add an Expense / Income toggle to the `ExpensesByCategory` dashboard card — switches the grid and donut between the two breakdowns

#### Step 9.2 — vs last month comparison (~30 min)

- [ ] Extend `GET /api/analytics/dashboard` to also accept a comparison period (or compute it server-side from the same `start`/`end`)
- [ ] Re-add the `% vs last month` row to each `SummaryCards` card, driven by real API data

---

### M11: Category Hierarchy (Tree)

> *"Categories can have subcategories, infinitely nested."*

#### Step 11.1 — Recursive category tree API (~60 min)

- [ ] Update `category.repository.ts`:
  - `findTree()` — use PostgreSQL recursive CTE:
    ```sql
    WITH RECURSIVE category_tree AS (
      SELECT *, 0 as depth FROM categories WHERE parent_id IS NULL
      UNION ALL
      SELECT c.*, ct.depth + 1
      FROM categories c
      JOIN category_tree ct ON c.parent_id = ct.id
    )
    SELECT * FROM category_tree ORDER BY depth, sort_order;
    ```
  - Build the tree structure in the service layer (flat rows → nested objects)
  - `move(id, newParentId)` — update parent_id with cycle detection
- [ ] Update `GET /api/categories` to return the tree structure

**Win:** API returns a nested tree. Categories like `Food > Groceries > Organic` work.

---

#### Step 11.2 — Category tree UI (~60–90 min)

- [ ] Create `src/components/categories/CategoryTree.tsx`:
  - Collapsible tree view with indentation
  - Click arrow to expand/collapse children
  - "Add subcategory" option on each category's context menu
- [ ] Update the transaction form's category selector:
  - Show as a tree dropdown (indented names, e.g., `Food > Groceries`)

**Win:** Visual category tree with collapsible hierarchy. Clean and satisfying to interact with.

---

### M12: Merchants & Tags

> *"Transactions can have a merchant and multiple tags."*

#### Step 12.1 — Merchant & Tag CRUD API (~45 min)

- [ ] Create `src/modules/merchants/`:
  - CRUD + search endpoint (`GET /api/merchants?q=ama` for autocomplete)
- [ ] Create `src/modules/tags/`:
  - CRUD + search endpoint
- [ ] Update transaction create/update to accept `merchantId` and `tagIds`
- [ ] Update transaction list response to include merchant name and tag names

**Win:** Transactions can now carry merchant and tag data.

---

#### Step 12.2 — Autocomplete UI in transaction form (~60 min)

- [ ] Add to `TransactionDialog`:
  - **Merchant**: text input with autocomplete — type to search existing merchants, create new inline
  - **Tags**: multi-select — search and select multiple tags, create new inline
- [ ] Update `TransactionList` to show merchant name and tag badges on each row

**Win:** When adding a transaction, type "Amazon" → select or create the merchant → add tags like "electronics", "personal". Feels professional.

---

### M13: Filters & Enhanced List

> *"You can filter transactions by date, category, type, merchant, tag."*

#### Step 13.1 — Transaction filters UI (~60–90 min)

- [ ] Add a filter bar above the transaction list:
  - Date range picker (start date – end date, using `<input type="date">`)
  - Category dropdown
  - Type filter (All / Income / Expense)
- [ ] Filters update URL search params (TanStack Router) → page is shareable/bookmarkable
- [ ] Filters are passed to `useTransactions()` → API filters the results
- [ ] Show active filter count badge on a "Filters" button

**Win:** Filter your transactions by any dimension. "Show me all expenses in March" — done.

---

### M14: Polish & Deploy 🚀

> *"Responsive, error-handled, and running on your Raspberry Pi."*

#### Step 14.1 — UX Polish (~60 min)

- [ ] **Toast notifications**: build a simple toast system (or use `sonner` — `pnpm add sonner`) for success/error feedback on all mutations
- [ ] **Loading states**: skeleton loaders on lists and dashboard cards
- [ ] **Empty states**: friendly messages when no data exists (already partially done on dashboard)
- [ ] **Error boundaries**: catch and display API errors gracefully
- [ ] **Responsive design**: test on mobile viewport, ensure sidebar collapses, forms are usable on small screens

**Win:** The app feels polished. No janky loading, no cryptic errors, works on your phone's browser.

---

#### Step 14.2 — Docker Compose for Raspberry Pi (~60 min)

- [ ] Create a `Dockerfile` for the API:
  - Multi-stage build: build TypeScript → run with Node
  - Include migration + seed as part of startup
- [ ] Create a `Dockerfile` for the Web:
  - Build the Vite static bundle → served by Caddy (see below)
- [ ] Update `docker-compose.yml`:
  ```yaml
  services:
    db:
      image: postgres:16
      # ... (existing config)
    api:
      build: ./packages/api
      depends_on: [db]
      environment:
        DATABASE_URL: postgresql://finance:finance@db:5432/finance_manager
    caddy:
      image: caddy:2
      ports:
        - "80:80"
        - "443:443"
      volumes:
        - ./Caddyfile:/etc/caddy/Caddyfile
        - caddy_data:/data
      depends_on: [api]
  volumes:
    caddy_data:
  ```
- [ ] Create `Caddyfile` in repo root:
  ```
  your-domain-or-ddns {
      reverse_proxy /api/* api:3001
      root * /srv
      file_server
  }
  ```
- [ ] Configure port forwarding on your router: ports 80 + 443 → Pi's local IP
- [ ] Set up a free DDNS hostname (e.g. DuckDNS) so your Pi is reachable from mobile data
- [ ] Run `docker compose up --build` → entire app runs in containers, HTTPS handled automatically by Caddy

**Win:** `docker compose up` on your Raspberry Pi → open `http://<pi-ip>` on your phone → full app, tracked finances, charts. **Project complete.** 🏆

---

## Quick Reference: Session Planner

Can't decide what to do today? Use this:

| I have... | Do this | Milestone |
|-----------|---------|-----------|
| 45 min | Step 9.1 (analytics API endpoint) | M9 |
| 60-90 min | Step 9.2 (wire dashboard to real data) | M9 |
| Feeling lazy | Step 14.1 — add toasts and loading states (polish is easy dopamine) | M14 |

**Where you are right now:** M9 is next. Start there.

---

## Momentum Rules 🧠

1. **One session = one step.** Don't try to do two steps. If you finish early, take the win and stop.
2. **Always commit after a win.** `git add . && git commit -m "M4.1: Transaction CRUD API works"`. Seeing the git log grow is motivating.
3. **If you're stuck > 15 minutes, ask for help.** Don't spiral. Ping me (or ChatGPT, or Stack Overflow). Stuck = abandoned.
4. **Skip Act 3 milestones freely.** M9-M13 are independent. Do whichever sounds fun today. Or don't. The app works without them.
5. **Never refactor during a feature session.** Write it ugly, make it work, commit. Refactor is a separate session (or never).

---

> *"The best app is the one you actually finish."*
> — Someone who has 47 abandoned repos
