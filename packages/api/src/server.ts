import { buildApp } from "./app";
import { config } from "./config";

async function start() {
  const app = await buildApp();

  await app.listen({ port: config.port, host: config.host });

  const shutdown = async () => {
    app.log.info("Shutting down...");
    await app.close();
    process.exit(0);
  };

  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
}

// Catch startup errors (e.g. port in use, DB unreachable) and exit with a
// clear message instead of an unhandled promise rejection warning.
start().catch((err) => {
  console.error("Fatal startup error:", err);
  process.exit(1);
});
