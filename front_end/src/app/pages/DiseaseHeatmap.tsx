import { MapPin, AlertTriangle, TrendingUp, Filter, Loader2 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { useQuery } from '@tanstack/react-query'
import { diseaseMapApi } from '@/api/services'
import type { HeatmapPoint } from '@/types'

function toMapPosition(point: HeatmapPoint) {
  const left = ((point.lng - 79.5) / (82 - 79.5)) * 100
  const top = ((9.5 - point.lat) / (9.5 - 5.9)) * 100
  return { left: `${Math.min(95, Math.max(5, left))}%`, top: `${Math.min(95, Math.max(5, top))}%` }
}

function riskLevel(weight: number) {
  if (weight >= 0.8) return 'high'
  if (weight >= 0.6) return 'medium'
  return 'low'
}

export function DiseaseHeatmap() {
  const { data: heatmap = [], isLoading } = useQuery({
    queryKey: ['disease-map', 'heatmap'],
    queryFn: diseaseMapApi.heatmap,
  })

  const spreadData = heatmap.map((p, i) => ({
    month: `P${i + 1}`,
    cases: Math.round(p.weight * 20),
  }))

  const highRiskCount = heatmap.filter((p) => p.weight >= 0.7).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl text-[#1a2e1a] mb-2">Disease Heatmap & Risk Monitoring</h1>
        <p className="text-[#6b7c6b]">Monitor disease spread across Sri Lanka from verified outbreak data.</p>
      </div>

      <div className="flex gap-4 flex-wrap">
        <select className="px-4 py-2 border border-gray-200 rounded-lg bg-white">
          <option>All Diseases</option>
        </select>
        <button type="button" className="px-4 py-2 border-2 border-[#2d5f2e] text-[#2d5f2e] rounded-lg flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Filter Districts
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#2d5f2e]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-green-100 p-6">
            <h2 className="text-xl text-[#1a2e1a] mb-4">Sri Lanka Disease Distribution</h2>
            <div className="relative bg-gradient-to-br from-green-50 to-blue-50 rounded-xl min-h-[500px]">
              {heatmap.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                  No heatmap data available
                </div>
              ) : (
                heatmap.map((point, i) => {
                  const pos = toMapPosition(point)
                  const risk = riskLevel(point.weight)
                  const pinClass =
                    risk === 'high'
                      ? 'border-red-500 bg-red-500/30 text-red-700'
                      : risk === 'medium'
                        ? 'border-orange-500 bg-orange-500/30 text-orange-700'
                        : 'border-green-500 bg-green-500/30 text-green-700'
                  return (
                    <div
                      key={i}
                      className={`absolute w-10 h-10 rounded-full flex items-center justify-center border-4 ${pinClass}`}
                      style={{ left: pos.left, top: pos.top, transform: 'translate(-50%, -50%)' }}
                      title={`${point.diseaseType} (${Math.round(point.weight * 100)}%)`}
                    >
                      <MapPin className="w-5 h-5" />
                    </div>
                  )
                })
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-sm p-6 text-white">
              <h3 className="text-lg mb-2">High Risk Alerts</h3>
              <div className="text-3xl mb-1">{highRiskCount}</div>
              <p className="text-red-100 text-sm">Hotspots with weight ≥ 70%</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-6">
              <h3 className="text-lg text-[#1a2e1a] mb-4">Outbreak Points</h3>
              <div className="space-y-3">
                {heatmap.slice(0, 5).map((point, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between mb-1">
                      <div className="font-medium text-gray-900 text-sm">{point.diseaseType}</div>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        riskLevel(point.weight) === 'high' ? 'bg-red-100 text-red-700' :
                        riskLevel(point.weight) === 'medium' ? 'bg-orange-100 text-orange-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {riskLevel(point.weight)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">{point.lat.toFixed(2)}, {point.lng.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {spreadData.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-6">
          <h2 className="text-xl text-[#1a2e1a] mb-6">Outbreak Intensity</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={spreadData}>
              <XAxis dataKey="month" stroke="#6b7c6b" />
              <YAxis stroke="#6b7c6b" />
              <Tooltip />
              <Line type="monotone" dataKey="cases" stroke="#dc2626" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {heatmap.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-6">
          <h2 className="text-xl text-[#1a2e1a] mb-4">Nearby Outbreak Alerts</h2>
          <div className="space-y-3">
            {heatmap.filter((p) => p.weight >= 0.6).slice(0, 3).map((point, i) => (
              <div key={i} className="p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-1">{point.diseaseType}</h4>
                    <p className="text-sm text-gray-700">
                      Outbreak intensity {Math.round(point.weight * 100)}% at coordinates {point.lat.toFixed(2)}, {point.lng.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
