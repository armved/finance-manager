import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "./client";

export interface ExpenseByCategoryItem {
  categoryId: string;
  name: string;
  icon: string | null;
  color: string | null;
  amount: number;
}

export interface DashboardAnalytics {
  summary: {
    totalIncome: number;
    totalExpenses: number;
  };
  expensesByCategory: ExpenseByCategoryItem[];
}

export const analyticsDashboardQueryKey = (startDate: string, endDate: string) =>
  ["analytics", "dashboard", startDate, endDate] as const;

export function useAnalyticsDashboard(startDate: string, endDate: string) {
  return useQuery({
    queryKey: analyticsDashboardQueryKey(startDate, endDate),
    queryFn: () =>
      apiFetch<DashboardAnalytics>(
        `/api/analytics/dashboard?start=${startDate}&end=${endDate}`,
      ),
  });
}
