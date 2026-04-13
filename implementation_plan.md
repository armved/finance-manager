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

> [!TIP]
> **Don't fear the schema file.** It's just TypeScript objects describing tables. Drizzle's syntax reads almost like SQL — you'll pick it up instantly with your TS background.

**Win:** Open Docker Desktop → click on the postgres container → open terminal → `psql -U finance finance_manager` → `\dt` → see all your tables listed. Your database is REAL.

---

#### Step 2.2 — Seed data + DB connection in the API (~45 min)

- [ ] Create `src/db/index.ts` — export a `db` instance using the Drizzle postgres driver
- [ ] Create `src/db/seed.ts`:
  - Insert the default currency (USD)
  - Insert the default account (Main Account)
  - Insert default category (Uncategorized, type: "any", isDefault: true)
  - Make it idempotent (check before insert, so you can run it multiple times)
- [ ] Add a `seed` script to `package.json`: `tsx src/db/seed.ts`
- [ ] Run `pnpm --filter api seed` → seed data is inserted
- [ ] Create a Fastify plugin (`src/plugins/db.ts`) that attaches `db` to the Fastify instance
- [ ] Update `GET /api/health` to also query `SELECT 1` from the DB and confirm connection

**Win:** Hit `GET /api/health` → see `{ "status": "ok", "db": "connected" }`. The API talks to the database.

---

### M3: Connect Frontend to Backend

> *"The web app fetches real data from the API."*

#### Step 3.1 — TanStack Query + first API call (~45 min)

- [ ] In `packages/web/`:
  - Set up TanStack Query provider in `main.tsx` (QueryClient + QueryClientProvider)
  - Create `src/api/client.ts` — a simple `fetch` wrapper with the base URL (`/api` — relative, no hardcoded host/port; Vite proxy handles dev, Caddy handles prod)
  - Create `src/api/health.ts` — a `useHealthCheck()` query hook
  - Proxy API requests in `vite.config.ts` (proxy `/api` → `localhost:3001`) to avoid CORS issues
- [ ] Update the home page to call `useHealthCheck()` and display the result:
  - Show "🟢 API Connected" or "🔴 API Down"

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

- [ ] Create `src/modules/transactions/`:
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
- [ ] Register the routes in `app.ts`
- [ ] Test manually:
  - `POST /api/transactions` with `{ "type": "expense", "amount": 42.50, "categoryId": "<uncategorized-uuid>" }`
  - `GET /api/transactions` → see your transaction in the list

> [!TIP]
> Use the **VS Code REST Client extension** or **Thunder Client** to test API calls without leaving VS Code. Or just use `curl` in the terminal if you prefer.

**Win:** You can create a transaction via API and get it back. The data persists in PostgreSQL. CRUD works.

---

### M5: App Shell & Layout

> *"The web app has a real layout with sidebar navigation."*

#### Step 5.1 — shadcn/ui setup + app shell (~60 min)

- [ ] Initialize shadcn/ui in `packages/web/`:
  - Run the shadcn init CLI
  - Install the first few components: `button`, `card`, `input`, `separator`, `sheet`
- [ ] Create the app shell layout:
  - `src/components/layout/AppShell.tsx` — sidebar + main content area
  - Sidebar with navigation links (use Lucide icons):
    - 📊 Dashboard (`/`)
    - 💸 Transactions (`/transactions`)
    - 📂 Categories (`/categories`)
  - Responsive: sidebar collapses to a hamburger menu on mobile
- [ ] Set up TanStack Router with these routes:
  - `/` → Dashboard page (placeholder: "Dashboard coming soon")
  - `/transactions` → Transactions page (placeholder)
  - `/categories` → Categories page (placeholder)
- [ ] Style with Tailwind: dark background, clean typography, subtle hover effects on nav items

**Win:** A beautiful app shell with working navigation. Click sidebar links → pages switch. It looks like a real app already.

---

### M6: Transaction List UI

> *"You can see your transactions in the web app."*

#### Step 6.1 — Transaction list page (~60–90 min)

- [ ] Create TanStack Query hooks:
  - `src/api/transactions.ts`:
    - `useTransactions(filters)` — `GET /api/transactions`
    - `useCreateTransaction()` — `POST /api/transactions` (mutation)
    - `useUpdateTransaction()` — `PUT /api/transactions/:id` (mutation)
    - `useDeleteTransaction()` — `DELETE /api/transactions/:id` (mutation)
- [ ] Create `src/components/transactions/TransactionList.tsx`:
  - Fetch transactions with `useTransactions()`
  - Display as a styled list/table:
    - Each row: date | type (income/expense with color) | amount | category name
    - Income = green, Expense = red
    - Empty state: "No transactions yet. Add your first one!"
  - Loading state with skeleton/spinner
- [ ] Wire up the `/transactions` route to render `TransactionList`
- [ ] Manually add 3-4 test transactions via API (or via seed script), then refresh the page

**Win:** Open `/transactions` → see your transactions listed with dates, amounts, and color-coded types. **You're looking at real data from your database in a real UI.**

---

### M7: Add Transaction Form

> *"You can add a transaction from the UI without touching the API directly."*

#### Step 7.1 — "Add Transaction" dialog (~60–90 min)

- [ ] Install shadcn components: `dialog`, `select`, `calendar`, `popover`, `label`
- [ ] Install React Hook Form + connect with Zod schemas from `@finance-manager/shared`
- [ ] Create `src/components/transactions/AddTransactionDialog.tsx`:
  - A dialog/modal triggered by a "➕ Add Transaction" button
  - Form fields:
    - **Type**: toggle/select — Income or Expense (default: Expense)
    - **Amount**: number input (required)
    - **Date**: date picker (defaults to today — user sees today's date pre-filled)
    - **Category**: dropdown select (for now, just fetches flat category list from API)
  - On submit: call `useCreateTransaction()` mutation
  - On success: close dialog, list refreshes automatically (TanStack Query invalidation)
- [ ] Add the "➕ Add Transaction" button to the transactions page (top-right, prominent)

**Win:** Click "Add Transaction" → fill in the form → submit → dialog closes → the new transaction appears in the list instantly. **This is the core loop of the entire app. You just built it.** 🎉

---

#### Step 7.2 — Edit & Delete transactions (~45–60 min)

- [ ] Click a transaction row → opens the same form dialog, pre-filled with existing data
- [ ] Add an "Edit" mode to the dialog that calls `useUpdateTransaction()`
- [ ] Add a "Delete" button (with confirmation) that calls `useDeleteTransaction()`
- [ ] On success: list refreshes, toast notification or subtle animation

**Win:** Full CRUD from the UI. Add, edit, delete — all from the browser. You never need to touch the API directly again.

---

### M8: Dashboard with Monthly Stats 📊

> *"You can see how much you spent vs earned this month."*

> [!IMPORTANT]
> **This is your "I won't quit" milestone.** After this step, the app is genuinely useful to you personally.

#### Step 8.1 — Analytics API endpoint (~45 min)

- [ ] Create `src/modules/analytics/`:
  - `analytics.repository.ts`:
    - `getBreakdownByCategory(startDate, endDate)` — `GROUP BY category_id`, returns `{ categoryName, total, type }`
    - `getSummary(startDate, endDate)` — returns `{ totalIncome, totalExpenses, net }`
  - `analytics.routes.ts`:
    - `GET /api/analytics/breakdown?start=2026-04-01&end=2026-04-30`
    - `GET /api/analytics/summary?start=2026-04-01&end=2026-04-30`
- [ ] Test: add a few transactions via the UI, then hit the analytics endpoints

**Win:** The API returns your spending summary. Real numbers from real data you entered.

---

#### Step 8.2 — Dashboard UI with charts (~60–90 min)

- [ ] Install `recharts`
- [ ] Create query hooks:
  - `useAnalyticsBreakdown(startDate, endDate)`
  - `useAnalyticsSummary(startDate, endDate)`
- [ ] Build the Dashboard page (`/`):
  - **Top row: Summary cards** (3 cards):
    - 💰 Total Income (green)
    - 💸 Total Expenses (red)
    - 📊 Net (green if positive, red if negative)
  - **Pie chart**: Expense breakdown by category (Recharts PieChart)
  - **Month selector**: prev/next month buttons, defaults to current month
  - Style: use shadcn `Card` components, clean grid layout
- [ ] If no data: show friendly empty state — "No transactions this month. Start tracking!"

**Win:** Open the dashboard → see your monthly income, expenses, net balance, and a pie chart of where your money went. **The app is now genuinely useful.** You can track your finances. This is the moment.

---

> [!IMPORTANT]
> **🎉 ACT 2 COMPLETE.** You have a fully functional personal finance tracker. You can add income/expenses, see them in a list, and view monthly statistics with charts. **If you stop here, you still have a useful app.** Everything after this is enhancement.

---

## Act 3: Make It Good ✨

> **Goal:** Add the nice-to-haves that make the app feel complete.
> **Sessions needed:** ~8
> **Every milestone here is independent.** Do them in any order. Skip any you don't care about.

---

### M9: Category Management

> *"You can create, rename, and organize your categories."*

#### Step 9.1 — Category CRUD API (~45 min)

- [ ] Create `src/modules/categories/`:
  - `category.repository.ts`:
    - `findAll()` — return flat list for now (hierarchy comes later)
    - `create(data)` — name, type (income/expense/any), icon, color
    - `update(id, data)`
    - `delete(id, reassignToCategoryId)` — reassign transactions, then delete
  - `category.routes.ts` — standard CRUD endpoints
- [ ] Protect the default "Uncategorized" category from deletion

**Win:** Category CRUD works via API. Default category can't be deleted.

---

#### Step 9.2 — Category management page (~60 min)

- [ ] Create `/categories` page:
  - List of categories with name, type badge, color swatch, icon
  - "Add Category" button → dialog with form (name, type selector, color picker, icon picker)
  - Edit button on each category → same dialog, pre-filled
  - Delete button → confirmation dialog that asks "Reassign transactions to:" with category dropdown
- [ ] Update the transaction form's category dropdown to show user-created categories

**Win:** Create categories like "Groceries", "Salary", "Entertainment" → they appear in the transaction form dropdown.

---

### M10: Category Hierarchy (Tree)

> *"Categories can have subcategories, infinitely nested."*

#### Step 10.1 — Recursive category tree API (~60 min)

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

#### Step 10.2 — Category tree UI (~60–90 min)

- [ ] Create `src/components/categories/CategoryTree.tsx`:
  - Collapsible tree view with indentation
  - Click arrow to expand/collapse children
  - Drag-and-drop to re-parent (optional — skip if it feels like too much)
  - "Add subcategory" option on each category's context menu
- [ ] Update the transaction form's category selector:
  - Show as a tree dropdown (indented names, e.g., `Food > Groceries`)

**Win:** Visual category tree with collapsible hierarchy. Clean and satisfying to interact with.

---

### M11: Merchants & Tags

> *"Transactions can have a merchant and multiple tags."*

#### Step 11.1 — Merchant & Tag CRUD API (~45 min)

- [ ] Create `src/modules/merchants/`:
  - CRUD + search endpoint (`GET /api/merchants?q=ama` for autocomplete)
- [ ] Create `src/modules/tags/`:
  - CRUD + search endpoint
- [ ] Update transaction create/update to accept `merchantId` and `tagIds`
- [ ] Update transaction list to include merchant name and tag names in response

**Win:** Transactions can now carry merchant and tag data.

---

#### Step 11.2 — Autocomplete UI in transaction form (~60 min)

- [ ] Install shadcn `command` (combobox) component
- [ ] Add to the "Add Transaction" dialog:
  - **Merchant**: combobox with search — type to search existing merchants, option to create new inline
  - **Tags**: multi-select combobox — search and select multiple tags, create new inline
- [ ] Update transaction list to show merchant name and tag badges

**Win:** When adding a transaction, you can type "Amazon" → select or create the merchant → add tags like "electronics", "personal". Feels professional.

---

### M12: Filters & Enhanced List

> *"You can filter transactions by date, category, type, merchant, tag."*

#### Step 12.1 — Transaction filters UI (~60–90 min)

- [ ] Add a filter bar above the transaction list:
  - Date range picker (start date – end date)
  - Category dropdown (from tree)
  - Type filter (All / Income / Expense)
  - Merchant dropdown
  - Tag multi-select
- [ ] Filters update URL query params (TanStack Router) → page is shareable/bookmarkable
- [ ] Filters are passed to `useTransactions()` → API filters the results
- [ ] Add pagination (or infinite scroll) if the list gets long
- [ ] Show active filter count badge

**Win:** Filter your transactions by any dimension. "Show me all expenses at Amazon in March" — done.

---

### M13: Polish & Deploy 🚀

> *"Responsive, error-handled, and running on your Raspberry Pi."*

#### Step 13.1 — UX Polish (~60 min)

- [ ] **Toast notifications**: success/error feedback on all mutations (use shadcn `sonner` or `toast`)
- [ ] **Loading states**: skeleton loaders on lists and charts
- [ ] **Empty states**: friendly illustrations/messages when no data exists
- [ ] **Error boundaries**: catch and display API errors gracefully
- [ ] **Responsive design**: test on mobile viewport, ensure sidebar collapses, forms are usable on small screens

**Win:** The app feels polished. No janky loading, no cryptic errors, works on your phone's browser.

---

#### Step 13.2 — Docker Compose for Raspberry Pi (~60 min)

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
| 30 min | Step 1.1 (install tools) or Step 8.1 (analytics API) | M1 / M8 |
| 45 min | Step 2.2 (seed data) or Step 9.1 (category API) | M2 / M9 |
| 60 min | Step 4.1 (transaction API) or Step 6.1 (transaction list) | M4 / M6 |
| 90 min | Step 7.1 (add transaction form) or Step 8.2 (dashboard charts) | M7 / M8 |
| Feeling lazy | Step 13.1 — add toasts and loading states (polish is easy dopamine) | M13 |

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
