import {
  Send,
  FileText,
  Sparkles,
  Loader2,
  BookOpen,
  Plus,
  MessageSquare,
  Trash2,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { chatApi, knowledgeApi } from '@/api/services'
import type { ChatMessage, ChatConversation, KnowledgeArticle } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog'

const ACTIVE_CHAT_KEY = 'coco_active_chat'

/** Keep in sync with backend/data/rag-suggested-questions.json */
const suggestedQuestions = [
  'How to treat bud rot disease?',
  'Best fertilizer for adult coconut trees?',
  'How much dolomite for a 1-year seedling?',
  'How to prevent red weevil damage?',
  'How to control black beetle?',
  'How to prevent caterpillar attacks?',
]

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function formatConversationTime(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const sameDay = d.toDateString() === now.toDateString()
  if (sameDay) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function parseSourceTitle(content: string): { body: string; sourceTitle: string | null } {
  const sourceIdx = content.lastIndexOf('\n\nSource:')
  if (sourceIdx === -1) return { body: content, sourceTitle: null }
  const body = content.slice(0, sourceIdx)
  const sourceLine = content.slice(sourceIdx + 2).trim()
  const title = sourceLine.replace(/^Source:\s*/i, '').trim()
  return { body, sourceTitle: title || null }
}

function MessageContent({
  content,
  role,
  onOpenSource,
}: {
  content: string
  role: 'user' | 'assistant'
  onOpenSource?: (title: string) => void
}) {
  if (role === 'user') {
    return <div className="whitespace-pre-wrap">{content}</div>
  }

  const { body, sourceTitle } = parseSourceTitle(content)
  if (!sourceTitle) {
    return <div className="whitespace-pre-wrap">{content}</div>
  }

  return (
    <div>
      <div className="whitespace-pre-wrap">{body}</div>
      <div className="mt-2 pt-2 border-t border-gray-200 flex flex-wrap items-center gap-2">
        <span className="text-xs text-gray-500">Source:</span>
        <button
          type="button"
          onClick={() => onOpenSource?.(sourceTitle)}
          className="inline-flex items-center gap-1 text-xs font-medium text-[#2d5f2e] underline underline-offset-2 hover:text-[#1a2e1a] cursor-pointer"
        >
          <BookOpen className="w-3.5 h-3.5" />
          {sourceTitle}
        </button>
        <span className="text-xs text-gray-400">· Read full article</span>
      </div>
    </div>
  )
}

export function AIChatbot() {
  const queryClient = useQueryClient()
  const [activeId, setActiveId] = useState<string | null>(() =>
    localStorage.getItem(ACTIVE_CHAT_KEY),
  )
  const activeIdRef = useRef<string | null>(activeId)
  const [input, setInput] = useState('')
  const [sendError, setSendError] = useState('')
  const [articleOpen, setArticleOpen] = useState(false)
  const [articleTitle, setArticleTitle] = useState<string | null>(null)
  const [article, setArticle] = useState<KnowledgeArticle | null>(null)
  const [articleLoading, setArticleLoading] = useState(false)
  const [articleError, setArticleError] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const prunedOnMount = useRef(false)

  const {
    data: conversations = [],
    isLoading: conversationsLoading,
  } = useQuery({
    queryKey: ['chat', 'conversations'],
    queryFn: chatApi.listConversations,
  })

  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['chat', 'messages', activeId],
    queryFn: () => chatApi.getMessages(activeId!),
    enabled: !!activeId,
  })

  const userMessageCount = messages.filter((m) => m.role === 'user').length

  /** Gemini-style: drop drafts with no user messages when leaving them. Never delete the active draft (use ref — React state lags). */
  const discardEmptyDraft = async (conversationId: string) => {
    if (conversationId === activeIdRef.current) return

    let msgs = queryClient.getQueryData<ChatMessage[]>(['chat', 'messages', conversationId])
    if (!msgs) {
      try {
        msgs = await chatApi.getMessages(conversationId)
      } catch {
        return
      }
    }
    if (msgs.some((m) => m.role === 'user')) return

    try {
      await chatApi.deleteConversation(conversationId)
    } catch {
      // Already gone or network error — still remove from UI
    }

    queryClient.setQueryData<ChatConversation[]>(['chat', 'conversations'], (old) =>
      (old ?? []).filter((c) => c.id !== conversationId),
    )
    queryClient.removeQueries({ queryKey: ['chat', 'messages', conversationId] })
  }

  const openConversation = (id: string) => {
    activeIdRef.current = id
    setActiveId(id)
    localStorage.setItem(ACTIVE_CHAT_KEY, id)
    setSendError('')
    setInput('')
  }

  const selectConversation = async (id: string) => {
    if (id === activeIdRef.current) return
    const leavingId = activeIdRef.current
    openConversation(id)
    if (leavingId) {
      await discardEmptyDraft(leavingId)
    }
  }

  const [creating, setCreating] = useState(false)

  const startNewConversation = async () => {
    if (creating) return

    // Already on an empty draft — keep it open (Gemini stays on blank chat)
    if (activeId && userMessageCount === 0 && !messagesLoading) {
      setInput('')
      setSendError('')
      return
    }

    setCreating(true)
    setSendError('')
    try {
      const leavingId = activeIdRef.current
      const conversation = await chatApi.createConversation()

      // Protect new draft BEFORE cache update so prune/discard cannot race-delete it
      activeIdRef.current = conversation.id

      const msgs = await chatApi.getMessages(conversation.id)
      queryClient.setQueryData(['chat', 'messages', conversation.id], msgs)
      queryClient.setQueryData<ChatConversation[]>(['chat', 'conversations'], (old) => {
        const list = old ?? []
        return [conversation, ...list.filter((c) => c.id !== conversation.id)]
      })

      openConversation(conversation.id)

      if (leavingId && leavingId !== conversation.id) {
        await discardEmptyDraft(leavingId)
      }
    } catch {
      setSendError('Could not start a new conversation. Please try again.')
    } finally {
      setCreating(false)
    }
  }

  useEffect(() => {
    if (conversationsLoading || conversations.length === 0) return
    const exists = activeIdRef.current && conversations.some((c) => c.id === activeIdRef.current)
    if (!exists) {
      openConversation(conversations[0].id)
    }
  }, [conversations, conversationsLoading, activeId])

  // One-time prune of leftover empty drafts on load (never the active draft)
  useEffect(() => {
    if (conversationsLoading || conversations.length === 0 || prunedOnMount.current) return
    prunedOnMount.current = true

    const prune = async () => {
      const drafts = conversations.filter(
        (c) => c.title === 'New conversation' && c.id !== activeIdRef.current,
      )
      for (const draft of drafts) {
        await discardEmptyDraft(draft.id)
      }
    }

    void prune()
  }, [conversationsLoading, conversations])

  const deleteMutation = useMutation({
    mutationFn: chatApi.deleteConversation,
    onSuccess: (_data, deletedId) => {
      queryClient.setQueryData<ChatConversation[]>(['chat', 'conversations'], (old) =>
        (old ?? []).filter((c) => c.id !== deletedId),
      )
      queryClient.removeQueries({ queryKey: ['chat', 'messages', deletedId] })
      if (activeId === deletedId) {
        localStorage.removeItem(ACTIVE_CHAT_KEY)
        setActiveId(null)
      }
    },
  })

  const sendMutation = useMutation({
    mutationFn: ({ conversationId, message }: { conversationId: string; message: string }) =>
      chatApi.send(conversationId, message),
    onSuccess: () => {
      setSendError('')
      queryClient.invalidateQueries({ queryKey: ['chat', 'messages', activeId] })
      queryClient.invalidateQueries({ queryKey: ['chat', 'conversations'] })
    },
    onError: (err: unknown) => {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined
      setSendError(
        message ??
          'Knowledge assistant is temporarily unavailable. Ensure the backend BERT model is loaded and try again.',
      )
    },
  })

  const sendMessage = async (message: string) => {
    const trimmed = message.trim()
    if (!trimmed || sendMutation.isPending || !activeId) return
    setSendError('')
    await sendMutation.mutateAsync({ conversationId: activeId, message: trimmed })
  }

  const handleSend = async () => {
    const message = input.trim()
    if (!message) return
    setInput('')
    await sendMessage(message)
  }

  const openSourceArticle = async (title: string) => {
    setArticleTitle(title)
    setArticleOpen(true)
    setArticle(null)
    setArticleError('')
    setArticleLoading(true)
    try {
      const data = await knowledgeApi.getByTitle(title)
      setArticle(data)
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined
      setArticleError(message ?? 'Could not load the full article.')
    } finally {
      setArticleLoading(false)
    }
  }

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages.length, sendMutation.isPending])

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-4">
      {/* Conversation sidebar */}
      <aside className="w-64 shrink-0 bg-white rounded-2xl border border-green-100 shadow-sm flex flex-col overflow-hidden">
        <div className="p-3 border-b border-green-100">
          <button
            type="button"
            onClick={() => startNewConversation()}
            disabled={creating}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-[#2d5f2e] text-white rounded-xl text-sm font-medium hover:bg-[#1a2e1a] disabled:opacity-50"
          >
            {creating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            New conversation
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversationsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-[#2d5f2e]" />
            </div>
          ) : (
            conversations.map((c) => {
              const isActive = c.id === activeId
              return (
                <div
                  key={c.id}
                  className={`group flex items-start gap-2 rounded-xl px-2 py-2 cursor-pointer transition-colors ${
                    isActive ? 'bg-green-50 border border-green-200' : 'hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => selectConversation(c.id)}
                    className="flex-1 min-w-0 text-left"
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#2d5f2e]' : 'text-gray-400'}`} />
                      <span className={`text-sm truncate ${isActive ? 'text-[#1a2e1a] font-medium' : 'text-gray-700'}`}>
                        {c.title}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 pl-5">{formatConversationTime(c.updatedAt)}</div>
                  </button>
                  <button
                    type="button"
                    title="Delete conversation"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (window.confirm('Delete this conversation?')) {
                        deleteMutation.mutate(c.id)
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )
            })
          )}
        </div>
      </aside>

      {/* Main chat */}
      <div className="flex-1 min-w-0 bg-white rounded-2xl shadow-sm border border-green-100 h-full flex flex-col">
        <div className="border-b border-green-100 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#2d5f2e] to-[#1a2e1a] rounded-full flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl text-[#1a2e1a]">AI Farming Assistant</h1>
              <div className="flex items-center gap-2 text-sm text-green-600">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Connected to CRI knowledge base · uses conversation context
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg shrink-0">
              <FileText className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-900">RAG Knowledge Base</span>
            </div>
          </div>
        </div>

        {sendError && (
          <div className="mx-6 mt-4 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
            {sendError}
          </div>
        )}

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
          {!activeId || messagesLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#2d5f2e]" />
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] ${message.role === 'user' ? 'bg-[#2d5f2e] text-white' : 'bg-gray-100 text-gray-900'} rounded-2xl px-4 py-3`}>
                  <MessageContent
                    content={message.content}
                    role={message.role}
                    onOpenSource={openSourceArticle}
                  />
                  <div className={`text-xs mt-1 ${message.role === 'user' ? 'text-green-100' : 'text-gray-500'}`}>
                    {formatTime(message.createdAt)}
                  </div>
                </div>
              </div>
            ))
          )}

          {sendMutation.isPending && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl px-4 py-3 flex items-center gap-2 text-sm text-gray-600">
                <Loader2 className="w-4 h-4 animate-spin text-[#2d5f2e]" />
                Searching knowledge base with conversation context…
              </div>
            </div>
          )}
        </div>

        {activeId && userMessageCount === 0 && !messagesLoading && (
          <div className="px-6 pb-4">
            <div className="bg-gradient-to-br from-green-50 to-yellow-50 rounded-xl p-4">
              <h3 className="text-sm text-gray-900 mb-3">Suggested Questions:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {suggestedQuestions.map((question) => (
                  <button
                    key={question}
                    type="button"
                    disabled={sendMutation.isPending}
                    onClick={() => sendMessage(question)}
                    className="text-left px-3 py-2 bg-white rounded-lg text-sm text-gray-700 hover:bg-green-50 hover:text-[#2d5f2e] border border-green-100 disabled:opacity-50"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="border-t border-green-100 p-4">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask in English — follow-ups use this conversation’s context..."
              disabled={!activeId}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d5f2e] bg-gray-50 disabled:opacity-50"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!input.trim() || sendMutation.isPending || !activeId}
              className="p-3 bg-[#2d5f2e] text-white rounded-lg hover:bg-[#1a2e1a] disabled:bg-gray-300"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <Dialog
        open={articleOpen}
        onOpenChange={(open) => {
          setArticleOpen(open)
          if (!open) {
            setArticle(null)
            setArticleTitle(null)
            setArticleError('')
          }
        }}
      >
        <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col gap-0 p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-3 border-b border-green-100 shrink-0">
            <DialogTitle className="text-[#1a2e1a] pr-8">
              {article?.title ?? articleTitle ?? 'CRI Article'}
            </DialogTitle>
            <DialogDescription>
              {article?.source
                ? `${article.source} · Full advisory from the knowledge base`
                : 'Full advisory from the CRI knowledge base'}
            </DialogDescription>
            {article?.sourceUrl && (
              <a
                href={article.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[#2d5f2e] underline underline-offset-2 hover:text-[#1a2e1a]"
              >
                Open official CRI PDF
              </a>
            )}
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0 max-h-[70vh]">
            {articleLoading && (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#2d5f2e]" />
              </div>
            )}
            {articleError && (
              <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
                {articleError}
              </div>
            )}
            {article && !articleLoading && (
              <div className="whitespace-pre-wrap text-sm text-gray-800 leading-relaxed">
                {article.content || 'No content available for this document.'}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
