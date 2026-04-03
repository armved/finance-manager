import type { TransactionType } from "./common";

export interface AnalyticsSummary {
  totalIncome: number;
  totalExpenses: number;
  net: number;
}

export interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  total: number;
  type: TransactionType;
}
