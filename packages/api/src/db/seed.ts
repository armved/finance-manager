/**
 * Seed script — inserts baseline data that the app requires to function.
 *
 * IDEMPOTENT: safe to run multiple times. Each insert uses ON CONFLICT DO NOTHING,
 * so re-running this script will never duplicate rows or throw errors.
 *
 * Run with:  pnpm --filter @finance-manager/api db:seed
 */

import { db, sql } from "./index";
import * as schema from "./schema";

async function seed() {
  console.log("🌱 Seeding database...\n");

  // ── Currency ───────────────────────────────────────────────────────────────
  // currencies.code is the primary key, so ON CONFLICT targets that column.
  const [currency] = await db
    .insert(schema.currencies)
    .values({ code: "EUR", name: "Euro", symbol: "€", decimalPlaces: 2 })
    .onConflictDoNothing() // INSERT ... ON CONFLICT DO NOTHING
    .returning();

  if (currency) {
    console.log(`  ✓ Currency created:  ${currency.code} (${currency.name})`);
  } else {
    console.log("  · Currency EUR already exists, skipped");
  }

  // ── Account ────────────────────────────────────────────────────────────────
  // accounts.id is a random UUID, so we can't use onConflictDoNothing on the PK
  // (a re-run would just generate a new UUID and insert a duplicate row).
  // Instead, check for existence first — this is the standard pattern when
  // there's no natural unique key to conflict on.
  const [existingAccount] = await db
    .select()
    .from(schema.accounts)
    .limit(1);

  if (!existingAccount) {
    const [account] = await db
      .insert(schema.accounts)
      .values({ name: "Main Account", currencyCode: "EUR", initialBalance: "0" })
      .returning();
    console.log(`  ✓ Account created:   "${account!.name}" (id: ${account!.id})`);
  } else {
    console.log("  · Default account already exists, skipped");
  }

  // ── Categories ─────────────────────────────────────────────────────────────
  // One default per transaction type. isDefault = true marks the fallback
  // category used when the user hasn't assigned one.
  const existingCategories = await db.select().from(schema.categories).limit(1);

  if (existingCategories.length === 0) {
    const inserted = await db
      .insert(schema.categories)
      .values([
        { name: "Uncategorized", type: "expense", isDefault: true },
        { name: "Uncategorized", type: "income", isDefault: true },
      ])
      .returning();
    for (const c of inserted) {
      console.log(`  ✓ Category created:  "${c.name}" (${c.type}, id: ${c.id})`);
    }
  } else {
    console.log("  · Default categories already exist, skipped");
  }

  console.log("\n✅ Seeding complete");
}

// ── Entry point ────────────────────────────────────────────────────────────
// Top-level async/await isn't ideal for scripts because errors can be swallowed.
// The explicit try/finally ensures the connection pool is always closed,
// preventing the process from hanging after the script finishes.

async function main() {
  try {
    await seed();
  } catch (err) {
    console.error("\n❌ Seed failed:", err);
    process.exit(1);
  } finally {
    // sql.end() drains the pool and closes all open TCP connections.
    // Without this, the process hangs indefinitely after the script finishes
    // because Node keeps running as long as there are active handles.
    await sql.end();
  }
}

main();
