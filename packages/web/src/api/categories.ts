import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Category } from "@finance-manager/shared";
import { apiFetch } from "./client";

export const categoriesQueryKey = ["categories"] as const;

function flattenTree(nodes: Category[]): Category[] {
  return nodes.flatMap((n) => [n, ...flattenTree(n.children)]);
}

export function useCategories(type?: "income" | "expense") {
  const qs = type ? `?type=${type}` : "";
  return useQuery({
    queryKey: [...categoriesQueryKey, type ?? "all"],
    queryFn: () =>
      apiFetch<Category[]>(`/api/categories${qs}`).then(flattenTree),
  });
}

export function useCategoryTree(type?: "income" | "expense") {
  const qs = type ? `?type=${type}` : "";
  return useQuery({
    queryKey: [...categoriesQueryKey, type ?? "all", "tree"],
    queryFn: () => apiFetch<Category[]>(`/api/categories${qs}`),
  });
}

export function useMoveCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, parentId }: { id: string; parentId: string | null }) =>
      apiFetch<Category>(`/api/categories/${id}/move`, {
        method: "PUT",
        body: JSON.stringify({ parentId }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: categoriesQueryKey }),
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
      parentId?: string | null;
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

export function useReorderCategories() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (items: { id: string; sortOrder: number }[]) =>
      apiFetch<void>("/api/categories/reorder", {
        method: "PUT",
        body: JSON.stringify({ items }),
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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: categoriesQueryKey });
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}
