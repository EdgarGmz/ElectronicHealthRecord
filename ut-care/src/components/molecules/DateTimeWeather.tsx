import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Calendar,
  Clock,
  Thermometer,
  Sun,
  Cloud,
  CloudSun,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudSnow,
  Snowflake,
  CloudLightning
} from 'lucide-react'
import { useStatusBarElementsStore, getDateFormatOptions } from '@/store/statusBarElements.store'

const OPEN_METEO_URL = 'https://api.open-meteo.com/v1/forecast'
const DEFAULT_LAT = 19.43
const DEFAULT_LON = -99.13

interface OpenMeteoResponse {
  current?: {
    temperature_2m: number
    weather_code: number
  }
}

interface WeatherCondition {
  labelEs: string
  labelEn: string
  icon: React.ComponentType<{ size?: number; className?: string }>
}

const WEATHER_MAPPING: Record<number, WeatherCondition> = {
  0: { labelEs: 'Soleado', labelEn: 'Sunny', icon: Sun },
  1: { labelEs: 'Principalmente despejado', labelEn: 'Mainly clear', icon: Sun },
  2: { labelEs: 'Parcialmente nublado', labelEn: 'Partly cloudy', icon: CloudSun },
  3: { labelEs: 'Nublado', labelEn: 'Cloudy', icon: Cloud },
  45: { labelEs: 'Niebla', labelEn: 'Foggy', icon: CloudFog },
  48: { labelEs: 'Niebla escarchada', labelEn: 'Rime fog', icon: CloudFog },
  51: { labelEs: 'Llovizna ligera', labelEn: 'Light drizzle', icon: CloudDrizzle },
  53: { labelEs: 'Llovizna moderada', labelEn: 'Moderate drizzle', icon: CloudDrizzle },
  55: { labelEs: 'Llovizna densa', labelEn: 'Dense drizzle', icon: CloudDrizzle },
  56: { labelEs: 'Llovizna helada ligera', labelEn: 'Light freezing drizzle', icon: CloudSnow },
  57: { labelEs: 'Llovizna helada densa', labelEn: 'Dense freezing drizzle', icon: CloudSnow },
  61: { labelEs: 'Lluvia ligera', labelEn: 'Light rain', icon: CloudRain },
  63: { labelEs: 'Lluvia moderada', labelEn: 'Moderate rain', icon: CloudRain },
  65: { labelEs: 'Lluvia fuerte', labelEn: 'Heavy rain', icon: CloudRain },
  66: { labelEs: 'Lluvia helada ligera', labelEn: 'Light freezing rain', icon: CloudSnow },
  67: { labelEs: 'Lluvia helada fuerte', labelEn: 'Heavy freezing rain', icon: CloudSnow },
  71: { labelEs: 'Nevada ligera', labelEn: 'Light snow', icon: Snowflake },
  73: { labelEs: 'Nevada moderada', labelEn: 'Moderate snow', icon: Snowflake },
  75: { labelEs: 'Nevada fuerte', labelEn: 'Heavy snow', icon: Snowflake },
  77: { labelEs: 'Granizo', labelEn: 'Snow grains', icon: Snowflake },
  80: { labelEs: 'Lluvia ligera intermitente', labelEn: 'Light rain showers', icon: CloudRain },
  81: { labelEs: 'Lluvia moderada intermitente', labelEn: 'Moderate rain showers', icon: CloudRain },
  82: { labelEs: 'Lluvia violenta intermitente', labelEn: 'Violent rain showers', icon: CloudRain },
  85: { labelEs: 'Chubascos de nieve ligeros', labelEn: 'Light snow showers', icon: CloudSnow },
  86: { labelEs: 'Chubascos de nieve fuertes', labelEn: 'Heavy snow showers', icon: CloudSnow },
  95: { labelEs: 'Tormenta eléctrica', labelEn: 'Thunderstorm', icon: CloudLightning },
  96: { labelEs: 'Tormenta con granizo ligero', labelEn: 'Thunderstorm with light hail', icon: CloudLightning },
  99: { labelEs: 'Tormenta con granizo fuerte', labelEn: 'Thunderstorm with heavy hail', icon: CloudLightning },
}

function useCurrentTime(intervalMs: number) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return now
}

function useTemperature() {
  const [temp, setTemp] = useState<number | null>(null)
  const [weatherCode, setWeatherCode] = useState<number | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false

    const fetchWeather = (lat: number, lon: number) => {
      const params = new URLSearchParams({
        latitude: String(lat),
        longitude: String(lon),
        current: 'temperature_2m,weather_code',
      })
      fetch(`${OPEN_METEO_URL}?${params}`)
        .then((res) => res.json())
        .then((data: OpenMeteoResponse) => {
          if (!cancelled && data.current?.temperature_2m != null) {
            setTemp(Math.round(data.current.temperature_2m))
            if (data.current.weather_code != null) {
              setWeatherCode(data.current.weather_code)
            }
          }
        })
        .catch(() => {
          if (!cancelled) setError(true)
        })
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeather(position.coords.latitude, position.coords.longitude)
        },
        () => {
          // Fallback to CDMX coordinates
          fetchWeather(DEFAULT_LAT, DEFAULT_LON)
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 600000 }
      )
    } else {
      fetchWeather(DEFAULT_LAT, DEFAULT_LON)
    }

    return () => {
      cancelled = true
    }
  }, [])

  return { temp, weatherCode, error }
}

export function DateTimeWeather() {
  const { i18n } = useTranslation()
  const now = useCurrentTime(1000)
  const { temp, weatherCode, error } = useTemperature()
  const showTime = useStatusBarElementsStore((s) => s.showTime)
  const showDate = useStatusBarElementsStore((s) => s.showDate)
  const showTemperature = useStatusBarElementsStore((s) => s.showTemperature)
  const showWeatherCondition = useStatusBarElementsStore((s) => s.showWeatherCondition)
  const showWeatherIcon = useStatusBarElementsStore((s) => s.showWeatherIcon)
  const dateFormat = useStatusBarElementsStore((s) => s.dateFormat)

  const locale = i18n.language.startsWith('es') ? 'es-MX' : 'en-US'
  const dateStr = now.toLocaleDateString(locale, getDateFormatOptions(dateFormat))
  const timeStr = now.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  const isEs = i18n.language.startsWith('es')
  const mapping = weatherCode !== null ? WEATHER_MAPPING[weatherCode] : null
  const WeatherIcon = mapping?.icon
  const conditionLabel = mapping ? (isEs ? mapping.labelEs : mapping.labelEn) : ''
  const conditionTitle = temp != null ? `${temp} °C${conditionLabel ? ` - ${conditionLabel}` : ''}` : ''

  const showWeatherSection = showTemperature || showWeatherCondition || showWeatherIcon

  if (!showTime && !showDate && !showWeatherSection) return null

  return (
    <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)]">
      {showDate && (
        <span className="hidden sm:flex sm:items-center sm:gap-1.5" title={dateStr}>
          <Calendar size={16} className="shrink-0 text-[var(--color-primary)]" aria-hidden />
          <span>{dateStr}</span>
        </span>
      )}
      {showTime && (
        <span className="flex items-center gap-1.5" title={timeStr}>
          <Clock size={16} className="shrink-0 text-[var(--color-primary)]" aria-hidden />
          <span className="tabular-nums">{timeStr}</span>
        </span>
      )}
      {showWeatherSection && (
        <span className="hidden sm:flex sm:items-center sm:gap-1.5" title={conditionTitle}>
          {showWeatherIcon ? (
            WeatherIcon ? (
              <WeatherIcon size={16} className="shrink-0 text-[var(--color-primary)]" aria-hidden />
            ) : (
              <Thermometer size={16} className="shrink-0 text-[var(--color-primary)]" aria-hidden />
            )
          ) : null}
          {error ? (
            <span className="text-[var(--text-muted)]">—</span>
          ) : (
            <span className="flex items-center gap-1">
              {showTemperature && temp != null && (
                <span className="tabular-nums font-semibold">{temp} °C</span>
              )}
              {showWeatherCondition && conditionLabel && (
                <span className={`hidden md:inline text-xs text-[var(--text-muted)] ${
                  showTemperature && temp != null ? 'border-l border-[var(--border)] pl-1.5 ml-1' : ''
                }`}>
                  {conditionLabel}
                </span>
              )}
            </span>
          )}
        </span>
      )}
    </div>
  )
}
