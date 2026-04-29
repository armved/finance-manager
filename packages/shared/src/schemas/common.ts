import { z } from "zod";

// ── Enum schemas ──────────────────────────────────────────────
export const transactionTypeSchema = z.enum(["income", "expense", "transfer"]);
export const categoryTypeSchema = z.enum(["income", "expense"]);

// ── Reusable field schemas ────────────────────────────────────
// Shared across multiple entities to avoid duplicating validation
// rules and error messages. Update once → applies everywhere.

/** Standard display name (accounts, categories, merchants, tags). */
export const nameSchema = z.string().min(1, "Name is required").max(200);

/** Emoji / icon identifier. */
export const iconSchema = z.string().max(50).nullish();

/** Hex color string, e.g. "#ff5500". */
export const colorSchema = z.string().max(7).nullish();

/** Strictly positive, finite monetary amount. */
export const monetaryAmountSchema = z
  .number()
  .positive("Amount must be positive")
  .finite("Amount must be a finite number");

/** ISO date string (YYYY-MM-DD). */
export const dateStringSchema = z
  .string()
  .date("Must be a valid date (YYYY-MM-DD)");
