import { AlertTriangle, CheckCircle2, ShieldAlert, UserRound } from 'lucide-react'
import { motion } from 'motion/react'
import type { DiagnosisResult } from '@/types'
import { formatPercentage, toPercentageNumber } from '@/app/diagnosis/formatPercentage'
import { getStemMatchLevelLabel } from '@/app/diagnosis/stemSymptomQuestionnaire'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog'

const BAR_COLORS = [
  'from-emerald-500 to-emerald-600',
  'from-lime-500 to-lime-600',
  'from-sky-500 to-sky-600',
  'from-amber-500 to-amber-600',
  'from-orange-500 to-orange-600',
  'from-stone-500 to-stone-600',
]

function MatchBadge({
  level,
  symptomMatch,
}: {
  level: DiagnosisResult['matchLevel']
  symptomMatch: number
}) {
  const label = getStemMatchLevelLabel(level, symptomMatch)
  const tone =
    level === 'high'
      ? 'bg-emerald-100 text-emerald-800'
      : level === 'moderate'
        ? 'bg-amber-100 text-amber-900'
        : 'bg-orange-100 text-orange-900'

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${tone}`}>
      {label}
    </span>
  )
}

export function StemDiagnosisResultBody({ result }: { result: DiagnosisResult }) {
  const sorted = [...(result.predictions ?? [])].sort((a, b) => b.probability - a.probability)
  const symptomMatch = result.symptomMatch ?? 0
  const rankedTop = sorted[0]

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a2e1a] via-[#2d5f2e] to-[#3d7a3f] px-5 py-5 text-white shadow-inner">
        <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10" />
        <div className="relative">
          <div className="mb-1 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-emerald-200">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Most likely condition
          </div>
          <h3 className="text-2xl font-bold leading-snug">{result.finalResult}</h3>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/15 px-3 py-1 text-sm font-semibold backdrop-blur-sm">
              Symptom match: {Math.round(symptomMatch)}%
            </span>
            {rankedTop ? (
              <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-emerald-100">
                {formatPercentage(rankedTop.probability)}% of ranked diagnosis
              </span>
            ) : null}
          </div>
          <div className="mt-3">
            <MatchBadge level={result.matchLevel} symptomMatch={symptomMatch} />
          </div>
          <p className="mt-3 text-xs text-emerald-100/85">
            Contact a coconut cultivation officer for confirmation. This is not a confirmed disease.
          </p>
        </div>
      </div>

      {result.officerAlert ? (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
          <p>{result.officerAlert}</p>
        </div>
      ) : null}

      {result.matchLevel && result.matchLevel !== 'high' ? (
        <div className="flex items-start gap-3 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-900">
          <UserRound className="mt-0.5 h-5 w-5 shrink-0 text-orange-700" />
          <div>
            <p className="font-semibold">{getStemMatchLevelLabel(result.matchLevel, symptomMatch)}</p>
            <p className="mt-1">
              Please contact your agricultural officer for field verification before treatment.
            </p>
          </div>
        </div>
      ) : null}

      <div>
        <h4 className="mb-2 text-sm font-semibold text-[#1a2e1a]">Ranked conditions</h4>
        <div className="space-y-2.5">
          {sorted
            .filter((prediction) => {
              const match = result.symptomMatches?.[prediction.label] ?? 0
              return match > 0 || prediction.probability > 0
            })
            .map((prediction, index) => {
              const rankedValue = toPercentageNumber(prediction.probability)
              const ranked = formatPercentage(prediction.probability)
              const match = result.symptomMatches?.[prediction.label] ?? 0
              const isTop = prediction.label === result.finalResult

              return (
                <div
                  key={prediction.label}
                  className={`rounded-xl px-3 py-2.5 ${
                    isTop ? 'bg-green-50 ring-1 ring-green-100' : 'bg-gray-50'
                  }`}
                >
                  <div className="mb-1 flex items-center justify-between gap-3">
                    <span
                      className={`text-sm font-medium ${isTop ? 'text-[#1a2e1a]' : 'text-gray-700'}`}
                    >
                      {prediction.label}
                    </span>
                    <span
                      className={`shrink-0 text-sm font-bold tabular-nums ${
                        isTop ? 'text-[#2d5f2e]' : 'text-gray-600'
                      }`}
                    >
                      {ranked}%
                    </span>
                  </div>
                  <div className="mb-2 flex flex-wrap gap-x-3 text-xs text-gray-500">
                    <span>{Math.round(match)}% symptom match</span>
                    <span>{ranked}% ranked</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(rankedValue, 2)}%` }}
                      transition={{ duration: 0.55, delay: index * 0.04 }}
                      className={`h-full rounded-full bg-gradient-to-r ${BAR_COLORS[index % BAR_COLORS.length]}`}
                    />
                  </div>
                </div>
              )
            })}
        </div>
      </div>

      {result.secondaryConditions?.length ? (
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-900">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>Also consider: {result.secondaryConditions.join('; ')}.</p>
        </div>
      ) : null}
    </div>
  )
}

export function StemDiagnosisResultDialog({
  open,
  onOpenChange,
  result,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  result: DiagnosisResult | null
}) {
  if (!result) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Diagnosis result</DialogTitle>
          <DialogDescription>
            Based on your symptom answers. An agriculture officer should verify before treatment.
          </DialogDescription>
        </DialogHeader>
        <StemDiagnosisResultBody result={result} />
        <DialogFooter>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="inline-flex items-center justify-center rounded-xl bg-[#2d5f2e] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1a2e1a]"
          >
            Close and continue
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
