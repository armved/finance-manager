import type { Currency } from "../types";
import type { CreateAccountInput } from "../schemas";
import type { CategoryType } from "../types";

export const DEFAULT_CURRENCY: Currency = {
  code: "USD",
  name: "US Dollar",
  symbol: "$",
  decimalPlaces: 2,
};

export const DEFAULT_ACCOUNT: CreateAccountInput = {
  name: "Main Account",
  currencyCode: "USD",
  initialBalance: 0,
};

// `isDefault` is a system-only field set during seeding — not part of CreateCategoryInput
export const DEFAULT_CATEGORY = {
  name: "Uncategorized",
  type: "expense" as CategoryType,
  isDefault: true,
  parentId: null,
} as const;
