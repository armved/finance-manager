import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Pencil, SlidersHorizontal, Wallet } from "lucide-react";
import type { AccountWithBalance } from "@finance-manager/shared";
import { useAccounts, useDeleteAccount } from "../api/accounts";
import { AccountDialog } from "../components/accounts/AccountDialog";
import { AdjustBalanceDialog } from "../components/accounts/AdjustBalanceDialog";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { PageContainer } from "../components/layout/page-container";
import { PageHeader } from "../components/layout/top-bar";

export const Route = createFileRoute("/accounts")({
  component: AccountsPage,
});

function formatBalance(balance: number): string {
  return balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function AccountCard({
  account,
  onEdit,
  onAdjust,
  onDelete,
}: {
  account: AccountWithBalance;
  onEdit: (a: AccountWithBalance) => void;
  onAdjust: (a: AccountWithBalance) => void;
  onDelete: (a: AccountWithBalance) => void;
}) {
  const isPositive = account.balance >= 0;

  return (
    <div className="group flex flex-col gap-4 rounded-xl border border-border bg-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-primary/10 text-primary">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{account.name}</p>
            <p className="text-xs text-muted-foreground">{account.currencyCode}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={() => onEdit(account)}
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded text-muted-foreground transition-colors hover:bg-surface-raised hover:text-foreground"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onDelete(account)}
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded text-muted-foreground transition-colors hover:bg-expense/15 hover:text-expense"
          >
            <span className="text-xs font-bold">✕</span>
          </button>
        </div>
      </div>

      <div>
        <p className="text-xs text-muted-foreground">Balance</p>
        <p className={`font-mono text-2xl font-semibold ${isPositive ? "text-foreground" : "text-expense"}`}>
          {isPositive ? "" : "-"}€{formatBalance(Math.abs(account.balance))}
        </p>
      </div>

      <button
        onClick={() => onAdjust(account)}
        className="flex cursor-pointer items-center gap-1.5 self-start rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-surface-raised hover:text-foreground"
      >
        <SlidersHorizontal className="h-3 w-3" />
        Adjust Balance
      </button>
    </div>
  );
}

function AccountsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AccountWithBalance | null>(null);
  const [adjustAccount, setAdjustAccount] = useState<AccountWithBalance | null>(null);
  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false);
  const [deleteAccount, setDeleteAccount] = useState<AccountWithBalance | null>(null);

  const { data: accounts, isPending } = useAccounts();
  const deleteAcc = useDeleteAccount();

  function handleEdit(account: AccountWithBalance) {
    setEditingAccount(account);
    setDialogOpen(true);
  }

  function handleAdjust(account: AccountWithBalance) {
    setAdjustAccount(account);
    setAdjustDialogOpen(true);
  }

  function handleAdd() {
    setEditingAccount(null);
    setDialogOpen(true);
  }

  return (
    <>
      <PageHeader title="Accounts" />
      <PageContainer>
        <div className="space-y-5">
          <div className="flex justify-end">
            <button
              onClick={handleAdd}
              className="flex cursor-pointer items-center gap-2 rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-600"
            >
              <Plus className="h-4 w-4" />
              Add Account
            </button>
          </div>

          {isPending ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-44 animate-pulse rounded-xl bg-surface" />
              ))}
            </div>
          ) : accounts?.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-surface py-16 text-center">
              <Wallet className="mb-3 h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">No accounts yet</p>
              <p className="mt-1 text-xs text-muted-foreground">Add your first account to start tracking balances.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {accounts?.map((account) => (
                <AccountCard
                  key={account.id}
                  account={account}
                  onEdit={handleEdit}
                  onAdjust={handleAdjust}
                  onDelete={setDeleteAccount}
                />
              ))}
            </div>
          )}
        </div>
      </PageContainer>

      <AccountDialog
        open={dialogOpen}
        onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditingAccount(null); }}
        editing={editingAccount}
      />

      <AdjustBalanceDialog
        open={adjustDialogOpen}
        onOpenChange={(open) => { setAdjustDialogOpen(open); if (!open) setAdjustAccount(null); }}
        account={adjustAccount}
      />

      <ConfirmDialog
        open={deleteAccount !== null}
        onOpenChange={(open) => { if (!open) setDeleteAccount(null); }}
        title={`Remove "${deleteAccount?.name}"?`}
        description="The account will be hidden. Existing transactions are kept."
        confirmLabel="Remove"
        destructive
        isPending={deleteAcc.isPending}
        onConfirm={() => {
          if (deleteAccount) {
            deleteAcc.mutate(deleteAccount.id, { onSuccess: () => setDeleteAccount(null) });
          }
        }}
      />
    </>
  );
}
