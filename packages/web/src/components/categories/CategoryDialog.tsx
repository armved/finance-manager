import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X } from "lucide-react";
import type { Category } from "@finance-manager/shared";
import { CATEGORY_PALETTE } from "../../lib/category-meta";
import { CATEGORY_ICONS } from "../../lib/category-icons";
import {
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from "../../api/categories";
import { ConfirmDialog } from "../ui/ConfirmDialog";

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  type: z.enum(["income", "expense"]),
  icon: z.string().optional(),
  color: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  category?: Category;
  defaultType?: "income" | "expense";
}

export function CategoryDialog({
  open,
  onOpenChange,
  mode,
  category,
  defaultType = "expense",
}: Props) {
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: category?.name ?? "",
      type: category?.type ?? defaultType,
      icon: category?.icon ?? undefined,
      color: category?.color ?? undefined,
    },
  });

  const selectedIcon = watch("icon");
  const selectedColor = watch("color");
  const selectedType = watch("type");

  const isPending = createCategory.isPending || updateCategory.isPending;

  function onSubmit(data: FormValues) {
    if (mode === "create") {
      createCategory.mutate(data, { onSuccess: () => onOpenChange(false) });
    } else if (category) {
      updateCategory.mutate(
        { id: category.id, ...data },
        { onSuccess: () => onOpenChange(false) },
      );
    }
  }

  function handleDelete() {
    if (!category) return;
    deleteCategory.mutate(
      { id: category.id },
      {
        onSuccess: () => {
          setConfirmDeleteOpen(false);
          onOpenChange(false);
        },
      },
    );
  }

  return (
    <>
      <Dialog.Root open={open} onOpenChange={onOpenChange}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-surface p-6 shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
            <div className="mb-5 flex items-center justify-between">
              <Dialog.Title className="text-base font-semibold text-foreground">
                {mode === "create" ? "New Category" : "Edit Category"}
              </Dialog.Title>
              <Dialog.Close asChild>
                <button className="flex h-7 w-7 cursor-pointer items-center justify-center rounded text-muted-foreground transition-colors hover:bg-surface-raised hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </Dialog.Close>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Name */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Name
                </label>
                <input
                  {...register("name")}
                  type="text"
                  placeholder="e.g. Groceries"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-expense">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Type — hidden for default categories in edit mode */}
              {!(mode === "edit" && category?.isDefault) && (
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                    Type
                  </label>
                  <div className="flex rounded-lg border border-border bg-background p-1">
                    {(["expense", "income"] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setValue("type", t)}
                        className={`flex-1 cursor-pointer rounded-md py-1.5 text-sm font-medium capitalize transition-colors ${
                          selectedType === t
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
                </div>
              )}

              {/* Color */}
              <div>
                <label className="mb-2 block text-xs font-medium text-muted-foreground">
                  Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_PALETTE.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setValue("color", color)}
                      style={{ backgroundColor: color }}
                      className={`h-7 w-7 cursor-pointer rounded-full transition-transform hover:scale-110 ${
                        selectedColor === color
                          ? "scale-110 ring-2 ring-primary ring-offset-2 ring-offset-surface"
                          : ""
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Icon */}
              <div>
                <label className="mb-2 block text-xs font-medium text-muted-foreground">
                  Icon
                </label>
                <div className="grid max-h-36 grid-cols-8 gap-1 overflow-y-auto pr-1">
                  {CATEGORY_ICONS.map(({ id, label, icon: IconComp }) => (
                    <button
                      key={id}
                      type="button"
                      title={label}
                      onClick={() => setValue("icon", id)}
                      className={`flex cursor-pointer items-center justify-center rounded-lg p-2 transition-colors ${
                        selectedIcon === id
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-surface-raised hover:text-foreground"
                      }`}
                    >
                      <IconComp className="h-4 w-4" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center gap-3 pt-1">
                {mode === "edit" && !category?.isDefault && (
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteOpen(true)}
                    className="cursor-pointer rounded-lg border border-expense px-4 py-2 text-sm font-medium text-expense transition-colors hover:bg-expense/10"
                  >
                    Delete
                  </button>
                )}
                <div className="flex-1" />
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="cursor-pointer rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-raised hover:text-foreground"
                  >
                    Cancel
                  </button>
                </Dialog.Close>
                <button
                  type="submit"
                  disabled={isPending}
                  className="cursor-pointer rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isPending ? "Saving…" : mode === "create" ? "Create" : "Save"}
                </button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        title="Delete category?"
        description="All transactions in this category will be moved to Uncategorized."
        confirmLabel="Delete"
        destructive
        isPending={deleteCategory.isPending}
        onConfirm={handleDelete}
      />
    </>
  );
}
