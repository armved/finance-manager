import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  destructive?: boolean;
  isPending?: boolean;
  onConfirm: () => void;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  destructive = false,
  isPending = false,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-surface p-6 shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <div className="mb-4 flex items-start justify-between gap-4">
            <Dialog.Title className="text-base font-semibold text-foreground">
              {title}
            </Dialog.Title>
            <button
              onClick={() => onOpenChange(false)}
              className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded text-muted-foreground transition-colors hover:bg-surface-raised hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <Dialog.Description className={description ? "mb-5 text-sm text-muted-foreground" : "sr-only"}>
            {description ?? ""}
          </Dialog.Description>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex-1 cursor-pointer rounded-lg border border-border py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-raised hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={onConfirm}
              className={`flex-1 cursor-pointer rounded-lg py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                destructive
                  ? "bg-expense text-white hover:bg-expense/80"
                  : "bg-primary text-primary-foreground hover:bg-primary-600"
              }`}
            >
              {isPending ? "…" : confirmLabel}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
