export type TransactionType = "income" | "expense" | "transfer";
export type CategoryType = "income" | "expense";

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}
