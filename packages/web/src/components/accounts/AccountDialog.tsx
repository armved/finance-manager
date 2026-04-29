import { useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X } from "lucide-react";
import type { AccountWithBalance } from "@finance-manager/shared";
import { useCreateAccount, useUpdateAccount } from "../../api/accounts";

const createSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  currencyCode: z.string().length(3, "Currency code must be exactly 3 characters"),
  adjustedBalance: z.number().min(0, "Balance cannot be negative"),
});

const editSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
});

type CreateValues = z.infer<typeof createSchema>;
type EditValues = z.infer<typeof editSchema>;

interface AccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing?: AccountWithBalance | null;
}

export function AccountDialog({ open, onOpenChange, editing }: AccountDialogProps) {
  const isEditing = editing != null;
  const createAccount = useCreateAccount();
  const updateAccount = useUpdateAccount();
  const isPending = isEditing ? updateAccount.isPending : createAccount.isPending;
  const isError = isEditing ? updateAccount.isError : createAccount.isError;
  const errorMessage = isEditing ? updateAccount.error?.message : createAccount.error?.message;

  const createForm = useForm<CreateValues>({
    resolver: zodResolver(createSchema),
    defaultValues: { name: "", currencyCode: "EUR", adjustedBalance: 0 },
  });

  const editForm = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    defaultValues: { name: "" },
  });

  useEffect(() => {
    if (!open) return;
    if (editing) {
      editForm.reset({ name: editing.name });
    } else {
      createForm.reset({ name: "", currencyCode: "EUR", adjustedBalance: 0 });
    }
  }, [open, editing, createForm, editForm]);

  async function onCreateSubmit(data: CreateValues) {
    await createAccount.mutateAsync(data);
    onOpenChange(false);
  }

  async function onEditSubmit(data: EditValues) {
    await updateAccount.mutateAsync({ id: editing!.id, data: { name: data.name } });
    onOpenChange(false);
  }

  const errors = isEditing ? editForm.formState.errors : createForm.formState.errors;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content aria-describedby={undefined} className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-surface p-6 shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <div className="mb-5 flex items-center justify-between">
            <Dialog.Title className="text-base font-semibold text-foreground">
              {isEditing ? "Edit Account" : "Add Account"}
            </Dialog.Title>
            <button
              onClick={() => onOpenChange(false)}
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded text-muted-foreground transition-colors hover:bg-surface-raised hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {isEditing ? (
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Account name
                </label>
                <input
                  {...editForm.register("name")}
                  type="text"
                  placeholder="e.g. Visa Card"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-expense">{errors.name.message}</p>
                )}
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="flex-1 cursor-pointer rounded-lg border border-border py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-raised hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 cursor-pointer rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isPending ? "Saving…" : "Save Changes"}
                </button>
              </div>

              {isError && (
                <p className="text-center text-xs text-expense">
                  {errorMessage ?? "Something went wrong. Please try again."}
                </p>
              )}
            </form>
          ) : (
            <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Account name
                </label>
                <input
                  {...createForm.register("name")}
                  type="text"
                  placeholder="e.g. Visa Card"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
                />
                {createForm.formState.errors.name && (
                  <p className="mt-1 text-xs text-expense">{createForm.formState.errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Currency
                </label>
                <input
                  {...createForm.register("currencyCode")}
                  type="text"
                  maxLength={3}
                  placeholder="EUR"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground uppercase placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
                />
                {createForm.formState.errors.currencyCode && (
                  <p className="mt-1 text-xs text-expense">{createForm.formState.errors.currencyCode.message}</p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Starting balance
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">€</span>
                  <input
                    {...createForm.register("adjustedBalance", { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="w-full rounded-lg border border-border bg-background py-2 pl-7 pr-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
                  />
                </div>
                {createForm.formState.errors.adjustedBalance && (
                  <p className="mt-1 text-xs text-expense">{createForm.formState.errors.adjustedBalance.message}</p>
                )}
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="flex-1 cursor-pointer rounded-lg border border-border py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-raised hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 cursor-pointer rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isPending ? "Saving…" : "Add Account"}
                </button>
              </div>

              {isError && (
                <p className="text-center text-xs text-expense">
                  {errorMessage ?? "Something went wrong. Please try again."}
                </p>
              )}
            </form>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
