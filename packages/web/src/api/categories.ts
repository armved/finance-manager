import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Category } from "@finance-manager/shared";
import { apiFetch } from "./client";

export const categoriesQueryKey = ["categories"] as const;

export function useCategories(type?: "income" | "expense") {
  const qs = type ? `?type=${type}` : "";
  return useQuery({
    queryKey: [...categoriesQueryKey, type ?? "all"],
    queryFn: () => apiFetch<Category[]>(`/api/categories${qs}`),
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      name: string;
      type: "income" | "expense";
      icon?: string;
      color?: string;
    }) =>
      apiFetch<Category>("/api/categories", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: categoriesQueryKey }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...data
    }: {
      id: string;
      name?: string;
      type?: "income" | "expense";
      icon?: string | null;
      color?: string | null;
    }) =>
      apiFetch<Category>(`/api/categories/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: categoriesQueryKey }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      reassignToCategoryId,
    }: {
      id: string;
      reassignToCategoryId?: string;
    }) => {
      const qs = reassignToCategoryId
        ? `?reassignToCategoryId=${reassignToCategoryId}`
        : "";
      return apiFetch<void>(`/api/categories/${id}${qs}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: categoriesQueryKey }),
  });
}
