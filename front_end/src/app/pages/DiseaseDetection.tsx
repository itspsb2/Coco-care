import { Upload, Camera, Loader2, AlertCircle, CheckCircle, Info, MapPin, Sprout } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { farmApi, diagnosisApi } from '@/api/services'
import type { DiagnosisResult, Farm } from '@/types'

const diseases = [
  { name: 'Weligama Coconut Leaf Wilt Disease', symptoms: ['Yellowing leaves', 'Flaccid leaf appearance', 'Reduced nut production', 'Drooping leaflets'] },
  { name: 'Stem Bleeding Disease', symptoms: ['Dark reddish brown liquid from trunk', 'Cracked bark', 'Stem wounds', 'Internal rotting'] },
  { name: 'Bud Rot Disease', symptoms: ['Rotting crown region', 'Foul smell', 'Young leaf decay', 'Blackened bud'] },
  { name: 'Coconut Caterpillar Damage', symptoms: ['Damaged leaf surface', 'Brown dried leaves', 'Holes in leaflets', 'Visible caterpillars'] },
]

function FarmSelector({
  farms,
  selectedFarmId,
  onSelect,
}: {
  farms: Farm[]
  selectedFarmId: string
  onSelect: (id: string) => void
}) {
  if (farms.length <= 1) {
    const farm = farms[0]
    if (!farm) return null
    return (
      <div className="flex items-center gap-2 rounded-xl border border-green-100 bg-green-50/60 px-4 py-3 text-sm">
        <Sprout className="h-4 w-4 shrink-0 text-[#2d5f2e]" />
        <span className="font-medium text-gray-900">{farm.name}</span>
        <span className="text-gray-500">·</span>
        <span className="flex items-center gap-1 text-gray-600">
          <MapPin className="h-3.5 w-3.5" />
          {farm.location}
        </span>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {farms.map((farm) => {
        const selected = farm.id === selectedFarmId
        return (
          <button
            key={farm.id}
            type="button"
            onClick={() => onSelect(farm.id)}
            className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${
              selected
                ? 'border-[#2d5f2e] bg-green-50 ring-1 ring-[#2d5f2e]/20'
                : 'border-green-100 bg-white hover:border-green-200 hover:bg-green-50/50'
            }`}
          >
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                selected ? 'bg-[#2d5f2e] text-white' : 'bg-green-100 text-[#2d5f2e]'
              }`}
            >
              <Sprout className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="font-medium text-gray-900">{farm.name}</div>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                {farm.location}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}

export function DiseaseDetection() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])
  const [selectedFarmId, setSelectedFarmId] = useState('')
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<DiagnosisResult | null>(null)
  const [error, setError] = useState('')

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['farmer', 'profile'],
    queryFn: farmApi.profile,
  })

  const farms = profile?.farms ?? []

  useEffect(() => {
    if (farms.length === 0) {
      setSelectedFarmId('')
      return
    }
    if (!selectedFarmId || !farms.some((f) => f.id === selectedFarmId)) {
      setSelectedFarmId(farms[0].id)
    }
  }, [farms, selectedFarmId])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => setUploadedImage(reader.result as string)
      reader.readAsDataURL(file)
      setResult(null)
      setError('')
    }
  }

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom],
    )
  }

  const handleScan = async () => {
    if (!selectedFarmId) {
      setError('Select a farm before running diagnosis.')
      return
    }
    setScanning(true)
    setError('')
    try {
      const symptoms: Record<string, boolean> = {}
      selectedSymptoms.forEach((s) => { symptoms[s] = true })

      const diagnosis = await diagnosisApi.submit({
        farmId: selectedFarmId,
        imageUrl: uploadedImage ?? undefined,
        symptoms,
      })
      setResult(diagnosis)
    } catch {
      setError('Diagnosis failed. Ensure you are logged in and the backend is running.')
    } finally {
      setScanning(false)
    }
  }

  const adviceLines = result?.advice
    ? result.advice.split(/[.!]\s+/).filter(Boolean)
    : []

  const canScan = Boolean(uploadedImage && selectedFarmId && !scanning)

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#2d5f2e]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl text-[#1a2e1a] mb-2">AI Disease Diagnosis</h1>
        <p className="text-[#6b7c6b]">Upload coconut images and select symptoms for accurate disease detection.</p>
      </div>

      {farms.length === 0 ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
          <Sprout className="mx-auto mb-3 h-10 w-10 text-amber-600" />
          <h2 className="text-lg font-semibold text-amber-900 mb-2">No farms registered</h2>
          <p className="text-sm text-amber-800 mb-4">
            Add a farm to your profile before submitting a disease diagnosis.
          </p>
          <Link
            to="/app/profile"
            className="inline-flex items-center gap-2 rounded-lg bg-[#2d5f2e] px-4 py-2 text-sm text-white hover:bg-[#1a2e1a]"
          >
            Go to Profile
          </Link>
        </div>
      ) : null}

      {error && (
        <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">{error}</div>
      )}

      {farms.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-6">
          <h2 className="text-xl text-[#1a2e1a] mb-4">
            {farms.length > 1 ? 'Select farm for this diagnosis' : 'Diagnosis farm'}
          </h2>
          <FarmSelector
            farms={farms}
            selectedFarmId={selectedFarmId}
            onSelect={setSelectedFarmId}
          />
        </div>
      ) : null}

      {farms.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-6">
              <h2 className="text-xl text-[#1a2e1a] mb-4">Upload Image</h2>
              <div className="border-2 border-dashed border-green-200 rounded-xl p-8 text-center hover:border-green-400 transition-colors">
                {uploadedImage ? (
                  <div className="relative">
                    <img src={uploadedImage} alt="Uploaded" className="w-full h-64 object-cover rounded-lg" />
                    <button onClick={() => setUploadedImage(null)} className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600">Remove</button>
                  </div>
                ) : (
                  <>
                    <Upload className="w-12 h-12 text-green-600 mx-auto mb-4" />
                    <h3 className="text-lg text-gray-900 mb-2">Drag and drop your image here</h3>
                    <div className="flex gap-3 justify-center">
                      <label className="px-4 py-2 bg-[#2d5f2e] text-white rounded-lg hover:bg-[#1a2e1a] cursor-pointer">
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                        Choose File
                      </label>
                      <label className="px-4 py-2 border-2 border-[#2d5f2e] text-[#2d5f2e] rounded-lg hover:bg-green-50 cursor-pointer flex items-center gap-2">
                        <Camera className="w-4 h-4" />
                        Camera
                        <input type="file" accept="image/*" capture="environment" onChange={handleImageUpload} className="hidden" />
                      </label>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-6">
              <h2 className="text-xl text-[#1a2e1a] mb-4">Select Symptoms (Optional)</h2>
              <div className="space-y-4">
                {diseases.map((disease) => (
                  <div key={disease.name}>
                    <h3 className="text-sm text-gray-900 mb-2">{disease.name}</h3>
                    <div className="flex flex-wrap gap-2">
                      {disease.symptoms.map((symptom) => (
                        <button
                          key={symptom}
                          onClick={() => toggleSymptom(symptom)}
                          className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                            selectedSymptoms.includes(symptom) ? 'bg-[#2d5f2e] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {symptom}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleScan}
              disabled={!canScan}
              className="w-full py-4 bg-[#2d5f2e] text-white rounded-lg hover:bg-[#1a2e1a] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {scanning ? (<><Loader2 className="w-5 h-5 animate-spin" />Analyzing Image...</>) : 'Start AI Diagnosis'}
            </button>
          </div>

          <div>
            {scanning && (
              <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-6 text-center py-12">
                <Loader2 className="w-12 h-12 animate-spin text-[#2d5f2e] mx-auto mb-4" />
                <h3 className="text-xl text-gray-900 mb-2">AI Scanning in Progress</h3>
              </div>
            )}

            {result && !scanning && (
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-[#2d5f2e] to-[#1a2e1a] rounded-2xl shadow-sm p-6 text-white">
                  <div className="flex items-start gap-3 mb-4">
                    <AlertCircle className="w-6 h-6 flex-shrink-0 mt-1" />
                    <div>
                      <h2 className="text-2xl mb-2">Detection Result</h2>
                      <p className="text-green-100 text-sm capitalize">Status: {result.status}</p>
                    </div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4">
                    <div className="text-sm text-green-100 mb-1">Detected Disease</div>
                    <div className="text-2xl mb-3">{result.finalResult}</div>
                    <div className="text-xl">{Math.round(result.confidence * 100)}% confidence</div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <h3 className="text-lg text-gray-900">Recommended Actions</h3>
                  </div>
                  <ul className="space-y-2">
                    {adviceLines.map((line, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-700">
                        <span className="text-green-600 mt-1">•</span>
                        {line}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Info className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg text-gray-900">Analysis Details</h3>
                  </div>
                  <p className="text-sm text-gray-700">Image: {result.imageResult}</p>
                  <p className="text-sm text-gray-700 mt-1">Symptoms: {result.symptomResult}</p>
                </div>
              </div>
            )}

            {!scanning && !result && (
              <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-6 text-center py-12">
                <AlertCircle className="w-10 h-10 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl text-gray-900 mb-2">Ready for Diagnosis</h3>
                <p className="text-gray-600">Select a farm, upload an image, and click &quot;Start AI Diagnosis&quot; to begin.</p>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}
