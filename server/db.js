import pg from 'pg'
const { Pool } = pg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
})

// Helper: run a query
export function query(text, params) {
  return pool.query(text, params)
}

// Helper: get single row
export async function queryOne(text, params) {
  const result = await pool.query(text, params)
  return result.rows[0] || null
}

// Helper: get all rows
export async function queryAll(text, params) {
  const result = await pool.query(text, params)
  return result.rows
}

// Helper: run inside a transaction
export async function transaction(fn) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const result = await fn(client)
    await client.query('COMMIT')
    return result
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
}

export default pool
