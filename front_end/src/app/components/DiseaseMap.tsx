import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet'
import type { CircleMarker as LeafletCircleMarker } from 'leaflet'
import type { HeatmapPoint } from '@/types'

function riskColor(weight: number) {
  if (weight >= 0.7) return '#dc2626'
  if (weight >= 0.6) return '#f97316'
  return '#22c55e'
}

function pointKey(point: HeatmapPoint) {
  return `${point.lat.toFixed(4)},${point.lng.toFixed(4)},${point.diseaseType}`
}

function MapFlyTo({ point }: { point: HeatmapPoint | null }) {
  const map = useMap()

  useEffect(() => {
    if (point) {
      map.flyTo([point.lat, point.lng], 11, { duration: 0.6 })
    }
  }, [point, map])

  return null
}

type OutbreakMarkerProps = {
  point: HeatmapPoint
  selected: boolean
  openPopup: boolean
}

function OutbreakMarker({ point, selected, openPopup }: OutbreakMarkerProps) {
  const markerRef = useRef<LeafletCircleMarker>(null)
  const radius = selected ? 14 + point.weight * 10 : 8 + point.weight * 10

  useEffect(() => {
    if (openPopup) {
      markerRef.current?.openPopup()
    }
  }, [openPopup])

  return (
    <CircleMarker
      ref={markerRef}
      center={[point.lat, point.lng]}
      radius={radius}
      pathOptions={{
        color: riskColor(point.weight),
        fillColor: riskColor(point.weight),
        fillOpacity: selected ? 0.85 : 0.65,
        weight: selected ? 4 : 2,
      }}
    >
      <Popup>
        <div className="text-sm">
          <strong>{point.diseaseType}</strong>
          <span className="text-gray-600"> — {Math.round(point.weight * 100)}% confidence</span>
        </div>
      </Popup>
    </CircleMarker>
  )
}

type DiseaseMapProps = {
  points: HeatmapPoint[]
  focusedPoint?: HeatmapPoint | null
}

export function DiseaseMap({ points, focusedPoint = null }: DiseaseMapProps) {
  const focusedKey = focusedPoint ? pointKey(focusedPoint) : null

  return (
    <MapContainer
      center={[7.8731, 80.7718]}
      zoom={7}
      scrollWheelZoom
      className="h-[500px] w-full rounded-xl z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapFlyTo point={focusedPoint} />
      {points.map((point) => {
        const key = pointKey(point)
        return (
          <OutbreakMarker
            key={key}
            point={point}
            selected={key === focusedKey}
            openPopup={key === focusedKey}
          />
        )
      })}
    </MapContainer>
  )
}

export { pointKey }
