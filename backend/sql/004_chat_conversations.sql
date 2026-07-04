-- Multi-conversation chat threads
CREATE TABLE IF NOT EXISTS chat_conversations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       VARCHAR(200) NOT NULL DEFAULT 'New conversation',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE chat_messages
  ADD COLUMN IF NOT EXISTS conversation_id UUID REFERENCES chat_conversations(id) ON DELETE CASCADE;

-- Backfill: one conversation per user that has messages without a conversation
INSERT INTO chat_conversations (user_id, title, created_at, updated_at)
SELECT
  cm.user_id,
  COALESCE(
    (
      SELECT LEFT(cm2.content, 60)
      FROM chat_messages cm2
      WHERE cm2.user_id = cm.user_id AND cm2.role = 'user'
      ORDER BY cm2.created_at ASC
      LIMIT 1
    ),
    'Previous chat'
  ),
  MIN(cm.created_at),
  MAX(cm.created_at)
FROM chat_messages cm
WHERE cm.conversation_id IS NULL
GROUP BY cm.user_id;

UPDATE chat_messages m
SET conversation_id = c.id
FROM chat_conversations c
WHERE m.user_id = c.user_id
  AND m.conversation_id IS NULL
  AND c.id = (
    SELECT c2.id
    FROM chat_conversations c2
    WHERE c2.user_id = m.user_id
    ORDER BY c2.created_at ASC
    LIMIT 1
  );

-- Orphan messages should not remain (safety: delete if any still null)
DELETE FROM chat_messages WHERE conversation_id IS NULL;

ALTER TABLE chat_messages
  ALTER COLUMN conversation_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_id ON chat_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON chat_messages(conversation_id);
