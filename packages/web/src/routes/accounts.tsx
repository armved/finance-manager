import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/accounts")({
  component: AccountsPage,
});

function AccountsPage() {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <h1 className="text-2xl font-bold text-foreground">Accounts</h1>
    </div>
  );
}
