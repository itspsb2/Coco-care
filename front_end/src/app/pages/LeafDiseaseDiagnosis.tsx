import { ArrowLeft, Camera, ImageIcon, Leaf, Loader2, Sparkles, Upload, AlertCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { motion } from 'motion/react'
import { useQuery } from '@tanstack/react-query'
import { farmApi, diagnosisApi } from '@/api/services'
import type { DiagnosisResult } from '@/types'
import { LeafPredictionPanel } from '@/app/diagnosis/LeafPredictionPanel'
import { LeafDiseaseDetailCard } from '@/app/diagnosis/LeafDiseaseDetailCard'
import { LEAF_PANEL_BASE } from '@/app/diagnosis/panelLayout'
import { compressImageForUpload } from '@/utils/compressImage'

export function LeafDiseaseDiagnosis() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [farmId, setFarmId] = useState('')
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<DiagnosisResult | null>(null)
  const [error, setError] = useState('')

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setError('')
      const compressed = await compressImageForUpload(file)
      setUploadedImage(compressed)
      setResult(null)
    } catch {
      setError('Could not process that image. Try a different photo.')
    }

    e.target.value = ''
  }

  const handleScan = async () => {
    if (!farmId) {
      setError('Add a farm in your profile before running diagnosis.')
      return
    }
    if (!uploadedImage) {
      setError('Upload a coconut leaf image to run classification.')
      return
    }

    setScanning(true)
    setError('')
    try {
      const diagnosis = await diagnosisApi.submit({
        farmId,
        category: 'leaves',
        imageUrl: uploadedImage,
        symptoms: {},
      })
      setResult(diagnosis)
    } catch (err) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data
        ?.message
      setError(message ?? 'Classification failed. Please try again.')
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
              <Leaf className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-emerald-200">
                AI leaf diagnosis
              </p>
              <h1 className="text-2xl font-bold sm:text-3xl">Coconut Leaves & Leaflets</h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-green-100">
                Upload a clear photo of affected leaves. Our disease classification model will
                classify the disease.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {error ? (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className={LEAF_PANEL_BASE}
        >
          <div className="mb-4 flex shrink-0 items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-[#1a2e1a]">Upload Leaf Image</h2>
              <p className="mt-0.5 text-sm text-gray-500">JPG or PNG · clear close-up photo</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-[#2d5f2e]">
              <ImageIcon className="h-4 w-4" />
            </div>
          </div>

          <div className="mb-4 min-h-0 flex-1 overflow-hidden rounded-xl border-2 border-dashed border-green-200/80 bg-gradient-to-b from-green-50/50 to-white transition-colors hover:border-green-300">
            {uploadedImage ? (
              <div className="group relative h-full min-h-[280px]">
                <img
                  src={uploadedImage}
                  alt="Uploaded coconut leaf"
                  className="h-full w-full object-contain p-2"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
                  <p className="text-center text-xs text-white">Leaf image ready for classification</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setUploadedImage(null)
                    setResult(null)
                  }}
                  className="absolute right-3 top-3 rounded-lg bg-red-500/90 px-3 py-1.5 text-sm font-medium text-white shadow-sm backdrop-blur-sm hover:bg-red-600"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex h-full min-h-[280px] flex-col items-center justify-center px-6 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-[#2d5f2e]">
                  <Upload className="h-7 w-7" />
                </div>
                <p className="mb-1 text-sm font-medium text-gray-800">Drop or select a leaf photo</p>
                <p className="mb-5 text-xs text-gray-500">Affected coconut leaves work best</p>
                <div className="flex flex-wrap justify-center gap-3">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#2d5f2e] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-[#1a2e1a] hover:shadow-md">
                    <Upload className="h-4 w-4" />
                    Choose File
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border-2 border-[#2d5f2e]/30 bg-white px-5 py-2.5 text-sm font-medium text-[#2d5f2e] transition-all hover:border-[#2d5f2e] hover:bg-green-50">
                    <Camera className="h-4 w-4" />
                    Camera
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleScan}
            disabled={!uploadedImage || scanning}
            className="group flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#2d5f2e] to-[#1a2e1a] py-4 text-base font-semibold text-white shadow-md transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:from-gray-300 disabled:to-gray-300 disabled:shadow-none"
          >
            {scanning ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Classifying…
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 transition-transform group-hover:scale-110" />
                Classify with AI Model
              </>
            )}
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <LeafPredictionPanel result={result} scanning={scanning} />
        </motion.div>
      </div>

      {result && !scanning && result.predictions?.length ? (
        <LeafDiseaseDetailCard
          diseaseName={result.finalResult}
          confidence={result.confidence}
          detectedEvidence={result.detectedEvidence}
        />
      ) : null}
    </div>
  )
}
