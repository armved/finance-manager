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
      .values({ name: "Main Account", currencyCode: "EUR", adjustedBalance: "0" })
      .returning();
    console.log(`  ✓ Account created:   "${account!.name}" (id: ${account!.id})`);
  } else {
    console.log("  · Default account already exists, skipped");
  }

  // ── Categories ─────────────────────────────────────────────────────────────
  // Fixed UUIDs ensure parent_id references survive across environments.
  // Three passes: roots → children → grandchildren (FK constraint order).
  // onConflictDoNothing means re-running the seed never duplicates or errors.
  const rootCategories = [
    { id: "bba04605-34eb-4cb2-93d4-9d7d6258a8e5", name: "Uncategorized",  type: "expense" as const, isDefault: true },
    { id: "6f2e87ba-2274-4b86-b1ff-637d6bc22dd5", name: "Uncategorized",  type: "income"  as const, isDefault: true },
    { id: "e9c1f94f-db21-4085-8b88-5f99b11963f1", name: "Financial",      type: "expense" as const, icon: "banknote",      color: "#FFC048" },
    { id: "beadd693-2d05-4057-bf7f-a6b8d9cce06d", name: "Food & Dining",  type: "expense" as const, icon: "utensils",      color: "#54A0FF" },
    { id: "b38b08ad-8578-40a7-a32d-34c1484e1f92", name: "Gifts",          type: "expense" as const, icon: "gift",          color: "#FF9F43" },
    { id: "9cb36c39-08b7-4e6c-aa33-12e1e7eb1c42", name: "Housing",        type: "expense" as const, icon: "home",          color: "#FF6BAE" },
    { id: "fecca075-ac7f-422f-9110-ba7596f9b13d", name: "Leisure",        type: "expense" as const, icon: "film",          color: "#FFC048" },
    { id: "2fb75e4a-82ce-400f-b9e2-cf73a9370fb8", name: "Pets",           type: "expense" as const, icon: "paw-print",     color: "#C56BED" },
    { id: "2d323926-7ec4-489c-804c-b16e0e65e24e", name: "Salary",         type: "income"  as const, icon: "wallet",        color: "#4ade80" },
    { id: "6af5b415-e2c1-478e-83bb-13c3db4d1b12", name: "Shopping",       type: "expense" as const, icon: "shopping-cart", color: "#AADC30" },
    { id: "43262277-1516-4736-9853-058fa53396b2", name: "Subscriptions",  type: "expense" as const, icon: "wifi",          color: "#7B7BED" },
    { id: "d27349e9-3efd-406e-b528-c44acdcf2546", name: "Transportation", type: "expense" as const, icon: "bus",           color: "#26D0CE" },
    { id: "c5ce799d-bdf6-4a96-bdf2-c9bcf106e4f6", name: "Wellness",       type: "expense" as const, icon: "heart-pulse",   color: "#2ECC71" },
  ];

  const childCategories = [
    // Financial
    { id: "9d24e126-0d4d-49ca-8689-a806b86d1648", name: "Taxes",          type: "expense" as const, icon: "file-text",       color: "#C0392B", parentId: "e9c1f94f-db21-4085-8b88-5f99b11963f1" },
    // Food & Dining
    { id: "f54a80b6-62c6-4466-82fa-610022895d9b", name: "Bakery",         type: "expense" as const, icon: "cake",            color: "#C56BED", parentId: "beadd693-2d05-4057-bf7f-a6b8d9cce06d" },
    { id: "245f5332-15b1-4136-bebf-0f3b25a6b22e", name: "Eating Out",     type: "expense" as const, icon: "utensils",        color: "#2ECC71", parentId: "beadd693-2d05-4057-bf7f-a6b8d9cce06d" },
    { id: "8485eb41-7fb2-4955-881e-1d37f8113b12", name: "Groceries",      type: "expense" as const, icon: "apple",           color: "#54A0FF", parentId: "beadd693-2d05-4057-bf7f-a6b8d9cce06d" },
    // Gifts
    { id: "1a66b01e-82ab-4e3c-a434-ca45267d9748", name: "Charity",        type: "expense" as const, icon: "heart-handshake", color: "#27AE60", parentId: "b38b08ad-8578-40a7-a32d-34c1484e1f92" },
    { id: "3a7c20be-b094-48f0-b02e-23de37f8ab55", name: "Family",         type: "expense" as const, icon: "heart",           color: "#E84393", parentId: "b38b08ad-8578-40a7-a32d-34c1484e1f92" },
    { id: "0d9212a2-e86b-4f96-8beb-eaba145df53a", name: "Personal Gifts", type: "expense" as const, icon: "gift",            color: "#A29BFE", parentId: "b38b08ad-8578-40a7-a32d-34c1484e1f92" },
    // Housing
    { id: "969f3cb1-3646-4863-9a55-ae91173e0857", name: "Maintenance",    type: "expense" as const, icon: "wrench",          color: "#7D5FFF", parentId: "9cb36c39-08b7-4e6c-aa33-12e1e7eb1c42" },
    { id: "6aca3b79-b9e1-4c6c-a241-0bcbe76e8544", name: "Rent",           type: "expense" as const, icon: "key",             color: "#FF4757", parentId: "9cb36c39-08b7-4e6c-aa33-12e1e7eb1c42" },
    { id: "a614a88b-ac26-4468-a9ec-e21b035b434c", name: "Supplies",       type: "expense" as const, icon: "package",         color: "#1E90FF", parentId: "9cb36c39-08b7-4e6c-aa33-12e1e7eb1c42" },
    { id: "1936be0a-ca58-4fc4-9ad5-7e05fea3fee7", name: "Utilities",      type: "expense" as const, icon: "zap",             color: "#FFA502", parentId: "9cb36c39-08b7-4e6c-aa33-12e1e7eb1c42" },
    // Leisure
    { id: "710b6c1c-ac70-4500-ba49-d24c4dd9f350", name: "Events",         type: "expense" as const, icon: "ticket",          color: "#F43F5E", parentId: "fecca075-ac7f-422f-9110-ba7596f9b13d" },
    { id: "3fbd076f-51ab-44ad-891d-971765777e52", name: "Hobbies",        type: "expense" as const, icon: "palette",         color: "#A855F7", parentId: "fecca075-ac7f-422f-9110-ba7596f9b13d" },
    { id: "c4ab0135-b6ec-4d6b-b265-e5d481b15bfd", name: "Travel",         type: "expense" as const, icon: "plane",           color: "#06B6D4", parentId: "fecca075-ac7f-422f-9110-ba7596f9b13d" },
    // Pets
    { id: "6a4f03af-5fd3-46be-a5a7-8c61e6371474", name: "Food & Supplies",type: "expense" as const, icon: "bone",            color: "#FDCB6E", parentId: "2fb75e4a-82ce-400f-b9e2-cf73a9370fb8" },
    { id: "f0f1d913-4f57-4469-9411-2e5db802f6a0", name: "Veterinary",     type: "expense" as const, icon: "stethoscope",     color: "#00B894", parentId: "2fb75e4a-82ce-400f-b9e2-cf73a9370fb8" },
    // Shopping
    { id: "6e92fa46-5857-4b64-b053-c3ed400f2cd7", name: "Clothing",       type: "expense" as const, icon: "shirt",           color: "#E17055", parentId: "6af5b415-e2c1-478e-83bb-13c3db4d1b12" },
    { id: "194fea75-aefe-4efb-b019-e2d0bdb3c375", name: "Electronics",    type: "expense" as const, icon: "smartphone",      color: "#0984E3", parentId: "6af5b415-e2c1-478e-83bb-13c3db4d1b12" },
    { id: "27c90845-6c76-4736-b04c-577128ba7a56", name: "Health & Beauty", type: "expense" as const, icon: "sparkles",       color: "#FD79A8", parentId: "6af5b415-e2c1-478e-83bb-13c3db4d1b12" },
    // Subscriptions
    { id: "849cfaa2-6982-4245-964f-46000735e602", name: "Media",          type: "expense" as const, icon: "tv-2",            color: "#E74C3C", parentId: "43262277-1516-4736-9853-058fa53396b2" },
    { id: "cda01076-e176-488b-b392-05dc49a2c958", name: "Memberships",    type: "expense" as const, icon: "credit-card",     color: "#FDCB6E", parentId: "43262277-1516-4736-9853-058fa53396b2" },
    { id: "7e48b21b-290f-403b-b67b-7e9499cb118a", name: "Software",       type: "expense" as const, icon: "laptop",          color: "#00CEC9", parentId: "43262277-1516-4736-9853-058fa53396b2" },
    // Transportation
    { id: "86b0ddfb-8762-4a23-bea5-f81ff556a95d", name: "Inter-city",     type: "expense" as const, icon: "bus",             color: "#F39C12", parentId: "d27349e9-3efd-406e-b528-c44acdcf2546" },
    { id: "b01bad15-c025-4254-ac68-1b20e5b3a5c1", name: "Lyon",           type: "expense" as const, icon: "train",           color: "#8E44AD", parentId: "d27349e9-3efd-406e-b528-c44acdcf2546" },
    { id: "2055bbf8-9999-425f-b2a9-ba8ead87c3d2", name: "Saint-Etienne",  type: "expense" as const, icon: "map-pin",         color: "#3742FA", parentId: "d27349e9-3efd-406e-b528-c44acdcf2546" },
    { id: "36ce0bcc-bd67-42df-b7bf-94fdfa6f153e", name: "Vehicle",        type: "expense" as const, icon: "car",             color: "#E84393", parentId: "d27349e9-3efd-406e-b528-c44acdcf2546" },
    // Wellness
    { id: "f2f8fd57-0a84-488a-b6b7-9143b139465d", name: "Fitness",        type: "expense" as const, icon: "dumbbell",        color: "#F39C12", parentId: "c5ce799d-bdf6-4a96-bdf2-c9bcf106e4f6" },
    { id: "b911c68e-cfd5-4428-9838-cbe8d72e3a99", name: "Medical",        type: "expense" as const, icon: "stethoscope",     color: "#E74C3C", parentId: "c5ce799d-bdf6-4a96-bdf2-c9bcf106e4f6" },
    { id: "232b7c03-eb31-467e-81ae-1178fbadfc5a", name: "Personal Care",  type: "expense" as const, icon: "droplets",        color: "#A29BFE", parentId: "c5ce799d-bdf6-4a96-bdf2-c9bcf106e4f6" },
  ];

  const grandchildCategories = [
    // Gifts > Family
    { id: "d9d8c7df-6edc-455b-8014-6d0c5ae2913d", name: "Father", type: "expense" as const, icon: "user", color: "#5352ED", parentId: "3a7c20be-b094-48f0-b02e-23de37f8ab55" },
    { id: "d3deb6c4-108d-4094-a1f5-5f3c0d81b7ac", name: "Mother", type: "expense" as const, icon: "user", color: "#FF6B81", parentId: "3a7c20be-b094-48f0-b02e-23de37f8ab55" },
  ];

  const [rootResult, childResult, grandchildResult] = await Promise.all([
    db.insert(schema.categories).values(rootCategories).onConflictDoNothing().returning(),
    db.insert(schema.categories).values(childCategories).onConflictDoNothing().returning(),
  ]).then(async ([r, c]) => {
    const g = await db.insert(schema.categories).values(grandchildCategories).onConflictDoNothing().returning();
    return [r, c, g];
  });

  const inserted = rootResult.length + childResult.length + grandchildResult.length;
  const skipped = rootCategories.length + childCategories.length + grandchildCategories.length - inserted;
  if (inserted > 0) console.log(`  ✓ Categories created: ${inserted} inserted`);
  if (skipped > 0)  console.log(`  · Categories skipped: ${skipped} already exist`);

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
