import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Plus, Store, Trash2 } from "lucide-react";
import type { Merchant } from "@finance-manager/shared";
import { useMerchants, useDeleteMerchant } from "../api/merchants";
import { MerchantDialog } from "../components/merchants/MerchantDialog";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { PageContainer } from "../components/layout/page-container";
import { PageHeader } from "../components/layout/top-bar";

export const Route = createFileRoute("/merchants")({
  component: MerchantsPage,
});

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function MerchantsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMerchant, setEditingMerchant] = useState<Merchant | null>(null);
  const [deletingMerchant, setDeletingMerchant] = useState<Merchant | null>(null);

  const { data: merchants, isPending } = useMerchants();
  const deleteMerchant = useDeleteMerchant();

  function handleAdd() {
    setEditingMerchant(null);
    setDialogOpen(true);
  }

  function handleEdit(merchant: Merchant) {
    setEditingMerchant(merchant);
    setDialogOpen(true);
  }

  return (
    <>
      <PageHeader title="Merchants">
        <button
          onClick={handleAdd}
          className="flex cursor-pointer items-center gap-2 rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-600"
        >
          <Plus className="h-4 w-4" />
          Add Merchant
        </button>
      </PageHeader>

      <PageContainer>
        <div className="rounded-xl border border-border bg-surface">
          {isPending ? (
            <div className="divide-y divide-border">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-6 py-4">
                  <div className="h-8 w-8 animate-pulse rounded-lg bg-surface-raised" />
                  <div className="h-4 w-32 animate-pulse rounded bg-surface-raised" />
                </div>
              ))}
            </div>
          ) : !merchants?.length ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Store className="mb-3 h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">No merchants yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Add a merchant or create one inline when adding a transaction.
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Name
                  </th>
                  <th className="hidden px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-muted-foreground sm:table-cell">
                    Added
                  </th>
                  <th className="w-24 px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {merchants.map((merchant) => (
                  <tr
                    key={merchant.id}
                    className="group border-b border-border last:border-0 transition-colors hover:bg-surface-raised"
                  >
                    <td className="px-6 py-3">
                      <span className="text-sm font-medium text-foreground">{merchant.name}</span>
                    </td>
                    <td className="hidden px-6 py-3 text-sm text-muted-foreground sm:table-cell">
                      {formatDate(merchant.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1 opacity-100 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
                        <button
                          onClick={() => handleEdit(merchant)}
                          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingMerchant(merchant)}
                          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded text-muted-foreground transition-colors hover:bg-expense/15 hover:text-expense"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </PageContainer>

      <MerchantDialog
        open={dialogOpen}
        onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditingMerchant(null); }}
        editing={editingMerchant}
      />

      <ConfirmDialog
        open={deletingMerchant !== null}
        onOpenChange={(open) => { if (!open) setDeletingMerchant(null); }}
        title={`Delete "${deletingMerchant?.name}"?`}
        description="The merchant will be removed. Existing transactions will keep a reference but show no merchant name."
        confirmLabel="Delete"
        destructive
        isPending={deleteMerchant.isPending}
        onConfirm={() => {
          if (deletingMerchant) {
            deleteMerchant.mutate(deletingMerchant.id, { onSuccess: () => setDeletingMerchant(null) });
          }
        }}
      />
    </>
  );
}
