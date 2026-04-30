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
| **Act 2: Make It Usable** | M4 → M10 | Add transactions, categorize, view stats, manage accounts | ~10 sessions |
| **Act 3: Make It Good** | M11 → M17 | Merchants, category trees, dashboard stats, transfers, polish, deploy | ~10 sessions |

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

#### ✅ Step 9.1 — Analytics API endpoint (~45 min)

Single endpoint that returns everything the dashboard needs in one request.

- [x] Create `src/modules/analytics/`:
  - `analytics.repository.ts`:
    - `getDashboard(startDate, endDate)` — runs two queries:
      1. SUM income / SUM expenses → `{ totalIncome, totalExpenses, net }`
      2. LEFT JOIN all expense categories with their transaction totals → always returns every category, `amount: 0` when no transactions
  - `analytics.routes.ts`:
    - `GET /api/analytics/dashboard?start=2026-04-01&end=2026-04-30`
    - Response: `{ summary: { totalIncome, totalExpenses }, expensesByCategory: [{ categoryId, name, icon, color, amount }] }`
    - `start`/`end` are plain date strings — client derives them from the month picker, API stays range-agnostic (ready for future week/year views)
- [x] Register routes in `app.ts`
- [x] Add Bruno request file in `bruno/analytics/`
- [x] Test: add a few transactions via the UI, then hit the endpoint in Bruno

**Win:** The API returns your spending summary. Real numbers from real data you entered.

---

#### ✅ Step 9.2 — Wire dashboard to real data (~45–60 min)

> **Note:** The dashboard UI is already built (summary cards, donut chart, recent transactions table). This step replaces the hardcoded placeholder data with real API calls.

- [x] Create `src/api/analytics.ts`:
  - Export `analyticsDashboardQueryKey`
  - `useAnalyticsDashboard(startDate, endDate)`
- [x] Create `src/api/transactions.ts` — recent transactions for the dashboard table
- [x] Update `src/routes/index.tsx`:
  - Read selected month from TopBar's period state via **TanStack Router search params** (URL-based — shareable, bookmarkable, browser back/forward works for free)
  - Pass date range (start/end of month) to the hooks
  - Feed real data into `<SummaryCards>`, `<ExpensesByCategory>`, `<RecentTransactions>`
- [x] Handle loading state (skeleton) and empty state ("No transactions this month. Start tracking!")

**Win:** Open the dashboard → see your actual monthly income, expenses, net balance, and real category breakdown. **The app is now genuinely useful.** You can track your finances. This is the moment.

---

---

### M10: Accounts

> *"You have real accounts (Visa, Mastercard, cash) with live balances that follow your tracked transactions — plus a manual adjustment escape hatch for when reality drifts."*

#### ✅ Step 10.1 — Account API (~45 min)

**Schema changes:**

1. `accounts` table — replace `initial_balance` with:
   - `adjusted_balance` decimal, not null, default 0 — the starting or last-adjusted balance
   - `adjusted_at` date, nullable — set when user manually adjusts; null means "count all transactions"

2. `transaction_type` enum — add `'transfer'` alongside `'income'` and `'expense'`

3. `transactions.category_id` — make nullable (null is valid when `type = 'transfer'`; enforced at service layer, not DB constraint)

**Balance formula (computed on the fly):**
```
adjusted_balance + SUM(signed amounts WHERE adjusted_at IS NULL OR transaction_date > adjusted_at)
```
Includes all types — transfers shift money between accounts. Analytics always filter `WHERE type IN ('income', 'expense')`.

- [x] Generate and run Drizzle migrations for all three schema changes above
- [x] Update `packages/shared` types and Zod schemas: `transactionTypeEnum` gains `'transfer'`, account schema replaces `initialBalance` with `adjustedBalance` + `adjustedAt`, `categoryId` becomes optional on transaction create/update
- [x] Create `src/modules/accounts/`:
  - `account.repository.ts`:
    - `findAll()` — returns all active accounts with computed balance (SQL aggregate)
    - `findById(id)` — single account with computed balance
    - `create(data)` — stores user-supplied starting balance as `adjusted_balance`
    - `update(id, data)` — name, isActive
    - `adjustBalance(id, newBalance)` — sets `adjusted_balance = newBalance`, `adjusted_at = today`
    - `deactivate(id)` — soft delete (`isActive = false`)
  - `account.service.ts` — thin wrapper
  - `account.routes.ts`:
    - `GET /api/accounts`
    - `POST /api/accounts`
    - `PUT /api/accounts/:id`
    - `POST /api/accounts/:id/adjust-balance` — body: `{ balance: number }`
    - `DELETE /api/accounts/:id`
- [x] Register routes in `app.ts`
- [x] Update seed: replace `initialBalance` with `adjustedBalance: 0` on the default account
- [x] Add Bruno request files in `bruno/accounts/`
- [x] Test: create two accounts, add transactions (including one transfer leg manually), verify balance math, then adjust and verify again

**Win:** `GET /api/accounts` returns each account with its real computed balance.

---

#### ✅ Step 10.2 — Accounts UI + transaction account selector (~60 min)

- [x] Create `src/api/accounts.ts`:
  - Export `accountsQueryKey`
  - `useAccounts()`, `useCreateAccount()`, `useUpdateAccount()`, `useAdjustBalance()`, `useDeleteAccount()`
- [x] Build out the `/accounts` route (currently a stub):
  - One card per account: name, currency, live balance
  - "Add Account" → `AccountDialog` (name, currency, initial balance)
  - Edit button → same dialog pre-filled
  - **"Adjust Balance"** → simple dialog: *"My [Visa] currently has…"* number input → calls `adjustBalance` — no transaction is created
  - Deactivate button (with confirmation)
- [x] Add account selector to `TransactionDialog`:
  - Required field, shown as a dropdown
  - Defaults to the first active account (or the one selected in context)
  - Invalidates `accountsQueryKey` on transaction mutation so balances stay live

**Win:** You can add Visa and Mastercard as accounts, enter transactions against each, see live balances, and tap "Adjust Balance" to resync with reality — without polluting your category reports.

---

> [!IMPORTANT]
> **🎉 ACT 2 COMPLETE.** You have a fully functional personal finance tracker. You can add income/expenses, see them in a list, categorize them, view monthly statistics, and manage multiple accounts with live balances. **If you stop here, you still have a useful app.** Everything after this is enhancement.

---

## Act 3: Make It Good ✨

> **Goal:** Add the features that make the app feel complete and genuinely polished.
> **Sessions needed:** ~10
> **Milestones M11–M13 should be done in order. M14–M18 are independent after that.**

> **Decision log — M11/M12/M13 order:** Categories answer *what kind* of spending. Merchants answer *where*. Tags answer *which project/event*. They are three orthogonal dimensions, not duplicates. No `description` free-text field — structured fields only. Priority order decided: subcategories → merchants → tags.

---

### M11: Category Hierarchy

> *"Categories can have subcategories, infinitely nested. Food > Groceries > Organic."*

#### Step 11.1 — Recursive category tree API (~60 min)

- [ ] Update `category.repository.ts`:
  - `findTree()` — PostgreSQL recursive CTE returning full tree:
    ```sql
    WITH RECURSIVE category_tree AS (
      SELECT *, 0 AS depth FROM categories WHERE parent_id IS NULL
      UNION ALL
      SELECT c.*, ct.depth + 1
      FROM categories c JOIN category_tree ct ON c.parent_id = ct.id
    )
    SELECT * FROM category_tree ORDER BY depth, name;
    ```
  - Service layer flattens rows → nested objects
  - `create(data)` accepts optional `parentId`
  - `move(id, newParentId)` with cycle detection
- [ ] Update `GET /api/categories` to return the nested tree
- [ ] Update shared types: `Category` gains optional `children: Category[]` and `parentId`

**Win:** API returns nested tree. Existing flat usage still works (children defaults to `[]`).

---

#### Step 11.2 — Category management UI (~60–90 min)

- [ ] Build a category management panel (accessible from sidebar or settings):
  - Collapsible tree view with indentation
  - Inline "Add subcategory" on each row
  - Edit name / change color-icon / delete (with reassign prompt if transactions exist)
- [ ] Update `TransactionDialog` category selector:
  - Render as indented grouped list (e.g. `Food › Groceries`) rather than a flat `<select>`

**Win:** Visual category tree. You can nest, rename, and reorganize without touching the API directly.

---

### M12: Merchants

> *"Transactions have a merchant (where you spent) — ~20 structured entries with autocomplete."*

#### Step 12.1 — Merchant CRUD API (~30 min)

- [ ] Create `src/modules/merchants/`:
  - `merchant.repository.ts`: `findAll()`, `search(q)`, `create(name)`, `update(id, name)`, `delete(id)`
  - `merchant.routes.ts`: `GET /api/merchants?q=` (autocomplete), `POST`, `PUT /:id`, `DELETE /:id`
- [ ] Update `transaction.service.ts` + `transaction.repository.ts`:
  - Accept optional `merchantId` on create/update
  - Include merchant name in the list/findById response
- [ ] Update shared schemas: add optional `merchantId` to `createTransactionSchema`
- [ ] Add Bruno request files in `bruno/merchants/`

**Win:** `POST /api/transactions` now accepts a merchant. The list response includes the merchant name.

---

#### Step 12.2 — Merchant autocomplete UI (~45 min)

- [ ] Add to `TransactionDialog`:
  - **Merchant**: text input with live autocomplete dropdown — type to search existing merchants, press Enter or click to create new inline (no separate management screen needed)
- [ ] Update `TransactionTable` rows to show merchant name below the category badge

**Win:** Type "Lidl" → it appears or is created on the fly. Merchant shows on every transaction row.

---

### M13: Tags

> *"Tag transactions with cross-cutting labels like 'vacation' or 'home renovation' to track project spending."*

#### Step 13.1 — Tag CRUD API (~30 min)

- [ ] Create `src/modules/tags/`:
  - `tag.repository.ts`: `findAll()`, `search(q)`, `create(name)`, `update(id, name)`, `delete(id)`
  - `tag.routes.ts`: `GET /api/tags?q=`, `POST`, `PUT /:id`, `DELETE /:id`
- [ ] Update `transaction.service.ts` + `transaction.repository.ts`:
  - Accept optional `tagIds[]` on create/update
  - Include tag names in the list/findById response
- [ ] Update shared schemas: add optional `tagIds` to `createTransactionSchema`
- [ ] Add Bruno request files in `bruno/tags/`

**Win:** `POST /api/transactions` now accepts tags. The list response includes tag names.

---

#### Step 13.2 — Tags UI (~45 min)

- [ ] Add to `TransactionDialog`:
  - **Tags**: multi-select pill input — type to search, select or create inline
- [ ] Update `TransactionTable` rows to show tag badges

**Win:** Tag a transaction "vacation" → see the pill on every matching row. Filter or total by tag later.

---

### M14: Dashboard Enhancements

> *"Richer stats — income breakdown and month-over-month comparison."*

#### Step 14.1 — Income breakdown toggle (~30 min)

- [ ] Add `incomeByCategory` array to `GET /api/analytics/dashboard` response (same shape as `expensesByCategory`)
- [ ] Add Expense / Income toggle to the `ExpensesByCategory` card — switches chart and grid between the two

**Win:** One click to flip the chart from "where did money go" to "where did money come from".

---

#### Step 14.2 — vs last month on summary cards (~30 min)

- [ ] Compute previous-period totals server-side in `analytics.repository.ts` (shift date range back one month)
- [ ] Add `previousIncome` and `previousExpenses` to the dashboard response
- [ ] Re-add the `% vs last month` line to each `SummaryCard` (was removed earlier pending real data)

**Win:** Summary cards show `↑ 12% vs last month` driven by real numbers.

---

### M15: Transfer UI

> *"Move money between accounts from the UI — no manual two-transaction hack."*

#### Step 15.1 — Transfer creation (~60 min)

- [ ] Add "Transfer" as a third type option in `TransactionDialog` (alongside Income / Expense)
- [ ] When Transfer is selected, show a second account selector ("To account") and hide the category field
- [ ] On submit: call a new `POST /api/transfers` endpoint that atomically creates both legs and links them via the `transfers` table
- [ ] Update `TransactionTable` to render transfer rows cleanly (arrow icon, "→ Account Name", neutral amount color)
- [ ] Invalidate `accountsQueryKey` so both account balances update instantly

**Win:** Select Transfer, pick source and destination accounts, enter amount — both balances update immediately.

---

### M16: Transaction Period Filter

> *"The transactions page shows everything ever. Add a month picker so you can scope it."*

#### Step 16.1 — Month picker on transactions page (~30 min)

- [ ] Add the same month nav control (← April 2026 →) to the transactions page controls row — driven by URL search params just like the dashboard
- [ ] Wire the selected month's date range into `useTransactions()` so only that month's transactions load
- [ ] The existing All / Income / Expense type filter pills continue to work within the selected period

**Win:** Transactions page behaves like the dashboard — scoped to a month, navigable with arrows.

---

### M17: Multi-Currency Net Worth

> *"Net worth is currently wrong if you have accounts in different currencies."*

> [!WARNING]
> **Known limitation:** The sidebar sums all account balances directly. If you have EUR + USD accounts the total is meaningless. Fix this before using multi-currency accounts seriously.

#### Step 17.1 — Currency conversion for net worth (~90 min)

- [ ] Add a `exchange_rates` table (manual rates, e.g. `{ fromCode, toCode, rate, updatedAt }`)
- [ ] Add `GET /api/exchange-rates` and `PUT /api/exchange-rates` (to update rates manually)
- [ ] Update net worth query: convert each account balance to EUR before summing
- [ ] Update sidebar: show converted total + a tooltip listing each account's native balance

**Win:** Net worth is accurate even with mixed-currency accounts.

---

### M18: Polish & Deploy 🚀

> *"Responsive, error-handled, and running on your Raspberry Pi."*

#### Step 18.1 — UX Polish (~60 min)

- [ ] **Toast notifications**: use `sonner` (`pnpm add sonner`) for success/error feedback on all mutations
- [ ] **Error boundaries**: catch and display API errors gracefully instead of blank screens
- [ ] **Responsive design**: test on mobile viewport — sidebar collapses, dialogs usable on small screens

**Win:** The app feels polished. No janky errors, works on your phone's browser.

---

#### Step 18.2 — Docker Compose for Raspberry Pi (~60 min)

- [ ] Create a `Dockerfile` for the API (multi-stage: build TS → run with Node, migrations on startup)
- [ ] Create a `Dockerfile` for the Web (Vite build → served by Caddy)
- [ ] Update `docker-compose.yml` to add `api` and `caddy` services alongside `db`
- [ ] Create `Caddyfile`: reverse-proxy `/api/*` to the API, serve static files for everything else
- [ ] Configure port forwarding (80 + 443 → Pi's local IP) and a free DDNS hostname (e.g. DuckDNS)
- [ ] Run `docker compose up --build` on the Pi

**Win:** `docker compose up` on your Raspberry Pi → open the app on your phone over HTTPS. **Project complete.** 🏆

---

## Quick Reference: Session Planner

Can't decide what to do today? Use this:

| I have... | Do this | Milestone |
|-----------|---------|-----------|
| 60 min | Category tree API | M11.1 |
| 60-90 min | Category tree UI | M11.2 |
| 30 min | Merchant API | M12.1 |
| 45 min | Merchant autocomplete UI | M12.2 |
| 30 min | Tag API | M13.1 |
| 45 min | Tags UI | M13.2 |
| 30 min | Income breakdown toggle | M14.1 |
| 30 min | vs last month on summary cards | M14.2 |
| 60 min | Transfer UI | M15 |
| 30 min | Month picker on transactions page | M16 |
| Feeling lazy | Toasts + error boundaries (easy dopamine) | M18.1 |

**Where you are right now:** M11 is next. Start with the category tree API.

---

## Momentum Rules 🧠

1. **One session = one step.** Don't try to do two steps. If you finish early, take the win and stop.
2. **Always commit after a win.** `git add . && git commit -m "M4.1: Transaction CRUD API works"`. Seeing the git log grow is motivating.
3. **If you're stuck > 15 minutes, ask for help.** Don't spiral. Ping me (or ChatGPT, or Stack Overflow). Stuck = abandoned.
4. **Skip Act 3 milestones freely.** M14–M17 are independent. Do whichever sounds fun today. Or don't. The app works without them.
5. **Never refactor during a feature session.** Write it ugly, make it work, commit. Refactor is a separate session (or never).

---

> *"The best app is the one you actually finish."*
> — Someone who has 47 abandoned repos
