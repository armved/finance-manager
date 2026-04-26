import { useQuery } from "@tanstack/react-query";
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
