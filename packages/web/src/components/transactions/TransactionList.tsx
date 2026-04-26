import { useState } from "react";
import {Pencil, ShoppingBag, Trash2} from "lucide-react";
import { useTransactions, useDeleteTransaction } from "../../api/transactions";
import { useUIStore } from "../../store/ui";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { getIconComponent } from "../../lib/category-icons";
import {DEFAULT_EXPENSE_CATEGORY} from "../../lib/category-meta";

function formatDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatAmount(amount: number, type: "income" | "expense"): string {
  const formatted = amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${type === "income" ? "+" : "-"}€${formatted}`;
}

function SkeletonRow() {
  return (
    <tr className="border-b border-border last:border-0">
      <td className="px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 animate-pulse rounded-[10px] bg-surface-raised" />
          <div className="flex flex-col gap-1">
            <div className="h-4 w-28 animate-pulse rounded bg-surface-raised" />
            <div className="h-3 w-20 animate-pulse rounded bg-surface-raised" />
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="h-4 w-20 animate-pulse rounded bg-surface-raised" />
      </td>
      <td className="px-6 py-3 text-right">
        <div className="ml-auto h-4 w-16 animate-pulse rounded bg-surface-raised" />
      </td>
      <td className="w-24 px-4 py-3" />
    </tr>
  );
}

interface TransactionListProps {
  typeFilter?: "all" | "income" | "expense";
}

export function TransactionList({ typeFilter = "all" }: TransactionListProps) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const openEditTransaction = useUIStore((s) => s.openEditTransaction);
  const deleteTx = useDeleteTransaction();

  const { data, isPending, error } = useTransactions(
    typeFilter !== "all" ? { type: typeFilter } : undefined,
  );

  const rows = data?.data;

  return (
    <>
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <h2 className="text-sm font-semibold text-foreground">All Transactions</h2>
        {data && (
          <span className="text-xs text-muted-foreground">
            {rows?.length ?? data.total} total
          </span>
        )}
      </div>

      {error ? (
        <div className="px-6 py-12 text-center text-sm text-muted-foreground">
          Failed to load transactions: {error.message}
        </div>
      ) : (
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Category
              </th>
              <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Date
              </th>
              <th className="px-6 py-3 text-right text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Amount
              </th>
              <th className="w-24 px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {isPending ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
            ) : rows?.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-12 text-center text-sm text-muted-foreground"
                >
                  No transactions yet. Add your first one!
                </td>
              </tr>
            ) : (
              rows?.map((tx) => {
                const name = tx.merchant?.name ?? "Transaction";
                const categoryColor = tx.category.color || DEFAULT_EXPENSE_CATEGORY.color;
                const isIncome = tx.type === "income";
                const IconComp = getIconComponent(tx.category.icon) ?? DEFAULT_EXPENSE_CATEGORY.icon;

                return (
                  <tr
                    key={tx.id}
                    onClick={() => openEditTransaction(tx)}
                    className="group cursor-pointer border-b border-border transition-colors last:border-0 hover:bg-surface-raised"
                  >
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]"
                          style={{ backgroundColor: `${categoryColor}20`}}
                        >
                          <IconComp className="h-[18px] w-[18px]" style={{ color: categoryColor }} />
                        </div>
                        <div className="flex min-w-0 flex-col gap-0.5">
                          <span className="text-sm font-semibold leading-tight text-foreground">
                            {tx.category.name}
                          </span>
                          <span className="truncate text-xs leading-tight text-muted-foreground">
                            {name}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {formatDate(tx.transactionDate)}
                    </td>
                    <td
                      className={`px-6 py-3 text-right font-mono text-sm font-semibold ${
                        isIncome ? "text-income" : "text-expense"
                      }`}
                    >
                      {formatAmount(tx.amount, tx.type)}
                    </td>
                    <td
                      className="px-4 py-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          onClick={() => openEditTransaction(tx)}
                          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(tx.id)}
                          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded text-muted-foreground transition-colors hover:bg-expense/15 hover:text-expense"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      )}
    </div>

    <ConfirmDialog
      open={confirmDeleteId !== null}
      onOpenChange={(open) => { if (!open) setConfirmDeleteId(null); }}
      title="Delete transaction?"
      description="This action cannot be undone."
      confirmLabel="Delete"
      destructive
      isPending={deleteTx.isPending}
      onConfirm={() => {
        if (confirmDeleteId) {
          deleteTx.mutate(confirmDeleteId, { onSuccess: () => setConfirmDeleteId(null) });
        }
      }}
    />
    </>
  );
}
