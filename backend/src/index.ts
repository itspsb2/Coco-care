import { createApp } from './app.js'
import { env } from './config/env.js'
import { warmupGeminiEmbedding } from './services/geminiEmbedding.service.js'

async function main() {
  if (env.geminiEmbeddingEnabled) {
    if (!env.geminiApiKey) {
      console.error(
        'GEMINI_API_KEY is required when GEMINI_EMBEDDING_ENABLED=true. Add it to backend/.env and restart.',
      )
      process.exit(1)
    }
    try {
      await warmupGeminiEmbedding()
    } catch (err) {
      console.error('Failed to warm up Gemini embeddings (required for RAG chat):', err)
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
