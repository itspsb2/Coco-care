import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Info,
  ShieldAlert,
  Trees,
} from 'lucide-react'
import type { DiagnosisResult } from '@/types'
import { formatPercentage } from '@/app/diagnosis/formatPercentage'

function DiffLabel({ value }: { value: string }) {
  const map: Record<string, string> = {
    strong: 'Strong differentiation',
    good: 'Good differentiation',
    some_uncertainty: 'Some uncertainty',
    ambiguous: 'Ambiguous',
  }
  return <span>{map[value] ?? value}</span>
}

function SeverityBadge({ severity }: { severity: string }) {
  const colors: Record<string, string> = {
    mild: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
    moderate: 'bg-amber-50 text-amber-900 ring-amber-200',
    severe: 'bg-orange-50 text-orange-900 ring-orange-200',
    critical: 'bg-red-50 text-red-900 ring-red-200',
  }
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ring-1 ${
        colors[severity] ?? 'bg-gray-50 text-gray-700 ring-gray-200'
      }`}
    >
      {severity}
    </span>
  )
}

export function StemDiagnosisResultPanel({ result }: { result: DiagnosisResult }) {
  const d = result.stemDetail ?? result.budDetail
  if (!d) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
        Diagnosis completed, but detailed report was not returned. Summary: {result.finalResult} (
        {formatPercentage(result.confidence)} match).
      </div>
    )
  }

  const topMatch = d.inconclusive
    ? d.rankings[0]?.matchScore ?? Math.round(result.confidence * 100)
    : d.matchScore

  return (
    <div className="space-y-5">
      <div
        className={`rounded-2xl border p-5 sm:p-6 ${
          d.inconclusive
            ? 'border-amber-200 bg-gradient-to-br from-amber-50 to-white'
            : 'border-green-100 bg-gradient-to-br from-white to-emerald-50/40'
        }`}
      >
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Trees className="h-5 w-5 text-[#2d5f2e]" />
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            {d.typeLabel}
          </span>
        </div>
        <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">{result.finalResult}</h2>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-700">
          <span className="font-semibold text-[#2d5f2e]">
            Symptom match: {topMatch}%
            {!d.inconclusive && (
              <span className="ml-1 font-normal text-gray-500">— {d.matchBandLabel}</span>
            )}
          </span>
          {!d.inconclusive && (
            <>
              <SeverityBadge severity={d.severity} />
              <span className="text-gray-500">
                <DiffLabel value={d.differentiation} />
              </span>
            </>
          )}
        </div>
        {result.officerAlert && (
          <div className="mt-4 flex gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{result.officerAlert}</span>
          </div>
        )}
        {d.rbbCrossCheckRpw && (
          <div className="mt-3 flex gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              Black beetle damage can leave entry points for Red Palm Weevil — also check for holes,
              viscous fluid, crunching sounds, and cocoons.
            </span>
          </div>
        )}
        {d.suggestLeafModule && (
          <div className="mt-3 flex gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-950">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              If damage is mainly on leaflet surfaces rather than the spear or bud, try the{' '}
              <a href="/app/disease-detection/leaves" className="font-semibold underline">
                Leaf diagnosis module
              </a>
              .
            </span>
          </div>
        )}
      </div>

      {d.rankings.length > 0 && (
        <div className="rounded-2xl border border-green-100 bg-white p-5">
          <h3 className="mb-3 text-sm font-semibold text-gray-900">Condition ranking (match scores)</h3>
          <p className="mb-3 text-xs text-gray-500">
            These are expert-rule symptom match scores, not lab probabilities.
          </p>
          <ul className="space-y-2">
            {d.rankings.map((r, i) => (
              <li key={r.code} className="flex items-center gap-3 text-sm">
                <span className="w-5 text-gray-400">{i + 1}.</span>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex justify-between gap-2">
                    <span className="font-medium text-gray-800">{r.name}</span>
                    <span className="tabular-nums text-gray-600">{r.matchScore}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-[#2d5f2e]"
                      style={{ width: `${Math.min(100, r.matchScore)}%` }}
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {d.evidence.length > 0 && (
        <div className="rounded-2xl border border-green-100 bg-white p-5">
          <h3 className="mb-3 text-sm font-semibold text-gray-900">Why COCO CARE predicted this</h3>
          <ul className="space-y-2">
            {d.evidence.map((e) => (
              <li key={e} className="flex gap-2 text-sm text-gray-700">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <span>{e}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Section title="Likely cause" body={d.cause} />
      {d.riskFactors.length > 0 && (
        <BulletSection title="Risk factors" items={d.riskFactors} />
      )}
      <Section title="If it gets worse" body={d.whatHappensIfWorse} />
      <Section title="What you should do now" body={d.whatToDoNow} highlight />
      {d.prevention.length > 0 && <BulletSection title="Prevention" items={d.prevention} />}
      {d.management.length > 0 && <BulletSection title="Management" items={d.management} />}

      {result.secondaryConditions && result.secondaryConditions.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 text-sm text-gray-700">
          <h3 className="mb-2 font-semibold text-gray-900">Also consider</h3>
          <ul className="list-inside list-disc space-y-1">
            {result.secondaryConditions.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-xs text-gray-600">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <p>{d.disclaimer}</p>
      </div>
    </div>
  )
}

function Section({
  title,
  body,
  highlight,
}: {
  title: string
  body: string
  highlight?: boolean
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        highlight ? 'border-[#2d5f2e]/30 bg-emerald-50/50' : 'border-green-100 bg-white'
      }`}
    >
      <h3 className="mb-2 text-sm font-semibold text-gray-900">{title}</h3>
      <p className="text-sm leading-relaxed text-gray-700">{body}</p>
    </div>
  )
}

function BulletSection({ title, items }: { title: string; items: string[] }) {
  return (
    <details className="group rounded-2xl border border-green-100 bg-white p-5 open:shadow-sm">
      <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-gray-900">
        {title}
        <ChevronDown className="h-4 w-4 text-gray-400 transition group-open:rotate-180" />
      </summary>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-sm text-gray-700">
            <span className="text-emerald-600">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </details>
  )
}
