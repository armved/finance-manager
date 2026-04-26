import { create } from "zustand";
import type { TransactionWithRelations } from "@finance-manager/shared";

interface UIState {
  isAddTransactionOpen: boolean;
  editingTransaction: TransactionWithRelations | null;
  preselectedCategoryId: string | null;
  openAddTransaction: () => void;
  openAddTransactionWithCategory: (categoryId: string) => void;
  openEditTransaction: (tx: TransactionWithRelations) => void;
  closeAddTransaction: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isAddTransactionOpen: false,
  editingTransaction: null,
  preselectedCategoryId: null,
  openAddTransaction: () =>
    set({ isAddTransactionOpen: true, editingTransaction: null, preselectedCategoryId: null }),
  openAddTransactionWithCategory: (categoryId) =>
    set({ isAddTransactionOpen: true, editingTransaction: null, preselectedCategoryId: categoryId }),
  openEditTransaction: (tx) =>
    set({ isAddTransactionOpen: true, editingTransaction: tx, preselectedCategoryId: null }),
  closeAddTransaction: () =>
    set({ isAddTransactionOpen: false, editingTransaction: null, preselectedCategoryId: null }),
}));
