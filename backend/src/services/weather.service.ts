import { env } from '../config/env.js'
import { badRequest, serviceUnavailable } from '../utils/errors.js'

export type WeatherIcon = 'sun' | 'partly' | 'rain' | 'cloud'

export interface WeatherDay {
  day: string
  high: number
  low: number
  rain: number
  icon: WeatherIcon
}

export interface WeatherForecast {
  location: string
  current: {
    temp: number
    feelsLike: number
    description: string
    humidity: number
    windSpeed: number
    windDirection: string
    icon: WeatherIcon
  }
  days: WeatherDay[]
  farmingTip: string
}

interface OwCurrentResponse {
  main: { temp: number; feels_like: number; humidity: number }
  weather: Array<{ main: string; description: string }>
  wind: { speed: number; deg?: number }
  name: string
}

interface OwForecastItem {
  dt: number
  main: { temp_max: number; temp_min: number }
  pop: number
  weather: Array<{ main: string }>
}

interface OwForecastResponse {
  list: OwForecastItem[]
  city: { name: string }
}

function windDirection(deg?: number): string {
  if (deg == null) return '—'
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  return dirs[Math.round(deg / 45) % 8]
}

function toIcon(main: string): WeatherIcon {
  const m = main.toLowerCase()
  if (m === 'clear') return 'sun'
  if (m === 'rain' || m === 'drizzle' || m === 'thunderstorm') return 'rain'
  if (m === 'clouds') return 'partly'
  return 'cloud'
}

function dayLabel(date: Date, index: number): string {
  if (index === 0) return 'Today'
  return date.toLocaleDateString('en-US', { weekday: 'short' })
}

function buildFarmingTip(days: WeatherDay[]): string {
  const rainy = days.filter((d) => d.rain >= 50)
  if (rainy.length === 0) {
    return 'Dry conditions ahead. Good window for field work and fungicide sprays. Monitor soil moisture for young palms.'
  }
  const names = rainy.map((d) => d.day).slice(0, 3).join('–')
  const range = `${rainy[0].rain}%–${rainy[rainy.length - 1].rain}%`
  return `Rain expected ${names} (${range} chance). Avoid crown irrigation and plan fungicide sprays for dry windows.`
}

async function owFetch<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) {
    const body = await res.text()
    throw serviceUnavailable(`Weather service error: ${res.status} ${body.slice(0, 120)}`)
  }
  return res.json() as Promise<T>
}

async function resolveCoords(
  lat?: number,
  lon?: number,
  location?: string,
): Promise<{ lat: number; lon: number; label: string }> {
  if (lat != null && lon != null && !Number.isNaN(lat) && !Number.isNaN(lon)) {
    return { lat, lon, label: location?.trim() || 'Farm location' }
  }

  const query = location?.trim()
  if (!query) throw badRequest('Provide lat/lon or a location name')

  const geoUrl = new URL('https://api.openweathermap.org/geo/1.0/direct')
  geoUrl.searchParams.set('q', `${query},LK`)
  geoUrl.searchParams.set('limit', '1')
  geoUrl.searchParams.set('appid', env.openWeatherApiKey)

  const geo = await owFetch<Array<{ lat: number; lon: number; name: string }>>(geoUrl.toString())
  if (!geo.length) throw notFoundLocation(query)
  return { lat: geo[0].lat, lon: geo[0].lon, label: geo[0].name }
}

function notFoundLocation(query: string): Error & { status: number } {
  return badRequest(`Could not find weather location: ${query}`)
}

function aggregateForecast(list: OwForecastItem[]): WeatherDay[] {
  const byDate = new Map<string, { highs: number[]; lows: number[]; pops: number[]; mains: string[] }>()

  for (const item of list) {
    const dateKey = new Date(item.dt * 1000).toISOString().slice(0, 10)
    const bucket = byDate.get(dateKey) ?? { highs: [], lows: [], pops: [], mains: [] }
    bucket.highs.push(item.main.temp_max)
    bucket.lows.push(item.main.temp_min)
    bucket.pops.push(item.pop)
    bucket.mains.push(item.weather[0]?.main ?? 'Clouds')
    byDate.set(dateKey, bucket)
  }

  return Array.from(byDate.entries())
    .slice(0, 6)
    .map(([dateKey, bucket], index) => {
      const date = new Date(`${dateKey}T12:00:00`)
      const main = bucket.mains[Math.floor(bucket.mains.length / 2)]
      return {
        day: dayLabel(date, index),
        high: Math.round(Math.max(...bucket.highs)),
        low: Math.round(Math.min(...bucket.lows)),
        rain: Math.round(Math.max(...bucket.pops) * 100),
        icon: toIcon(main),
      }
    })
}

export async function getForecast(options: {
  lat?: number
  lon?: number
  location?: string
}): Promise<WeatherForecast> {
  if (!env.openWeatherApiKey) {
    throw serviceUnavailable('Weather API is not configured')
  }

  const { lat, lon, label } = await resolveCoords(options.lat, options.lon, options.location)
  const base = 'https://api.openweathermap.org/data/2.5'

  const currentParams = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
    appid: env.openWeatherApiKey,
    units: 'metric',
  })
  const forecastParams = new URLSearchParams(currentParams)

  const [current, forecast] = await Promise.all([
    owFetch<OwCurrentResponse>(`${base}/weather?${currentParams}`),
    owFetch<OwForecastResponse>(`${base}/forecast?${forecastParams}`),
  ])

  const days = aggregateForecast(forecast.list)
  const currentMain = current.weather[0]?.main ?? 'Clouds'

  return {
    location: label || current.name || forecast.city.name,
    current: {
      temp: Math.round(current.main.temp),
      feelsLike: Math.round(current.main.feels_like),
      description: current.weather[0]?.description ?? '—',
      humidity: current.main.humidity,
      windSpeed: Math.round(current.wind.speed * 3.6),
      windDirection: windDirection(current.wind.deg),
      icon: toIcon(currentMain),
    },
    days,
    farmingTip: buildFarmingTip(days),
  }
}
