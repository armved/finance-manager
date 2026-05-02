import type { ReactNode } from "react";

export function PageContainer({ children }: { children: ReactNode }) {
  return (
    <div className="flex-1 overflow-y-auto px-[clamp(16px,5vw,80px)] pt-6 pb-24 md:pb-6">
      <div className="mx-auto w-full max-w-[1100px]">{children}</div>
    </div>
  );
}
