# CRI Knowledge Base

## Mock data (development)

Committed placeholder manuals live in `mock/`. They are loaded automatically by `npm run db:seed` when the knowledge tables are empty.

## Real data (production)

When you have verified CRI manuals:

1. Add `.md` files to this folder (`cri-manuals/`) or a `production/` subfolder
2. Optionally clear existing knowledge: `npm run rag:clear`
3. Ingest: `npm run rag:ingest`

Re-running ingest skips documents that already exist (matched by title).

## Environment

Set `KNOWLEDGE_DATA_DIR` in `backend/.env` (default: `./data/cri-manuals`).
