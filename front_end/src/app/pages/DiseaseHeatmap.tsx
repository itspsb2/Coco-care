import { AlertTriangle, Filter, Loader2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { diseaseMapApi } from '@/api/services'
import { DiseaseMap, pointKey } from '@/app/components/DiseaseMap'
import { SRI_LANKA_DISTRICTS } from '@/constants/districts'
import type { HeatmapFilters, HeatmapPoint } from '@/types'

export function riskLevel(weight: number) {
  if (weight >= 0.7) return 'high'
  if (weight >= 0.6) return 'medium'
  return 'low'
}

export function DiseaseHeatmap() {
  const [diseaseFilter, setDiseaseFilter] = useState('')
  const [districtFilter, setDistrictFilter] = useState('')
  const [minWeight, setMinWeight] = useState<number | undefined>(undefined)
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [focusedPoint, setFocusedPoint] = useState<HeatmapPoint | null>(null)
  const [focusedKey, setFocusedKey] = useState<string | null>(null)

  const dateRangeInvalid = Boolean(fromDate && toDate && fromDate > toDate)

  const filters = useMemo<HeatmapFilters | undefined>(() => {
    if (dateRangeInvalid) return undefined
    const next: HeatmapFilters = {}
    if (diseaseFilter.trim()) next.diseaseType = diseaseFilter.trim()
    if (districtFilter.trim()) next.district = districtFilter.trim()
    if (minWeight != null) next.minWeight = minWeight
    if (fromDate) next.from = `${fromDate}T00:00:00.000Z`
    if (toDate) next.to = `${toDate}T23:59:59.999Z`
    return Object.keys(next).length > 0 ? next : undefined
  }, [diseaseFilter, districtFilter, minWeight, fromDate, toDate, dateRangeInvalid])

  const { data: heatmap = [], isLoading } = useQuery({
    queryKey: ['disease-map', 'heatmap', filters],
    queryFn: () => diseaseMapApi.heatmap(filters),
    enabled: !dateRangeInvalid,
  })

  const { data: nearby } = useQuery({
    queryKey: ['disease-map', 'nearby'],
    queryFn: () => diseaseMapApi.nearby(),
  })

  const diseaseOptions = useMemo(
    () => [...new Set(heatmap.map((p) => p.diseaseType))].sort(),
    [heatmap],
  )
  const highRiskCount = heatmap.filter((p) => p.weight >= 0.7).length

  const nearbyOutbreaks = nearby?.farms.flatMap((f) =>
    f.outbreaks.map((o) => ({ ...o, farmName: f.farmName })),
  ) ?? []

  const clearFilters = () => {
    setDiseaseFilter('')
    setDistrictFilter('')
    setMinWeight(undefined)
    setFromDate('')
    setToDate('')
    setFocusedPoint(null)
    setFocusedKey(null)
  }

  const focusOutbreak = (point: HeatmapPoint) => {
    const key = pointKey(point)
    setFocusedPoint(point)
    setFocusedKey(key)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl text-[#1a2e1a] mb-2">Disease Heatmap & Risk Monitoring</h1>
        <p className="text-[#6b7c6b]">Monitor disease spread across Sri Lanka from verified outbreak data.</p>
      </div>

      <div className="flex gap-4 flex-wrap items-end">
        <select
          value={diseaseFilter}
          onChange={(e) => setDiseaseFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg bg-white"
        >
          <option value="">All Diseases</option>
          {diseaseOptions.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <select
          value={districtFilter}
          onChange={(e) => setDistrictFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg bg-white"
        >
          <option value="">All Districts</option>
          {SRI_LANKA_DISTRICTS.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <select
          value={minWeight ?? ''}
          onChange={(e) => setMinWeight(e.target.value ? Number(e.target.value) : undefined)}
          className="px-4 py-2 border border-gray-200 rounded-lg bg-white"
        >
          <option value="">All risk levels</option>
          <option value="0.6">Medium+ (≥ 60%)</option>
          <option value="0.7">High (≥ 70%)</option>
          <option value="0.8">Critical (≥ 80%)</option>
        </select>
        <label className="flex flex-col gap-1 text-sm text-[#6b7c6b]">
          From
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg bg-white"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-[#6b7c6b]">
          To
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg bg-white"
          />
        </label>
        <button
          type="button"
          onClick={clearFilters}
          className="px-4 py-2 border-2 border-[#2d5f2e] text-[#2d5f2e] rounded-lg flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          Clear filters
        </button>
      </div>

      {dateRangeInvalid ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          &quot;From&quot; date must be on or before the &quot;To&quot; date.
        </div>
      ) : null}

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#2d5f2e]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-green-100 p-6">
            <h2 className="text-xl text-[#1a2e1a] mb-4">Sri Lanka Disease Distribution</h2>
            {heatmap.length === 0 ? (
              <div className="flex items-center justify-center h-[500px] rounded-xl bg-gray-50 text-gray-500">
                No outbreak data matches the current filters.
              </div>
            ) : (
              <DiseaseMap points={heatmap} focusedPoint={focusedPoint} />
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-sm p-6 text-white">
              <h3 className="text-lg mb-2">High Risk Alerts</h3>
              <div className="text-3xl mb-1">{highRiskCount}</div>
              <p className="text-red-100 text-sm">Verified reports with confidence ≥ 70%</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-6">
              <h3 className="text-lg text-[#1a2e1a] mb-4">Outbreak Points</h3>
              <p className="text-xs text-[#6b7c6b] mb-3">Click an outbreak to locate it on the map.</p>
              <div className="space-y-3 max-h-[360px] overflow-y-auto">
                {heatmap.length === 0 ? (
                  <p className="text-sm text-gray-500">No outbreaks to display.</p>
                ) : (
                  heatmap.map((point) => (
                    <OutbreakPointCard
                      key={pointKey(point)}
                      point={point}
                      selected={pointKey(point) === focusedKey}
                      onSelect={() => focusOutbreak(point)}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {nearbyOutbreaks.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-6">
          <h2 className="text-xl text-[#1a2e1a] mb-4">Nearby Outbreak Alerts</h2>
          <div className="space-y-3">
            {nearbyOutbreaks.slice(0, 5).map((outbreak, i) => (
              <div key={i} className="p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-1">{outbreak.diseaseType}</h4>
                    <p className="text-sm text-gray-700">
                      {outbreak.distanceKm} km from {outbreak.farmName} — intensity {Math.round(outbreak.weight * 100)}%
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

type OutbreakPointCardProps = {
  point: HeatmapPoint
  selected: boolean
  onSelect: () => void
}

function OutbreakPointCard({ point, selected, onSelect }: OutbreakPointCardProps) {
  const risk = riskLevel(point.weight)
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left p-3 rounded-lg transition-colors ${
        selected
          ? 'bg-green-50 border-2 border-[#2d5f2e] ring-1 ring-[#2d5f2e]/20'
          : 'bg-gray-50 border-2 border-transparent hover:bg-green-50/50 hover:border-green-100'
      }`}
    >
      <div className="flex items-start justify-between mb-1">
        <div className="font-medium text-gray-900 text-sm">{point.diseaseType}</div>
        <span className={`px-2 py-0.5 rounded text-xs ${
          risk === 'high' ? 'bg-red-100 text-red-700' :
          risk === 'medium' ? 'bg-orange-100 text-orange-700' :
          'bg-green-100 text-green-700'
        }`}>
          {risk}
        </span>
      </div>
      <div className="text-xs text-gray-500">{point.lat.toFixed(2)}, {point.lng.toFixed(2)}</div>
    </button>
  )
}
