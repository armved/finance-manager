import type { TransactionType, CategoryType } from "./common";
import type { Category } from "./category";
import type { Account } from "./account";
import type { Merchant } from "./merchant";
import type { Tag } from "./tag";

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number; // Always positive — direction determined by `type`
  transactionDate: string; // YYYY-MM-DD
  accountId: string;
  categoryId: string | null; // null for transfers
  merchantId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionWithRelations extends Transaction {
  category: Pick<Category, "id" | "name" | "icon" | "color"> | null; // null for transfers
  account: Pick<Account, "id" | "name">;
  merchant: Pick<Merchant, "id" | "name"> | null;
  tags: Pick<Tag, "id" | "name" | "color">[];
}

export interface TransactionTag {
  transactionId: string;
  tagId: string;
}
