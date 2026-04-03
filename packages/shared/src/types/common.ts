export type TransactionType = "income" | "expense";
export type CategoryType = "income" | "expense" | "any";

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}
