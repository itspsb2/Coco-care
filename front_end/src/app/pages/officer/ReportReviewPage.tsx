import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { reportsApi } from '@/api/services'

export function ReportReviewPage() {
  const queryClient = useQueryClient()
  const [comment, setComment] = useState<Record<string, string>>({})

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['officer', 'pending-reports'],
    queryFn: reportsApi.pending,
  })

  const reviewMutation = useMutation({
    mutationFn: ({
      id,
      action,
      reviewComment,
    }: {
      id: string
      action: 'verify' | 'reject'
      reviewComment?: string
    }) => reportsApi.review(id, { action, comment: reviewComment }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['officer', 'pending-reports'] }),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#2d5f2e]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl text-[#1a2e1a] mb-2">Disease Report Review</h1>
        <p className="text-[#6b7c6b]">Verify or reject pending farmer disease reports for outbreak monitoring.</p>
      </div>

      {reports.length === 0 ? (
        <div className="bg-white rounded-2xl border border-green-100 p-12 text-center text-gray-500">
          No pending reports to review.
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-2xl border border-green-100 p-6 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-lg text-gray-900">{report.farmName}</h2>
                  <p className="text-sm text-gray-500">{report.region} · {new Date(report.createdAt).toLocaleDateString()}</p>
                </div>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full capitalize">
                  {report.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
                <div>
                  <div className="text-gray-500">Image result</div>
                  <div className="text-gray-900">{report.imageResult ?? '—'}</div>
                </div>
                <div>
                  <div className="text-gray-500">Symptom result</div>
                  <div className="text-gray-900">{report.symptomResult ?? '—'}</div>
                </div>
                <div>
                  <div className="text-gray-500">Confidence</div>
                  <div className="text-gray-900">{Math.round(report.confidence * 100)}%</div>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm text-gray-600 mb-1">Review comment</label>
                <textarea
                  value={comment[report.id] ?? ''}
                  onChange={(e) => setComment({ ...comment, [report.id]: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  rows={2}
                  placeholder="Optional officer notes..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() =>
                    reviewMutation.mutate({
                      id: report.id,
                      action: 'verify',
                      reviewComment: comment[report.id],
                    })
                  }
                  disabled={reviewMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 bg-[#2d5f2e] text-white rounded-lg hover:bg-[#1a2e1a] text-sm"
                >
                  <CheckCircle className="w-4 h-4" />
                  Verify
                </button>
                <button
                  onClick={() =>
                    reviewMutation.mutate({
                      id: report.id,
                      action: 'reject',
                      reviewComment: comment[report.id],
                    })
                  }
                  disabled={reviewMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 text-sm"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
