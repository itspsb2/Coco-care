import 'dotenv/config'
import * as knowledgeRepo from '../src/repositories/knowledge.repository.js'
import { closePool } from '../src/db/pool.js'

async function main() {
  await knowledgeRepo.clearAllKnowledge()
  await closePool()
  console.log('Knowledge base cleared.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
