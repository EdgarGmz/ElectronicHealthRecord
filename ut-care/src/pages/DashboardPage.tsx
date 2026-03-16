import { useMemo, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Users, Calendar, Clock, CalendarDays, ArrowRight } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { GlassCard } from '@/components/atoms/GlassCard'
import { LoadingModal } from '@/components/molecules/LoadingModal'
import { getVisibleDashboardCards, type DashboardCardId, canSeeNavItem } from '@/constants/roles'
import { ROLES } from '@/constants/roles'
import { getPatients } from '@/services/patient.service'
import { getAppointments } from '@/services/appointment.service'
import { getUnreadCount } from '@/services/notification.service'
import { DashboardChartsSection } from '@/components/dashboard/DashboardChartsSection'
import { DashboardCoordinatorPsychology } from '@/components/dashboard/DashboardCoordinatorPsychology'
import { DashboardCoordinatorNursing } from '@/components/dashboard/DashboardCoordinatorNursing'
import { DashboardPsychologist } from '@/components/dashboard/DashboardPsychologist'

const CARD_CONFIG: Record<
  DashboardCardId,
  { labelKey: string; Icon: typeof Users }
> = {
  totalPatients: { labelKey: 'dashboard.totalPatients', Icon: Users },
  appointmentsToday: { labelKey: 'dashboard.appointmentsToday', Icon: Calendar },
  pending: { labelKey: 'dashboard.pending', Icon: Clock },
}

function getTodayRange(): { startDate: string; endDate: string } {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
  return {
    startDate: start.toISOString(),
    endDate: end.toISOString(),
  }
}

export function DashboardPage() {
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.user)
  const token = useAuthStore((s) => s.token)
  const visibleCards = useMemo(
    () => (user?.role ? getVisibleDashboardCards(user.role) : []),
    [user?.role]
  )

  const [stats, setStats] = useState<Partial<Record<DashboardCardId, number>>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (visibleCards.length === 0) {
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    const promises: Promise<void>[] = []

    if (visibleCards.includes('totalPatients')) {
      promises.push(
        getPatients({ page: 1, limit: 1 })
          .then((res) => {
            if (!cancelled) setStats((s) => ({ ...s, totalPatients: res.pagination.total }))
          })
          .catch(() => {
            if (!cancelled) setStats((s) => ({ ...s, totalPatients: undefined }))
          })
      )
    }
    if (visibleCards.includes('appointmentsToday')) {
      const { startDate, endDate } = getTodayRange()
      promises.push(
        getAppointments({ page: 1, limit: 1, startDate, endDate })
          .then((res) => {
            if (!cancelled) setStats((s) => ({ ...s, appointmentsToday: res.pagination.total }))
          })
          .catch(() => {
            if (!cancelled) setStats((s) => ({ ...s, appointmentsToday: undefined }))
          })
      )
    }
    if (visibleCards.includes('pending')) {
      promises.push(
        getUnreadCount()
          .then((res) => {
            if (!cancelled) setStats((s) => ({ ...s, pending: res.count }))
          })
          .catch(() => {
            if (!cancelled) setStats((s) => ({ ...s, pending: undefined }))
          })
      )
    }

    Promise.all(promises).finally(() => {
      if (!cancelled) setLoading(false)
    })
    return () => { cancelled = true }
  }, [visibleCards.join(',')])

  const formatValue = (id: DashboardCardId): string => {
    if (loading && stats[id] === undefined) return '...'
    const n = stats[id]
    return n !== undefined ? String(n) : '—'
  }

  const showCalendarShortcut = canSeeNavItem('/calendar', user?.role)
  const hasCitasOPendientes = (visibleCards.includes('appointmentsToday') || visibleCards.includes('pending')) && user?.role !== ROLES.PSICOLOGO
  const restOfCards = visibleCards.filter((id) => id !== 'appointmentsToday' && id !== 'pending')

  return (
    <div className="space-y-6">
      <LoadingModal open={loading} message={t('common.loading')} />
      {hasCitasOPendientes && (
        <GlassCard>
          <div className="flex flex-col gap-4">
            {visibleCards.includes('appointmentsToday') && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--text-secondary)]">{t('dashboard.appointmentsToday')}</span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-[var(--text-primary)]">{formatValue('appointmentsToday')}</span>
                  <Calendar className="text-[var(--color-primary)]" size={24} />
                </div>
              </div>
            )}
            {visibleCards.includes('pending') && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--text-secondary)]">{t('dashboard.pending')}</span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-[var(--text-primary)]">{formatValue('pending')}</span>
                  <Clock className="text-[var(--color-primary)]" size={24} />
                </div>
              </div>
            )}
            {showCalendarShortcut && (
              <Link
                to="/calendar"
                className="mt-1 flex items-center gap-2 border-t border-[var(--border)] pt-4 text-[var(--color-primary)] hover:underline"
              >
                <CalendarDays size={18} />
                <span>{t('calendar.shortcutTitle')}</span>
                <ArrowRight size={16} />
              </Link>
            )}
          </div>
        </GlassCard>
      )}
      {restOfCards.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {restOfCards.map((id) => {
            const { labelKey, Icon } = CARD_CONFIG[id]
            return (
              <GlassCard key={id}>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--text-secondary)]">{t(labelKey)}</span>
                  <Icon className="text-[var(--color-primary)]" size={24} />
                </div>
                <p className="mt-2 text-2xl font-bold text-[var(--text-primary)]">{formatValue(id)}</p>
              </GlassCard>
            )
          })}
        </div>
      )}

      {user?.role === ROLES.ADMIN && (
        <DashboardChartsSection />
      )}

      {user?.role === ROLES.COORDINADOR_PSICOLOGIA && token && (
        <DashboardCoordinatorPsychology />
      )}

      {user?.role === ROLES.COORDINADOR_ENFERMERIA && (
        <DashboardCoordinatorNursing />
      )}

      {user?.role === ROLES.PSICOLOGO && (
        <DashboardPsychologist />
      )}
    </div>
  )
}
