import 'dotenv/config'
import { ingestFromDirectory } from '../src/services/ragIngest.service.js'
import { closePool } from '../src/db/pool.js'

async function main() {
  await ingestFromDirectory()
  await closePool()
  console.log('Knowledge ingestion complete.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
