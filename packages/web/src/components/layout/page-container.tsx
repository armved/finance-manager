import type { ReactNode } from "react";

export function PageContainer({ children }: { children: ReactNode }) {
  return (
    <div className="flex-1 overflow-y-auto px-[clamp(24px,5vw,80px)] py-6">
      <div className="mx-auto w-full max-w-[1100px]">{children}</div>
    </div>
  );
}
