import {
  ArrowLeft,
  ClipboardList,
  Loader2,
  Sparkles,
  TreePine,
  AlertCircle,
  UserRound,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { motion } from 'motion/react'
import { useQuery } from '@tanstack/react-query'
import { farmApi, diagnosisApi } from '@/api/services'
import type { DiagnosisResult } from '@/types'
import { FarmSelector } from '@/app/diagnosis/FarmSelector'
import { StemDiagnosisResultBody } from '@/app/diagnosis/StemDiagnosisResultDialog'
import {
  EMPTY_STEM_QUESTIONNAIRE,
  STEM_DAMAGE_LOCATION_OPTIONS,
  STEM_SYMPTOM_GROUPS,
  getStemMatchLevelLabel,
  getStemQuestionnaireMissing,
  isStemQuestionnaireReady,
  questionnaireToStemSymptomsPayload,
  scoreStemQuestionnaireLocal,
  type StemQuestionnaireState,
} from '@/app/diagnosis/stemSymptomQuestionnaire'

function ChoiceButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
        active
          ? 'bg-[#2d5f2e] text-white'
          : 'bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50'
      }`}
    >
      {children}
    </button>
  )
}

export function StemDiseaseDiagnosis() {
  const [farmId, setFarmId] = useState('')
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<DiagnosisResult | null>(null)
  const [error, setError] = useState('')
  const [questionnaire, setQuestionnaire] = useState<StemQuestionnaireState>(EMPTY_STEM_QUESTIONNAIRE)
  const resultSectionRef = useRef<HTMLDivElement>(null)

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['farmer', 'profile'],
    queryFn: farmApi.profile,
  })

  const farms = profile?.farms ?? []

  useEffect(() => {
    if (farms.length > 0) {
      setFarmId(farms[0].id)
    }
  }, [farms])

  useEffect(() => {
    if (result && !scanning) {
      resultSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [result, scanning])

  const toggleSymptom = (id: string) => {
    setQuestionnaire((prev) => ({
      ...prev,
      selectedSymptoms: prev.selectedSymptoms.includes(id)
        ? prev.selectedSymptoms.filter((s) => s !== id)
        : [...prev.selectedSymptoms, id],
    }))
  }

  const handleApplyAnswers = async () => {
    if (!farmId) {
      setError('Add a farm in your profile before submitting diagnosis.')
      return
    }

    const missing = getStemQuestionnaireMissing(questionnaire)
    if (missing.length > 0) {
      setError(`Please complete: ${missing.join('; ')}.`)
      return
    }

    setScanning(true)
    setError('')

    const symptoms = questionnaireToStemSymptomsPayload(questionnaire)
    // Score with the form percentage weights immediately so results always show.
    const scored = scoreStemQuestionnaireLocal(symptoms)
    const localResult: DiagnosisResult = {
      id: `local-stem-${Date.now()}`,
      category: 'stem',
      imageResult: 'Symptom questionnaire only',
      symptomResult: scored.finalResult,
      finalResult: scored.finalResult,
      confidence: scored.confidence,
      status: 'pending',
      advice: `${getStemMatchLevelLabel(scored.matchLevel, scored.symptomMatch)}. Most likely condition: ${scored.finalResult}. Symptom match: ${Math.round(scored.symptomMatch)}%. Contact a coconut cultivation officer for confirmation.`,
      predictions: scored.predictions,
      matchLevel: scored.matchLevel,
      secondaryConditions: scored.secondaryConditions,
      officerAlert: scored.officerAlert,
      symptomMatch: scored.symptomMatch,
      symptomMatches: scored.symptomMatches,
    }
    setResult(localResult)

    try {
      const diagnosis = await diagnosisApi.submit({
        farmId,
        category: 'stem',
        symptoms,
      })
      setResult({
        ...diagnosis,
        // Prefer API fields, but keep local weighted scores if API omits them.
        symptomMatch: diagnosis.symptomMatch ?? scored.symptomMatch,
        symptomMatches: diagnosis.symptomMatches ?? scored.symptomMatches,
        predictions: diagnosis.predictions?.length ? diagnosis.predictions : scored.predictions,
        matchLevel: diagnosis.matchLevel ?? scored.matchLevel,
        officerAlert: diagnosis.officerAlert ?? scored.officerAlert,
      })
    } catch (err) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data
        ?.message
      // Local weighted result already shown; keep a soft save warning.
      setError(
        message
          ? `Result calculated from your symptom percentages. Could not save to server: ${message}`
          : 'Result calculated from your symptom percentages. Could not save the report to the server.',
      )
    } finally {
      setScanning(false)
    }
  }

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#2d5f2e]" />
      </div>
    )
  }

  if (farms.length === 0) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center shadow-sm">
        <h2 className="mb-2 text-lg font-semibold text-amber-900">No farm registered</h2>
        <p className="mb-4 text-sm text-amber-800">
          Add a farm in your profile to save diagnosis reports.
        </p>
        <Link
          to="/app/profile"
          className="inline-flex rounded-lg bg-[#2d5f2e] px-4 py-2 text-sm text-white hover:bg-[#1a2e1a]"
        >
          Go to Profile
        </Link>
      </div>
    )
  }

  const showOfficerCard =
    result &&
    !scanning &&
    (result.matchLevel === 'moderate' ||
      result.matchLevel === 'low' ||
      result.matchLevel === 'uncertain' ||
      Boolean(result.officerAlert))

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Link
          to="/app/disease-detection"
          className="mb-5 inline-flex items-center gap-2 rounded-full border border-green-100 bg-white px-3 py-1.5 text-sm font-medium text-[#2d5f2e] shadow-sm transition-colors hover:border-green-200 hover:bg-green-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to categories
        </Link>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1a2e1a] to-[#2d5f2e] px-6 py-5 text-white shadow-lg">
          <div className="pointer-events-none absolute -right-4 -top-4 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex flex-wrap items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
              <TreePine className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-emerald-200">
                Symptom questionnaire
              </p>
              <h1 className="text-2xl font-bold sm:text-3xl">Coconut Stem & Trunk</h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-green-100">
                Answer the guided symptom form to identify the most likely trunk condition. Results
                appear at the end of the form after you apply your answers.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <FarmSelector
        farms={farms}
        selectedFarmId={farmId}
        onSelect={(id) => {
          setFarmId(id)
          setResult(null)
        }}
      />

      {error ? (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      ) : null}

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 shadow-sm sm:p-6"
      >
        <div className="mb-5 flex items-start gap-3">
          <div className="mt-0.5 rounded-lg bg-amber-100 p-2 text-amber-700">
            <ClipboardList className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-amber-900">
              COCO CARE – Stem and Trunk Diagnosis Form
            </h3>
            <p className="mt-1 text-sm text-amber-800">
              Answer the questions below about what you see on the stem or trunk. Your answers help
              identify the most likely condition.
            </p>
            <p className="mt-2 text-xs text-amber-700/90">
              Results are guidance only and should be verified by an agriculture officer before
              treatment decisions.
            </p>
          </div>
        </div>

        <section className="mb-6">
          <h4 className="mb-2 text-sm font-bold uppercase tracking-wide text-[#1a2e1a]">
            Step 1 — Where is the damage?
          </h4>
          <p className="mb-3 text-xs text-gray-600">Allow one selection.</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {STEM_DAMAGE_LOCATION_OPTIONS.map((option) => {
              const active = questionnaire.damageLocation === option.id
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() =>
                    setQuestionnaire((prev) => ({ ...prev, damageLocation: option.id }))
                  }
                  className={`rounded-xl border px-4 py-3 text-left transition-colors ${
                    active
                      ? 'border-[#2d5f2e] bg-[#2d5f2e] text-white'
                      : 'border-amber-100 bg-white text-gray-800 hover:border-amber-200'
                  }`}
                >
                  <div className="text-sm font-semibold">{option.label}</div>
                </button>
              )
            })}
          </div>
        </section>

        <section className="mb-6">
          <h4 className="mb-2 text-sm font-bold uppercase tracking-wide text-[#1a2e1a]">
            Step 2 — Select all visible symptoms
          </h4>
          <div className="space-y-4">
            {STEM_SYMPTOM_GROUPS.map((group) => (
              <div
                key={group.title}
                className="rounded-xl border border-amber-100 bg-white/90 p-4"
              >
                <h5 className="text-sm font-semibold text-[#1a2e1a]">{group.title}</h5>
                {group.note ? (
                  <p className="mt-1 text-xs text-gray-500">{group.note}</p>
                ) : null}
                <div className="mt-3 flex flex-wrap gap-2">
                  {group.symptoms.map((symptom) => {
                    const selected = questionnaire.selectedSymptoms.includes(symptom.id)
                    return (
                      <button
                        key={symptom.id}
                        type="button"
                        onClick={() => toggleSymptom(symptom.id)}
                        className={`rounded-full px-3 py-1.5 text-left text-xs transition-colors ${
                          selected
                            ? 'bg-[#2d5f2e] text-white'
                            : 'bg-gray-50 text-gray-700 ring-1 ring-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        <span className="font-medium">{symptom.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-5">
          <h4 className="mb-2 text-sm font-bold uppercase tracking-wide text-[#1a2e1a]">
            Step 3 — Additional questions
          </h4>
          <p className="mb-3 text-xs text-gray-600">
            These questions help distinguish similar conditions.
          </p>
          <div className="space-y-3">
            <div className="rounded-xl border border-amber-100 bg-white px-4 py-3">
              <p className="mb-2 text-sm text-gray-800">What is coming from the trunk?</p>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ['reddish', 'Reddish-brown liquid'],
                    ['black', 'Black dried liquid or stain'],
                    ['fibres', 'Liquid mixed with chewed fibres'],
                    ['nothing', 'Nothing'],
                    ['unsure', 'Not sure'],
                  ] as const
                ).map(([id, label]) => (
                  <ChoiceButton
                    key={id}
                    active={questionnaire.qDischarge === id}
                    onClick={() => setQuestionnaire((p) => ({ ...p, qDischarge: id }))}
                  >
                    {label}
                  </ChoiceButton>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-amber-100 bg-white px-4 py-3">
              <p className="mb-2 text-sm text-gray-800">What type of opening is present?</p>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ['vertical_crack', 'Natural-looking vertical crack'],
                    ['round_hole', 'Round insect hole'],
                    ['tool_wound', 'Clean cutting or tool wound'],
                    ['soil_rot', 'Rotten opening near the soil'],
                    ['none', 'No opening'],
                  ] as const
                ).map(([id, label]) => (
                  <ChoiceButton
                    key={id}
                    active={questionnaire.qOpening === id}
                    onClick={() => setQuestionnaire((p) => ({ ...p, qOpening: id }))}
                  >
                    {label}
                  </ChoiceButton>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleApplyAnswers}
            disabled={scanning}
            className="inline-flex items-center gap-2 rounded-xl bg-[#2d5f2e] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1a2e1a] disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {scanning ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Calculating percentages…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Apply answers
              </>
            )}
          </button>
          <p className="text-sm text-amber-900/80">
            Symptoms selected:{' '}
            <span className="font-semibold">{questionnaire.selectedSymptoms.length}</span>
            {!isStemQuestionnaireReady(questionnaire) ? (
              <span className="ml-2 text-amber-700">
                · Still need: {getStemQuestionnaireMissing(questionnaire).join(', ')}
              </span>
            ) : (
              <span className="ml-2 text-emerald-700">· Ready to calculate</span>
            )}
          </p>
        </div>
        <p className="mt-3 text-xs text-amber-800">
          Results use your selected symptom percentage weights (capped at 100% per condition, then
          ranked to total 100%). Never treat this as a confirmed disease until an agriculture officer
          verifies it.
        </p>

        {/* Disease prediction — end of form */}
        {scanning ? (
          <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-green-100 bg-white px-5 py-10 text-center">
            <Loader2 className="mb-3 h-8 w-8 animate-spin text-[#2d5f2e]" />
            <p className="text-sm font-medium text-gray-800">Analyzing symptoms…</p>
            <p className="mt-1 text-xs text-gray-500">Preparing disease prediction results</p>
          </div>
        ) : null}

        {result && !scanning ? (
          <div
            ref={resultSectionRef}
            className="mt-6 scroll-mt-6 rounded-2xl border border-green-200 bg-white p-5 shadow-sm"
          >
            <div className="mb-4">
              <h4 className="text-lg font-semibold text-[#1a2e1a]">Disease Predictions</h4>
              <p className="text-sm text-gray-500">
                Results based on your symptom answers at the end of this form
              </p>
            </div>
            <StemDiagnosisResultBody result={result} />
          </div>
        ) : null}
      </motion.div>

      {showOfficerCard ? (
        <div className="rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4">
          <div className="flex items-start gap-3">
            <UserRound className="mt-0.5 h-5 w-5 shrink-0 text-orange-700" />
            <div>
              <h4 className="text-sm font-semibold text-orange-900">
                {getStemMatchLevelLabel(result?.matchLevel, result?.symptomMatch ?? 0)}
              </h4>
              <p className="mt-1 text-sm text-orange-800">
                Most likely condition:{' '}
                <span className="font-semibold">{result?.finalResult}</span>. Contact a coconut
                cultivation officer for confirmation
                {result?.officerAlert ? `. ${result.officerAlert}` : '.'}
              </p>
              {result?.secondaryConditions?.length ? (
                <p className="mt-2 text-sm text-orange-800">
                  Also consider: {result.secondaryConditions.join('; ')}.
                </p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
