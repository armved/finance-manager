import { useEffect, useRef } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ChevronDown, X } from "lucide-react";
import { createTransactionSchema } from "@finance-manager/shared";
import { useCreateTransaction, useUpdateTransaction } from "../../api/transactions";
import { useCategories } from "../../api/categories";
import { useUIStore } from "../../store/ui";

const formSchema = createTransactionSchema.extend({
  categoryId: z
    .string()
    .min(1, "Please select a category")
    .uuid("Please select a category"),
});

type FormValues = z.infer<typeof formSchema>;

function today(): string {
  const d = new Date().toISOString().split("T");
  return d[0] ?? "";
}

export function TransactionDialog() {
  const isOpen = useUIStore((s) => s.isAddTransactionOpen);
  const editingTransaction = useUIStore((s) => s.editingTransaction);
  const close = useUIStore((s) => s.closeAddTransaction);
  const isEditing = editingTransaction !== null;

  const createTx = useCreateTransaction();
  const updateTx = useUpdateTransaction();
  const isPending = isEditing ? updateTx.isPending : createTx.isPending;
  const isError = isEditing ? updateTx.isError : createTx.isError;
  const errorMessage = isEditing ? updateTx.error?.message : createTx.error?.message;

  const {
    register,
    handleSubmit,
    watch,
    control,
    reset,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "expense",
      transactionDate: today(),
      categoryId: "",
    },
  });

  const txType = watch("type");
  const { data: categories } = useCategories(txType);

  // Keep a ref so the isOpen effect can read the latest categories without depending on them
  const categoriesRef = useRef(categories);
  categoriesRef.current = categories;

  // On open: reset to editing data or create defaults
  useEffect(() => {
    if (!isOpen) return;
    if (editingTransaction) {
      reset({
        type: editingTransaction.type,
        amount: editingTransaction.amount,
        transactionDate: editingTransaction.transactionDate,
        categoryId: editingTransaction.categoryId,
      });
    } else {
      const cats = categoriesRef.current;
      const defaultCat = cats?.find((c) => c.isDefault) ?? cats?.[0];
      reset({ type: "expense", transactionDate: today(), categoryId: defaultCat?.id ?? "" });
    }
  // editingTransaction intentionally omitted: we only want this to run on open/close transitions
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, reset]);

  // When categories data arrives (first load or type switch): auto-select default only if
  // no category is already chosen (i.e. create mode after type switch, or initial load)
  useEffect(() => {
    if (!categories?.length) return;
    if (getValues("categoryId")) return;
    const defaultCat = categories.find((c) => c.isDefault) ?? categories[0];
    if (defaultCat) setValue("categoryId", defaultCat.id);
  }, [categories, setValue, getValues]);

  async function onSubmit(data: FormValues) {
    if (isEditing) {
      await updateTx.mutateAsync({ id: editingTransaction.id, data });
    } else {
      await createTx.mutateAsync(data);
    }
    close();
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && close()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-surface p-6 shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <div className="mb-5 flex items-center justify-between">
            <Dialog.Title className="text-base font-semibold text-foreground">
              {isEditing ? "Edit Transaction" : "Add Transaction"}
            </Dialog.Title>
            <button
              onClick={close}
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded text-muted-foreground transition-colors hover:bg-surface-raised hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Type toggle */}
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <div className="flex rounded-lg border border-border bg-background p-1">
                  {(["expense", "income"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        if (field.value === t) return;
                        field.onChange(t);
                        setValue("categoryId", ""); // clear so auto-default kicks in for new type
                      }}
                      className={`flex-1 cursor-pointer rounded-md py-1.5 text-sm font-medium capitalize transition-colors ${
                        field.value === t
                          ? t === "expense"
                            ? "bg-expense/15 text-expense"
                            : "bg-income/15 text-income"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              )}
            />

            {/* Amount */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  €
                </span>
                <input
                  {...register("amount", { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  className="w-full rounded-lg border border-border bg-background py-2 pl-7 pr-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
                />
              </div>
              {errors.amount && (
                <p className="mt-1 text-xs text-expense">{errors.amount.message}</p>
              )}
            </div>

            {/* Date */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Date
              </label>
              <input
                {...register("transactionDate")}
                type="date"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none scheme-dark"
              />
              {errors.transactionDate && (
                <p className="mt-1 text-xs text-expense">
                  {errors.transactionDate.message}
                </p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Category
              </label>
              <div className="relative">
                <select
                  {...register("categoryId")}
                  className="w-full appearance-none rounded-lg border border-border bg-background px-3 py-2 pr-8 text-sm text-foreground focus:border-primary focus:outline-none"
                >
                  {categories?.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon ? `${cat.icon} ` : ""}
                      {cat.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
              {errors.categoryId && (
                <p className="mt-1 text-xs text-expense">
                  {errors.categoryId.message}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={close}
                className="flex-1 cursor-pointer rounded-lg border border-border py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-raised hover:text-foreground"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex-1 cursor-pointer rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPending ? "Saving…" : isEditing ? "Save Changes" : "Add Transaction"}
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
