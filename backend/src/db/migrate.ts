import { readFile, readdir } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getPool, closePool } from './pool.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const sqlDir = join(__dirname, '../../sql')

async function ensureMigrationsTable(pool: ReturnType<typeof getPool>) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename    VARCHAR(255) PRIMARY KEY,
      applied_at  TIMESTAMPTZ DEFAULT NOW()
    )
  `)
}

async function isApplied(pool: ReturnType<typeof getPool>, filename: string): Promise<boolean> {
  const { rows } = await pool.query<{ filename: string }>(
    'SELECT filename FROM schema_migrations WHERE filename = $1',
    [filename],
  )
  return rows.length > 0
}

async function recordMigration(pool: ReturnType<typeof getPool>, filename: string) {
  await pool.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [filename])
}

async function migrate() {
  const pool = getPool()
  await ensureMigrationsTable(pool)

  const files = (await readdir(sqlDir))
    .filter((f) => f.endsWith('.sql') && f !== '000_migrations.sql')
    .sort()

  for (const file of files) {
    if (await isApplied(pool, file)) {
      console.log(`Skipping (already applied): ${file}`)
      continue
    }

    const sql = await readFile(join(sqlDir, file), 'utf-8')
    console.log(`Running migration: ${file}`)
    await pool.query(sql)
    await recordMigration(pool, file)
    console.log(`Completed: ${file}`)
  }

  await closePool()
  console.log('All migrations completed.')
}

migrate().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
