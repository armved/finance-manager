import { create } from "zustand";
import type { TransactionWithRelations } from "@finance-manager/shared";

interface UIState {
  isAddTransactionOpen: boolean;
  editingTransaction: TransactionWithRelations | null;
  openAddTransaction: () => void;
  openEditTransaction: (tx: TransactionWithRelations) => void;
  closeAddTransaction: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isAddTransactionOpen: false,
  editingTransaction: null,
  openAddTransaction: () => set({ isAddTransactionOpen: true, editingTransaction: null }),
  openEditTransaction: (tx) => set({ isAddTransactionOpen: true, editingTransaction: tx }),
  closeAddTransaction: () => set({ isAddTransactionOpen: false, editingTransaction: null }),
}));
