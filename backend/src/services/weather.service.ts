import { env } from '../config/env.js'
import { badRequest, serviceUnavailable } from '../utils/errors.js'

export type WeatherIcon = 'sun' | 'partly' | 'rain' | 'cloud'

export interface WeatherDay {
  day: string
  date: string
  high: number
  low: number
  /** Probability of precipitation 0–100 */
  rainChance: number
  /** Estimated rainfall mm for the day */
  rainMm: number
  humidity: number
  windSpeed: number
  windDirection: string
  feelsLike: number
  description: string
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
    /** Probability of precipitation 0–100 (from next forecast slot when available) */
    rainChance: number
    pressure: number
    visibilityKm: number | null
    icon: WeatherIcon
  }
  days: WeatherDay[]
  farmingTip: string
}

interface OwCurrentResponse {
  main: { temp: number; feels_like: number; humidity: number; pressure: number }
  weather: Array<{ main: string; description: string }>
  wind: { speed: number; deg?: number }
  visibility?: number
  name: string
  rain?: { '1h'?: number; '3h'?: number }
}

interface OwForecastItem {
  dt: number
  main: {
    temp: number
    temp_max: number
    temp_min: number
    humidity: number
    feels_like: number
    pressure: number
  }
  pop: number
  weather: Array<{ main: string; description: string }>
  wind: { speed: number; deg?: number }
  rain?: { '3h'?: number }
}

interface OwForecastResponse {
  list: OwForecastItem[]
  city: { name: string }
}

function windDirection(deg?: number): string {
  if (deg == null) return '—'
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  return dirs[Math.round(deg / 45) % 8]!
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

function avg(nums: number[]): number {
  if (nums.length === 0) return 0
  return nums.reduce((a, b) => a + b, 0) / nums.length
}

function buildFarmingTip(days: WeatherDay[]): string {
  const rainy = days.filter((d) => d.rainChance >= 50 || d.rainMm >= 5)
  if (rainy.length === 0) {
    return 'Dry conditions ahead. Good window for field work and fungicide sprays. Monitor soil moisture for young palms.'
  }
  const names = rainy.map((d) => d.day).slice(0, 3).join('–')
  const range = `${rainy[0]!.rainChance}%–${rainy[rainy.length - 1]!.rainChance}%`
  const mm = rainy.reduce((s, d) => s + d.rainMm, 0)
  return `Rain expected ${names} (up to ${range} chance, ~${Math.round(mm)} mm total). Avoid crown irrigation and plan fungicide sprays for dry windows.`
}

async function owFetch<T>(url: string): Promise<T> {
  let res: Response
  try {
    res = await fetch(url)
  } catch (err) {
    const detail = err instanceof Error ? err.message : 'network error'
    throw serviceUnavailable(
      `Cannot reach OpenWeather API (${detail}). Check internet access and OPENWEATHER_API_KEY.`,
    )
  }
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
  return { lat: geo[0]!.lat, lon: geo[0]!.lon, label: geo[0]!.name }
}

function notFoundLocation(query: string): Error & { status: number } {
  return badRequest(`Could not find weather location: ${query}`)
}

type DayBucket = {
  highs: number[]
  lows: number[]
  pops: number[]
  hums: number[]
  winds: number[]
  windDegs: number[]
  feels: number[]
  rainMm: number
  mains: string[]
  descriptions: string[]
}

function aggregateForecast(list: OwForecastItem[]): WeatherDay[] {
  const byDate = new Map<string, DayBucket>()

  for (const item of list) {
    const dateKey = new Date(item.dt * 1000).toISOString().slice(0, 10)
    const bucket = byDate.get(dateKey) ?? {
      highs: [],
      lows: [],
      pops: [],
      hums: [],
      winds: [],
      windDegs: [],
      feels: [],
      rainMm: 0,
      mains: [],
      descriptions: [],
    }
    bucket.highs.push(item.main.temp_max)
    bucket.lows.push(item.main.temp_min)
    bucket.pops.push(item.pop)
    bucket.hums.push(item.main.humidity)
    bucket.winds.push(item.wind.speed * 3.6)
    if (item.wind.deg != null) bucket.windDegs.push(item.wind.deg)
    bucket.feels.push(item.main.feels_like)
    bucket.rainMm += item.rain?.['3h'] ?? 0
    bucket.mains.push(item.weather[0]?.main ?? 'Clouds')
    bucket.descriptions.push(item.weather[0]?.description ?? '—')
    byDate.set(dateKey, bucket)
  }

  return Array.from(byDate.entries())
    .slice(0, 6)
    .map(([dateKey, bucket], index) => {
      const date = new Date(`${dateKey}T12:00:00`)
      const main = bucket.mains[Math.floor(bucket.mains.length / 2)] ?? 'Clouds'
      const description =
        bucket.descriptions[Math.floor(bucket.descriptions.length / 2)] ?? '—'
      const avgWindDeg =
        bucket.windDegs.length > 0 ? avg(bucket.windDegs) : undefined
      return {
        day: dayLabel(date, index),
        date: dateKey,
        high: Math.round(Math.max(...bucket.highs)),
        low: Math.round(Math.min(...bucket.lows)),
        rainChance: Math.round(Math.max(...bucket.pops) * 100),
        rainMm: Math.round(bucket.rainMm * 10) / 10,
        humidity: Math.round(avg(bucket.hums)),
        windSpeed: Math.round(Math.max(...bucket.winds)),
        windDirection: windDirection(avgWindDeg),
        feelsLike: Math.round(avg(bucket.feels)),
        description,
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
  const nextPop = forecast.list[0]?.pop ?? 0

  return {
    location: label || current.name || forecast.city.name,
    current: {
      temp: Math.round(current.main.temp),
      feelsLike: Math.round(current.main.feels_like),
      description: current.weather[0]?.description ?? '—',
      humidity: current.main.humidity,
      windSpeed: Math.round(current.wind.speed * 3.6),
      windDirection: windDirection(current.wind.deg),
      rainChance: Math.round(nextPop * 100),
      pressure: current.main.pressure,
      visibilityKm:
        current.visibility != null
          ? Math.round((current.visibility / 1000) * 10) / 10
          : null,
      icon: toIcon(currentMain),
    },
    days,
    farmingTip: buildFarmingTip(days),
  }
}
