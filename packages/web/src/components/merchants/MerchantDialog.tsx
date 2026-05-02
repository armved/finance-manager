import { useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X } from "lucide-react";
import type { Merchant } from "@finance-manager/shared";
import { useCreateMerchant, useUpdateMerchant } from "../../api/merchants";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(200),
});

type FormValues = z.infer<typeof schema>;

interface MerchantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing?: Merchant | null;
}

export function MerchantDialog({ open, onOpenChange, editing }: MerchantDialogProps) {
  const isEditing = editing != null;
  const createMerchant = useCreateMerchant();
  const updateMerchant = useUpdateMerchant();
  const isPending = isEditing ? updateMerchant.isPending : createMerchant.isPending;
  const isError = isEditing ? updateMerchant.isError : createMerchant.isError;
  const errorMessage = isEditing ? updateMerchant.error?.message : createMerchant.error?.message;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "" },
  });

  useEffect(() => {
    if (!open) return;
    reset({ name: editing?.name ?? "" });
  }, [open, editing, reset]);

  async function onSubmit(data: FormValues) {
    if (isEditing) {
      await updateMerchant.mutateAsync({ id: editing.id, name: data.name });
    } else {
      await createMerchant.mutateAsync(data.name);
    }
    onOpenChange(false);
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content aria-describedby={undefined} className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-surface p-6 shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <div className="mb-5 flex items-center justify-between">
            <Dialog.Title className="text-base font-semibold text-foreground">
              {isEditing ? "Edit Merchant" : "Add Merchant"}
            </Dialog.Title>
            <button
              onClick={() => onOpenChange(false)}
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded text-muted-foreground transition-colors hover:bg-surface-raised hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Name
              </label>
              <input
                {...register("name")}
                type="text"
                placeholder="e.g. Lidl"
                autoFocus
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
                {isPending ? "Saving…" : isEditing ? "Save Changes" : "Add Merchant"}
              </button>
            </div>

            {isError && (
              <p className="text-center text-xs text-expense">
                {errorMessage ?? "Something went wrong. Please try again."}
              </p>
            )}
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
