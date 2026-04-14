import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { config } from "../config";

/**
 * The postgres() call creates a CONNECTION POOL, not a single connection.
 *
 * Why a pool?
 * Opening a TCP connection + TLS handshake + PostgreSQL auth takes ~5–20 ms.
 * If you opened a fresh connection per request, a page that fires 10 queries
 * would add 50–200 ms of pure overhead. A pool keeps N connections open and
 * reuses them, so each query just borrows an already-open connection.
 *
 * Key options:
 *   max            — maximum simultaneous connections (default: 10).
 *                    Set this to (postgres max_connections / number_of_api_instances) - some_headroom.
 *   idle_timeout   — close a connection that has been idle for this many seconds.
 *                    Prevents holding DB connections for processes that don't need them.
 *   connect_timeout — give up trying to open a new connection after this many seconds.
 *                    Without this, a hung DB can freeze your entire API indefinitely.
 */
export const sql = postgres(config.databaseUrl, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

/**
 * The Drizzle ORM instance.
 *
 * Passing `schema` enables the relational query API:
 *   db.query.transactions.findMany({ with: { category: true } })
 *
 * Without it you can still use db.select() / db.insert() etc. — the schema
 * just unlocks the extra ergonomic API on top.
 */
export const db = drizzle(sql, { schema });

/** Convenience type — used to type-hint the db object in other modules. */
export type Database = typeof db;
