import { createFileRoute } from "@tanstack/react-router";
import { useHealthCheck } from "../api/health";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const { data, isLoading, isError } = useHealthCheck();

  return (
    <div className="px-6 py-4">
      <ApiStatus isLoading={isLoading} isError={isError} db={data?.db} />
    </div>
  );
}

interface ApiStatusProps {
  isLoading: boolean;
  isError: boolean;
  db?: string;
}

function ApiStatus({ isLoading, isError, db }: ApiStatusProps) {
  if (isLoading) {
    return <p className="text-gray-400">Checking API status...</p>;
  }

  if (isError) {
    return <p className="text-red-400">🔴 API Down</p>;
  }

  return <p className="text-green-400">🟢 API Connected, DB: {db}</p>;
}
