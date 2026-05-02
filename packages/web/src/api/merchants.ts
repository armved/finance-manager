import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Merchant } from "@finance-manager/shared";
import { apiFetch } from "./client";

export const merchantsQueryKey = ["merchants"] as const;

export function useMerchants(q?: string) {
  const qs = q ? `?q=${encodeURIComponent(q)}` : "";
  return useQuery({
    queryKey: [...merchantsQueryKey, q ?? "all"],
    queryFn: () => apiFetch<Merchant[]>(`/api/merchants${qs}`),
    enabled: q === undefined || q.length > 0,
  });
}

export function useCreateMerchant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) =>
      apiFetch<Merchant>("/api/merchants", {
        method: "POST",
        body: JSON.stringify({ name }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: merchantsQueryKey }),
  });
}

export function useUpdateMerchant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      apiFetch<Merchant>(`/api/merchants/${id}`, {
        method: "PUT",
        body: JSON.stringify({ name }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: merchantsQueryKey }),
  });
}

export function useDeleteMerchant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<void>(`/api/merchants/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: merchantsQueryKey });
      qc.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}
