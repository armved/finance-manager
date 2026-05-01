import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import path from "path";
import { fileURLToPath } from "url";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsFolder = path.join(__dirname, "migrations");

console.log("Connecting to database...");
const sql = postgres(connectionString, { max: 1, connect_timeout: 10 });
const db = drizzle(sql);

console.log(`Running migrations from ${migrationsFolder}`);
await migrate(db, { migrationsFolder });
console.log("Migrations complete.");

await sql.end();
