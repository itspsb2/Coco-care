import { createApp } from './app.js'
import { env } from './config/env.js'
import { warmupBert } from './services/bertNlp.service.js'

async function main() {
  if (env.bertRequired) {
    try {
      await warmupBert()
    } catch (err) {
      console.error('Failed to load BERT model (required for RAG chat):', err)
      process.exit(1)
    }
  }

  const app = createApp()
  app.listen(env.port, () => {
    console.log(`Coco Care backend running on http://localhost:${env.port}`)
  })
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
