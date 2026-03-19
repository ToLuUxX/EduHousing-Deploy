import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var __pgPool: Pool | undefined;
}

function createPool(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL est manquant. Ajoute-le dans .env.local.");
  }

  return new Pool({ connectionString });
}

export function getPgPool(): Pool {
  if (global.__pgPool) {
    return global.__pgPool;
  }

  const pool = createPool();
  if (process.env.NODE_ENV !== "production") {
    global.__pgPool = pool;
  }
  return pool;
}
