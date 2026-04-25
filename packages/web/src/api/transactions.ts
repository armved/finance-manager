import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreateTransactionInput,
  PaginatedResponse,
  TransactionWithRelations,
  UpdateTransactionInput,
} from "@finance-manager/shared";
import { apiFetch } from "./client";

export const transactionsQueryKey = ["transactions", "list"] as const;

type TransactionListResponse = PaginatedResponse<TransactionWithRelations>;

interface TransactionFilters {
  type?: "income" | "expense";
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  accountId?: string;
  merchantId?: string;
  tagId?: string;
  limit?: number;
  offset?: number;
}

export function useTransactions(filters?: TransactionFilters) {
  const params = new URLSearchParams();
  if (filters?.type) params.set("type", filters.type);
  if (filters?.startDate) params.set("startDate", filters.startDate);
  if (filters?.endDate) params.set("endDate", filters.endDate);
  if (filters?.categoryId) params.set("categoryId", filters.categoryId);
  if (filters?.accountId) params.set("accountId", filters.accountId);
  if (filters?.merchantId) params.set("merchantId", filters.merchantId);
  if (filters?.tagId) params.set("tagId", filters.tagId);
  if (filters?.limit !== undefined) params.set("limit", String(filters.limit));
  if (filters?.offset !== undefined) params.set("offset", String(filters.offset));
  const qs = params.toString();
  return useQuery({
    queryKey: [...transactionsQueryKey, filters ?? {}],
    queryFn: () =>
      apiFetch<TransactionListResponse>(
        `/api/transactions${qs ? `?${qs}` : ""}`,
      ),
  });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTransactionInput) =>
      apiFetch<TransactionWithRelations>("/api/transactions", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["transactions"] }),
  });
}

export function useUpdateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateTransactionInput;
    }) =>
      apiFetch<TransactionWithRelations>(`/api/transactions/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["transactions"] }),
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<void>(`/api/transactions/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["transactions"] }),
  });
}
