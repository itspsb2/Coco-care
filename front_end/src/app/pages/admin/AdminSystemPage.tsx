import { useQuery } from '@tanstack/react-query'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { adminApi } from '@/api/services'

export function AdminSystemPage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['admin', 'health'],
    queryFn: adminApi.health,
    refetchInterval: 30_000,
  })

  const errorMessage = getErrorMessage(error)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl text-[#1a2e1a] mb-2">System Health</h1>
          <p className="text-[#6b7c6b]">Read-only status of core platform services.</p>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          className="px-4 py-2 rounded-xl border border-green-100 bg-white text-sm hover:bg-green-50"
        >
          {isFetching ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800 shadow-sm">
          <h2 className="font-semibold">Could not load system health</h2>
          <p className="mt-1 text-sm">{errorMessage}</p>
        </div>
      ) : isLoading || !data ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-[#2d5f2e]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <HealthCard label="Database" ok={data.database} detail={data.database ? 'Connected' : 'Unavailable'} />
          <HealthCard label="Gemini embeddings" ok={data.geminiEmbedding} detail={data.geminiEmbedding ? 'Ready' : 'Not configured'} />
          <HealthCard label="Groq LLM" ok={data.groq} detail={data.groq ? 'Configured' : 'Not configured'} />
          <HealthCard
            label="Knowledge documents"
            ok={data.knowledgeDocuments > 0}
            detail={`${data.knowledgeDocuments ?? 0} documents`}
          />
          <HealthCard
            label="Knowledge chunks"
            ok={data.knowledgeChunks > 0}
            detail={`${data.knowledgeChunks ?? 0} chunks`}
          />
        </div>
      )}
    </div>
  )
}

function getErrorMessage(error: unknown) {
  const axiosError = error as { response?: { data?: { message?: string } }; message?: string }
  return axiosError.response?.data?.message ?? axiosError.message ?? 'Unable to load system health.'
}

function HealthCard({
  label,
  ok,
  detail,
}: {
  label: string
  ok: boolean
  detail: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-green-100 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-gray-800">{label}</h2>
        {ok ? (
          <CheckCircle2 className="w-5 h-5 text-green-600" />
        ) : (
          <XCircle className="w-5 h-5 text-amber-600" />
        )}
      </div>
      <p className={`text-lg ${ok ? 'text-green-800' : 'text-amber-800'}`}>{detail}</p>
    </div>
  )
}
