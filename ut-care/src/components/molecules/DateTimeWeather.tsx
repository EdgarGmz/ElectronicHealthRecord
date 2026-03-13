import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Calendar, Clock, Thermometer } from 'lucide-react'
import { useStatusBarElementsStore, getDateFormatOptions } from '@/store/statusBarElements.store'

const OPEN_METEO_URL = 'https://api.open-meteo.com/v1/forecast'
const DEFAULT_LAT = 19.43
const DEFAULT_LON = -99.13

interface OpenMeteoCurrent {
  temperature_2m: number
}

interface OpenMeteoResponse {
  current?: OpenMeteoCurrent
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
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    const params = new URLSearchParams({
      latitude: String(DEFAULT_LAT),
      longitude: String(DEFAULT_LON),
      current: 'temperature_2m',
    })
    fetch(`${OPEN_METEO_URL}?${params}`)
      .then((res) => res.json())
      .then((data: OpenMeteoResponse) => {
        if (!cancelled && data.current?.temperature_2m != null) {
          setTemp(Math.round(data.current.temperature_2m))
        }
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })
    return () => { cancelled = true }
  }, [])

  return { temp, error }
}

export function DateTimeWeather() {
  const { i18n } = useTranslation()
  const now = useCurrentTime(1000)
  const { temp, error } = useTemperature()
  const showTime = useStatusBarElementsStore((s) => s.showTime)
  const showDate = useStatusBarElementsStore((s) => s.showDate)
  const showTemperature = useStatusBarElementsStore((s) => s.showTemperature)
  const dateFormat = useStatusBarElementsStore((s) => s.dateFormat)

  const locale = i18n.language.startsWith('es') ? 'es-MX' : 'en-US'
  const dateStr = now.toLocaleDateString(locale, getDateFormatOptions(dateFormat))
  const timeStr = now.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  if (!showTime && !showDate && !showTemperature) return null

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
      {showTemperature && (
        <span className="hidden sm:flex sm:items-center sm:gap-1.5" title={temp != null ? `${temp} °C` : ''}>
          <Thermometer size={16} className="shrink-0 text-[var(--color-primary)]" aria-hidden />
          {error ? (
            <span className="text-[var(--text-muted)]">—</span>
          ) : temp != null ? (
            <span className="tabular-nums">{temp} °C</span>
          ) : (
            <span className="tabular-nums text-[var(--text-muted)]">...</span>
          )}
        </span>
      )}
    </div>
  )
}
