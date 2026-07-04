import type { DiseaseReport } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog'

export function ReportDetailDialog({
  report,
  open,
  onOpenChange,
  actions,
}: {
  report: DiseaseReport | null
  open: boolean
  onOpenChange: (open: boolean) => void
  actions?: React.ReactNode
}) {
  if (!report) return null

  const activeSymptoms = report.symptoms
    ? Object.entries(report.symptoms)
        .filter(([, value]) => value === true || (typeof value === 'string' && value.length > 0))
        .map(([key, value]) =>
          typeof value === 'boolean'
            ? key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase())
            : `${key}: ${value}`,
        )
    : []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{report.finalResult ?? 'Disease report'}</DialogTitle>
          <DialogDescription>
            Full report details for {report.farmName} ({report.region})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={report.status} />
            <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
              Confidence {Math.round(report.confidence * 100)}%
            </span>
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <DetailField label="Farm" value={report.farmName} />
            <DetailField label="Region" value={report.region} />
            <DetailField label="Final result" value={report.finalResult} />
            <DetailField label="Image result" value={report.imageResult} />
            <DetailField label="Symptom result" value={report.symptomResult} />
            <DetailField label="Submitted" value={new Date(report.createdAt).toLocaleString()} />
            <DetailField label="Report ID" value={report.id} />
            <DetailField label="Farm ID" value={report.farmId} />
          </dl>

          {activeSymptoms.length > 0 && (
            <div>
              <div className="text-gray-500 mb-1.5">Reported symptoms</div>
              <ul className="flex flex-wrap gap-2">
                {activeSymptoms.map((symptom) => (
                  <li
                    key={symptom}
                    className="px-2.5 py-1 rounded-lg bg-green-50 text-green-900 border border-green-100 text-xs"
                  >
                    {symptom}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {report.advice && (
            <div>
              <div className="text-gray-500 mb-1.5">Advice</div>
              <p className="text-gray-900 bg-amber-50 border border-amber-100 rounded-xl p-3 leading-relaxed">
                {report.advice}
              </p>
            </div>
          )}

          {report.reviewComment && (
            <div>
              <div className="text-gray-500 mb-1.5">Review comment</div>
              <p className="text-gray-900 bg-gray-50 border border-gray-100 rounded-xl p-3 leading-relaxed">
                {report.reviewComment}
              </p>
            </div>
          )}

          {report.imageUrl && (
            <div>
              <div className="text-gray-500 mb-1.5">Attached image</div>
              {report.imageUrl.startsWith('data:') || report.imageUrl.startsWith('http') ? (
                <img
                  src={report.imageUrl}
                  alt="Report attachment"
                  className="max-h-56 rounded-xl border border-green-100 object-contain bg-gray-50"
                />
              ) : (
                <p className="text-gray-700 break-all">{report.imageUrl}</p>
              )}
            </div>
          )}

          {actions}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function DetailField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-xl border border-green-100 bg-green-50/40 px-3 py-2">
      <dt className="text-xs text-gray-500 mb-0.5">{label}</dt>
      <dd className="text-gray-900 break-words">{value?.trim() ? value : '—'}</dd>
    </div>
  )
}

function StatusBadge({ status }: { status: DiseaseReport['status'] }) {
  const styles =
    status === 'verified'
      ? 'bg-green-100 text-green-800'
      : status === 'pending'
        ? 'bg-amber-100 text-amber-800'
        : 'bg-gray-100 text-gray-700'

  return (
    <span className={`px-2 py-1 rounded-full text-xs capitalize ${styles}`}>{status}</span>
  )
}
