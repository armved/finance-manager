import { useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X } from "lucide-react";
import type { AccountWithBalance } from "@finance-manager/shared";
import { useAdjustBalance } from "../../api/accounts";

const formSchema = z.object({
  balance: z.number().min(0, "Balance cannot be negative").finite(),
});
type FormValues = z.infer<typeof formSchema>;

interface AdjustBalanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: AccountWithBalance | null;
}

export function AdjustBalanceDialog({ open, onOpenChange, account }: AdjustBalanceDialogProps) {
  const adjustBalance = useAdjustBalance();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { balance: 0 },
  });

  useEffect(() => {
    if (open && account) {
      reset({ balance: account.balance });
    }
  }, [open, account, reset]);

  async function onSubmit(data: FormValues) {
    if (!account) return;
    await adjustBalance.mutateAsync({ id: account.id, data: { balance: data.balance } });
    onOpenChange(false);
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content aria-describedby={undefined} className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-surface p-6 shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <div className="mb-2 flex items-center justify-between">
            <Dialog.Title className="text-base font-semibold text-foreground">
              Adjust Balance
            </Dialog.Title>
            <button
              onClick={() => onOpenChange(false)}
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded text-muted-foreground transition-colors hover:bg-surface-raised hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {account && (
            <p className="mb-5 text-sm text-muted-foreground">
              Set the current real balance of <span className="font-medium text-foreground">{account.name}</span>. Transactions from today onwards will count on top of this.
            </p>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Current balance
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">€</span>
                <input
                  {...register("balance", { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="w-full rounded-lg border border-border bg-background py-2 pl-7 pr-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
                />
              </div>
              {errors.balance && (
                <p className="mt-1 text-xs text-expense">{errors.balance.message}</p>
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
                disabled={adjustBalance.isPending}
                className="flex-1 cursor-pointer rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {adjustBalance.isPending ? "Saving…" : "Set Balance"}
              </button>
            </div>

            {adjustBalance.isError && (
              <p className="text-center text-xs text-expense">
                {adjustBalance.error?.message ?? "Something went wrong."}
              </p>
            )}
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
