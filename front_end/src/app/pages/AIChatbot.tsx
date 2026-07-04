import { Send, FileText, Sparkles, Loader2, BookOpen } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { chatApi, knowledgeApi } from '@/api/services'
import type { ChatMessage, KnowledgeArticle } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog'

const suggestedQuestions = [
  'How to treat bud rot disease?',
  'Best fertilizer for coconut trees?',
  'How to increase coconut yield?',
  'How to prevent caterpillar attacks?',
  'What is the ideal watering schedule?',
  'Signs of stem bleeding disease?',
]

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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
  const [input, setInput] = useState('')
  const [sendError, setSendError] = useState('')
  const [articleOpen, setArticleOpen] = useState(false)
  const [articleTitle, setArticleTitle] = useState<string | null>(null)
  const [article, setArticle] = useState<KnowledgeArticle | null>(null)
  const [articleLoading, setArticleLoading] = useState(false)
  const [articleError, setArticleError] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  const { data: history = [], isLoading } = useQuery({
    queryKey: ['chat', 'history'],
    queryFn: chatApi.history,
  })

  const sendMutation = useMutation({
    mutationFn: chatApi.send,
    onSuccess: () => {
      setSendError('')
      queryClient.invalidateQueries({ queryKey: ['chat', 'history'] })
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
    if (!trimmed || sendMutation.isPending) return
    setSendError('')
    await sendMutation.mutateAsync(trimmed)
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

  const messages: ChatMessage[] = history

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages.length, sendMutation.isPending])

  return (
    <div className="h-[calc(100vh-8rem)]">
      <div className="bg-white rounded-2xl shadow-sm border border-green-100 h-full flex flex-col">
        <div className="border-b border-green-100 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#2d5f2e] to-[#1a2e1a] rounded-full flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl text-[#1a2e1a]">AI Farming Assistant</h1>
              <div className="flex items-center gap-2 text-sm text-green-600">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Connected to CRI knowledge base
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg">
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
          {isLoading ? (
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
                Searching knowledge base…
              </div>
            </div>
          )}
        </div>

        {messages.length <= 1 && !isLoading && (
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
              placeholder="Ask in English about coconut farming, diseases, or fertilizer..."
              className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d5f2e] bg-gray-50"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!input.trim() || sendMutation.isPending}
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
