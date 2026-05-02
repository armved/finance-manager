import { useEffect, useRef, useState } from "react";
import { Plus, X } from "lucide-react";
import type { Merchant } from "@finance-manager/shared";
import { useMerchants, useCreateMerchant } from "../../api/merchants";
import { useDebounce } from "../../lib/use-debounce";

interface MerchantInputProps {
  value?: string | null;
  defaultName?: string;
  onChange: (id: string | null) => void;
}

export function MerchantInput({ value, defaultName, onChange }: MerchantInputProps) {
  const [inputValue, setInputValue] = useState(defaultName ?? "");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const debouncedInput = useDebounce(inputValue, 100);
  const searchQuery = open && debouncedInput.length > 0 ? debouncedInput : undefined;
  const { data: suggestions = [] } = useMerchants(searchQuery);
  const createMerchant = useCreateMerchant();

  useEffect(() => {
    setInputValue(defaultName ?? "");
  }, [defaultName]);

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  const trimmed = inputValue.trim();
  const hasExactMatch = suggestions.some((m) => m.name.toLowerCase() === trimmed.toLowerCase());
  const showDropdown = open && trimmed.length > 0 && (suggestions.length > 0 || !hasExactMatch);

  function handleSelect(merchant: Merchant) {
    setInputValue(merchant.name);
    onChange(merchant.id);
    setOpen(false);
  }

  async function handleCreate() {
    if (!trimmed) return;
    const merchant = await createMerchant.mutateAsync(trimmed);
    setInputValue(merchant.name);
    onChange(merchant.id);
    setOpen(false);
  }

  function handleClear() {
    setInputValue("");
    onChange(null);
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center rounded-lg border border-border bg-background focus-within:border-primary">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setOpen(true);
            if (!e.target.value) onChange(null);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search or create…"
          className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="mr-2 flex h-5 w-5 cursor-pointer items-center justify-center rounded text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {showDropdown && (
        <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-border bg-surface shadow-lg">
          {suggestions.map((merchant) => (
            <button
              key={merchant.id}
              type="button"
              onClick={() => handleSelect(merchant)}
              className="flex w-full cursor-pointer items-center px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-surface-raised"
            >
              {merchant.name}
            </button>
          ))}
          {!hasExactMatch && trimmed && (
            <button
              type="button"
              onClick={handleCreate}
              disabled={createMerchant.isPending}
              className="flex w-full cursor-pointer items-center gap-1.5 px-3 py-2 text-left text-sm text-primary transition-colors hover:bg-surface-raised disabled:opacity-50"
            >
              <Plus className="h-3.5 w-3.5 shrink-0" />
              Create "{trimmed}"
            </button>
          )}
        </div>
      )}
    </div>
  );
}
