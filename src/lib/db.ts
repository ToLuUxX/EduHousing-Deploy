import { Pool } from 'pg'

declare global {
  // eslint-disable-next-line no-var
  var __pgPool: Pool | undefined
}

export function getPgPool(): Pool {
  if (global.__pgPool) return global.__pgPool

  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DATABASE_URL is missing. Add it to .env.local.')
  }

  const pool = new Pool({ connectionString })
  if (process.env.NODE_ENV !== 'production') {
    global.__pgPool = pool
  }
  return pool
}
