import { Link } from 'react-router'
import {
  Microscope,
  MessageSquare,
  Map,
  Bell,
  CloudRain,
  CloudSun,
  Droplets,
  Sun,
  Wind,
  Cloud,
  Loader2,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { farmApi, reportsApi, diseaseMapApi, weatherApi } from '@/api/services'
import type { DiseaseReport, WeatherForecast, WeatherIcon } from '@/types'

export function Dashboard() {
  const { user } = useAuth()

  const { data: profile } = useQuery({
    queryKey: ['farmer', 'profile'],
    queryFn: farmApi.profile,
  })

  const { data: reports = [] } = useQuery({
    queryKey: ['reports', 'my'],
    queryFn: reportsApi.my,
  })

  const { data: heatmap = [] } = useQuery({
    queryKey: ['disease-map', 'heatmap'],
    queryFn: diseaseMapApi.heatmap,
  })

  const farm = profile?.farms[0]
  const farmRegion = farm?.location ?? 'Kurunegala'

  const {
    data: weather,
    isLoading: weatherLoading,
    isError: weatherError,
    error: weatherQueryError,
  } = useQuery({
    queryKey: ['weather', 'forecast', farm?.latitude, farm?.longitude, farmRegion],
    queryFn: () =>
      weatherApi.forecast({
        lat: farm?.latitude,
        lon: farm?.longitude,
        location: farmRegion,
      }),
    enabled: !!profile,
    staleTime: 1000 * 60 * 30,
    retry: 1,
  })

  const weatherErrorMessage =
    weatherQueryError && typeof weatherQueryError === 'object' && 'response' in weatherQueryError
      ? (weatherQueryError as { response?: { data?: { message?: string } } }).response?.data?.message
      : undefined

  const firstName = (user?.name ?? 'Farmer').split(' ')[0]

  const quickLinks = [
    { label: 'Disease Detection', href: '/app/disease-detection', icon: Microscope, color: 'from-green-500 to-[#2d5f2e]' },
    { label: 'AI Chatbot', href: '/app/chatbot', icon: MessageSquare, color: 'from-emerald-500 to-teal-600' },
    { label: 'Heatmap', href: '/app/heatmap', icon: Map, color: 'from-blue-500 to-cyan-600' },
    { label: 'Notifications', href: '/app/notifications', icon: Bell, color: 'from-amber-500 to-orange-500' },
  ]

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-3xl text-[#1a2e1a] mb-2">Welcome, {firstName}!</h1>
        <p className="text-[#6b7c6b] mb-6">Quick access to your plantation tools.</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="group flex flex-col items-center gap-3 p-5 bg-white rounded-2xl border border-green-100 shadow-sm hover:shadow-md hover:border-green-200 transition-all duration-200 hover:-translate-y-0.5"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${link.color} flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-transform duration-200`}>
                <link.icon className="w-6 h-6" />
              </div>
              <span className="text-sm font-medium text-gray-800 text-center">{link.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Row 1: Recent AI Diagnoses + Disease Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-green-100 p-6">
          <RecentDiagnosesSection reports={reports} compact />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-6">
          <h2 className="text-xl text-[#1a2e1a] mb-4">Current Disease Alerts</h2>
          <div className="space-y-3">
            {heatmap.length === 0 ? (
              <p className="text-sm text-gray-500">No outbreak data available.</p>
            ) : (
              heatmap.slice(0, 4).map((point, i) => (
                <AlertItem
                  key={i}
                  disease={point.diseaseType}
                  location={`${point.lat.toFixed(2)}, ${point.lng.toFixed(2)}`}
                  severity={point.weight >= 0.8 ? 'high' : point.weight >= 0.6 ? 'medium' : 'low'}
                />
              ))
            )}
          </div>
          <Link to="/app/heatmap" className="inline-block mt-4 text-sm text-[#2d5f2e] hover:underline">
            View full heatmap
          </Link>
        </div>
      </div>

      <WeatherForecastCard
        region={farmRegion}
        weather={weather}
        loading={weatherLoading}
        error={weatherError}
        errorMessage={weatherErrorMessage}
      />
    </div>
  )
}

function RecentDiagnosesSection({ reports, compact }: { reports: DiseaseReport[]; compact?: boolean }) {
  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl text-[#1a2e1a]">Recent AI Diagnoses</h2>
        <Link to="/app/disease-detection" className="text-sm text-[#2d5f2e] hover:underline">
          New diagnosis
        </Link>
      </div>
      {reports.length === 0 ? (
        <p className="text-sm text-gray-500">No reports yet. Run a diagnosis to see results.</p>
      ) : (
        <div className={`grid gap-3 ${compact ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'}`}>
          {reports.slice(0, compact ? 4 : 6).map((r) => (
            <DiagnosisItem key={r.id} report={r} compact={compact} />
          ))}
        </div>
      )}
    </>
  )
}

function WeatherIconDisplay({ icon, className }: { icon: WeatherIcon; className?: string }) {
  const cls = className ?? 'w-7 h-7'
  if (icon === 'sun') return <Sun className={`${cls} text-amber-500`} />
  if (icon === 'rain') return <CloudRain className={`${cls} text-blue-600`} />
  if (icon === 'cloud') return <Cloud className={`${cls} text-gray-500`} />
  return <CloudSun className={`${cls} text-blue-400`} />
}

function WeatherForecastCard({
  region,
  weather,
  loading,
  error,
  errorMessage,
}: {
  region: string
  weather?: WeatherForecast
  loading: boolean
  error: boolean
  errorMessage?: string
}) {
  const displayRegion = weather?.location ?? region

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
        <div>
          <h2 className="text-xl text-[#1a2e1a]">Weather Forecast</h2>
          <p className="text-sm text-gray-500">{displayRegion}, Sri Lanka · live outlook</p>
        </div>
        {weather && (
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Wind className="w-4 h-4 text-blue-500" />
              {weather.current.windSpeed} km/h {weather.current.windDirection}
            </span>
            <span className="flex items-center gap-1">
              <Droplets className="w-4 h-4 text-blue-500" />
              {weather.current.humidity}% humidity
            </span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-[#2d5f2e]" />
        </div>
      ) : error || !weather ? (
        <div className="text-sm text-gray-500 py-8 text-center space-y-2">
          <p>Weather data unavailable.</p>
          {errorMessage && (
            <p className="text-xs text-red-600 max-w-md mx-auto">{errorMessage}</p>
          )}
          <p className="text-xs">
            Ensure the backend is running and a valid <code className="text-gray-700">OPENWEATHER_API_KEY</code> is set in <code className="text-gray-700">backend/.env</code>.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
            <div className="lg:col-span-1 p-5 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl flex items-center gap-4">
              <WeatherIconDisplay icon={weather.current.icon} className="w-14 h-14 shrink-0" />
              <div>
                <div className="text-3xl font-semibold text-gray-900">{weather.current.temp}°C</div>
                <div className="text-sm text-gray-600 capitalize">{weather.current.description}</div>
                <div className="text-xs text-gray-500 mt-1">Feels like {weather.current.feelsLike}°C</div>
              </div>
            </div>

            <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {weather.days.map((day) => (
                <ForecastDay key={day.day} {...day} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function ForecastDay({
  day,
  high,
  low,
  rain,
  icon,
}: {
  day: string
  high: number
  low: number
  rain: number
  icon: WeatherIcon
}) {
  return (
    <div className="p-3 bg-gray-50 rounded-lg text-center">
      <div className="text-xs font-medium text-gray-600 mb-2">{day}</div>
      <WeatherIconDisplay icon={icon} />
      <div className="text-sm font-semibold text-gray-900">{high}°</div>
      <div className="text-xs text-gray-500">{low}°</div>
      <div className="text-xs text-blue-600 mt-1">{rain}%</div>
    </div>
  )
}

function AlertItem({ disease, location, severity }: { disease: string; location: string; severity: string }) {
  const colors = {
    high: 'bg-red-100 text-red-700 border-red-200',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    low: 'bg-blue-100 text-blue-700 border-blue-200',
  }
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div>
        <div className="text-gray-900 text-sm">{disease}</div>
        <div className="text-xs text-gray-500">{location}</div>
      </div>
      <span className={`px-2 py-0.5 rounded-full text-xs border capitalize ${colors[severity as keyof typeof colors]}`}>{severity}</span>
    </div>
  )
}

function DiagnosisItem({ report, compact }: { report: DiseaseReport; compact?: boolean }) {
  const disease = report.finalResult ?? report.imageResult ?? 'Unknown'
  const confidence = Math.round(report.confidence * 100)
  const date = new Date(report.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  const statusStyles = {
    verified: 'bg-green-100 text-green-700 border-green-200',
    pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    rejected: 'bg-red-100 text-red-700 border-red-200',
  }

  return (
    <div className={`p-4 bg-gray-50 rounded-xl border border-gray-100 h-full flex flex-col ${compact ? 'text-sm' : ''}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <div className="text-xs text-gray-500 mb-0.5">{date}</div>
          <div className="text-sm font-medium text-gray-800 truncate">{report.farmName}</div>
          {!compact && <div className="text-xs text-gray-500">{report.region}</div>}
        </div>
        <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs border capitalize ${statusStyles[report.status]}`}>
          {report.status}
        </span>
      </div>

      <div className={`font-semibold text-[#1a2e1a] mb-2 ${compact ? 'text-sm' : 'text-base'}`}>{disease}</div>

      {!compact && (report.imageResult || report.symptomResult) && (
        <div className="text-xs text-gray-600 space-y-1 mb-3">
          {report.imageResult && (
            <div>
              <span className="text-gray-400">Image: </span>
              {report.imageResult}
            </div>
          )}
          {report.symptomResult && (
            <div>
              <span className="text-gray-400">Symptoms: </span>
              {report.symptomResult}
            </div>
          )}
        </div>
      )}

      <div className="mt-auto">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-500">Confidence</span>
          <span className="text-sm font-medium text-green-600">{confidence}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div className="bg-green-600 h-1.5 rounded-full" style={{ width: `${confidence}%` }} />
        </div>
      </div>
    </div>
  )
}
