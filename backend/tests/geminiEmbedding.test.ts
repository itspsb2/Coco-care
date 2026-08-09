import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals'

describe('geminiEmbedding.service', () => {
  const originalFetch = global.fetch
  const originalEnv = { ...process.env }

  beforeEach(() => {
    jest.resetModules()
    process.env = {
      ...originalEnv,
      GEMINI_API_KEY: 'test-key',
      GEMINI_EMBEDDING_ENABLED: 'true',
      GEMINI_EMBEDDING_MODEL: 'gemini-embedding-001',
      GEMINI_EMBEDDING_DIMENSIONS: '768',
    }
    global.fetch = jest.fn() as typeof fetch
  })

  afterEach(() => {
    global.fetch = originalFetch
    process.env = originalEnv
    jest.clearAllMocks()
  })

  async function loadService() {
    return import('../src/services/geminiEmbedding.service.js')
  }

  describe('isGeminiEmbeddingReady', () => {
    it('returns true when key is set and enabled', async () => {
      const { isGeminiEmbeddingReady } = await loadService()
      expect(isGeminiEmbeddingReady()).toBe(true)
    })

    it('returns false when key is missing', async () => {
      delete process.env.GEMINI_API_KEY
      const { isGeminiEmbeddingReady } = await loadService()
      expect(isGeminiEmbeddingReady()).toBe(false)
    })

    it('returns false when disabled', async () => {
      process.env.GEMINI_EMBEDDING_ENABLED = 'false'
      const { isGeminiEmbeddingReady } = await loadService()
      expect(isGeminiEmbeddingReady()).toBe(false)
    })
  })

  describe('embedText', () => {
    it('returns embedding values on success', async () => {
      ;(global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ embedding: { values: [0.1, 0.2, 0.3] } }),
      } as Response)

      const { embedText } = await loadService()
      const vector = await embedText('coconut bud rot treatment')
      expect(vector).toEqual([0.1, 0.2, 0.3])
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('gemini-embedding-001:embedContent'),
        expect.objectContaining({ method: 'POST' }),
      )
    })

    it('throws service unavailable when key is missing', async () => {
      delete process.env.GEMINI_API_KEY
      const { embedText } = await loadService()
      await expect(embedText('test')).rejects.toMatchObject({
        message: expect.stringContaining('GEMINI_API_KEY'),
        status: 503,
      })
    })

    it('throws service unavailable on rate limit', async () => {
      ;(global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
        ok: false,
        status: 429,
        text: async () => 'rate limited',
      } as Response)

      const { embedText } = await loadService()
      await expect(embedText('test')).rejects.toMatchObject({
        message: expect.stringContaining('rate limited'),
        status: 503,
      })
    })

    it('throws service unavailable on API error', async () => {
      ;(global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
        ok: false,
        status: 400,
        text: async () => 'bad request',
      } as Response)

      const { embedText } = await loadService()
      await expect(embedText('test')).rejects.toMatchObject({
        message: expect.stringContaining('400'),
        status: 503,
      })
    })
  })
})
