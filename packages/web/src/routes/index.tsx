import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: () => <p className="px-6 text-gray-400">It works!</p>,
});
