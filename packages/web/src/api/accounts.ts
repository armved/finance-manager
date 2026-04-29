import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AccountWithBalance,
  AdjustBalanceInput,
  CreateAccountInput,
  UpdateAccountInput,
} from "@finance-manager/shared";
import { apiFetch } from "./client";

export const accountsQueryKey = ["accounts", "list"] as const;

export function useAccounts() {
  return useQuery({
    queryKey: accountsQueryKey,
    queryFn: () => apiFetch<AccountWithBalance[]>("/api/accounts"),
  });
}

export function useCreateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAccountInput) =>
      apiFetch<AccountWithBalance>("/api/accounts", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: accountsQueryKey }),
  });
}

export function useUpdateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAccountInput }) =>
      apiFetch<AccountWithBalance>(`/api/accounts/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: accountsQueryKey }),
  });
}

export function useAdjustBalance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AdjustBalanceInput }) =>
      apiFetch<AccountWithBalance>(`/api/accounts/${id}/adjust-balance`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: accountsQueryKey }),
  });
}

export function useDeleteAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<void>(`/api/accounts/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: accountsQueryKey }),
  });
}
