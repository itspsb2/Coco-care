-- Migration 009: Enable pgvector and migrate knowledge_chunks.embedding
-- Requires: pgvector/pgvector:pg16 Docker image (or pgvector extension installed on server)
-- Safe to run on both fresh installs and existing databases.

-- 1. Enable the pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Convert existing JSONB embeddings to native vector(768) type.
--    On a fresh install the table is empty so this is instant.
--    On existing data it re-casts the JSONB array text to a proper vector.
ALTER TABLE knowledge_chunks
  ALTER COLUMN embedding TYPE vector(768)
  USING (embedding::text::vector(768));

-- 3. Build HNSW index for fast approximate cosine nearest-neighbour search.
--    m=16 / ef_construction=64 are standard balanced defaults.
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_embedding_hnsw
  ON knowledge_chunks
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);
