import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Pill, FileText, BarChart3, Pencil, Power, PowerOff } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { GlassCard } from '@/components/atoms/GlassCard'
import { GlassButton } from '@/components/atoms/GlassButton'
import { LoadingModal } from '@/components/molecules/LoadingModal'
import { ErrorModal } from '@/components/molecules/ErrorModal'
import { getMedicationById, getMedicationConsumption, updateMedication, type MedicationConsumptionItem } from '@/services/medication.service'
import type { MedicationWithPrescriptions } from '@/types/medication'
import { useAuthStore } from '@/store/auth.store'
import { ROLES_CAN_MANAGE_MEDICATIONS } from '@/constants/roles'

export function MedicationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const role = user?.role?.toLowerCase()?.trim() ?? ''
  const canManage = role ? ROLES_CAN_MANAGE_MEDICATIONS.includes(role) : false
  const [medication, setMedication] = useState<MedicationWithPrescriptions | null>(null)
  const [consumption, setConsumption] = useState<MedicationConsumptionItem[]>([])
  const [consumptionLoading, setConsumptionLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(null)
    getMedicationById(id)
      .then(setMedication)
      .catch(() => setError(t('common.error')))
      .finally(() => setLoading(false))
  }, [id, t])

  const refresh = async () => {
    if (!id) return
    const m = await getMedicationById(id)
    setMedication(m)
  }

  const toggleActive = async () => {
    if (!id || !medication) return
    setUpdating(true)
    try {
      await updateMedication(id, { isActive: !medication.isActive })
      await refresh()
    } catch {
      setError(t('common.error'))
    } finally {
      setUpdating(false)
    }
  }

  useEffect(() => {
    if (!id) return
    setConsumptionLoading(true)
    getMedicationConsumption(id)
      .then(setConsumption)
      .catch(() => setConsumption([]))
      .finally(() => setConsumptionLoading(false))
  }, [id])

  const getStockLevel = (stock: number): 'low' | 'medium' | 'high' => {
    if (stock <= 10) return 'low'
    if (stock <= 30) return 'medium'
    return 'high'
  }
  const stockLevelClasses: Record<'low' | 'medium' | 'high', string> = {
    low: 'bg-red-500/20 text-red-700 dark:text-red-300 border border-red-500/40',
    medium: 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40',
    high: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40',
  }
  const stockLevelLabels = {
    low: t('medications.stockLow'),
    medium: t('medications.stockMedium'),
    high: t('medications.stockHigh'),
  }

  /** Formatea YYYY-MM a "Ene 2025" para el eje X */
  const formatPeriodLabel = (period: string) => {
    const [y, m] = period.split('-')
    const monthIndex = parseInt(m, 10) - 1
    const date = new Date(parseInt(y, 10), monthIndex, 1)
    return date.toLocaleDateString(undefined, { month: 'short', year: '2-digit' })
  }
  const chartData = consumption.map((item) => ({
    ...item,
    label: formatPeriodLabel(item.period),
  }))
  const totalAdministrations = consumption.reduce((sum, item) => sum + item.count, 0)

  const infoRows: { label: string; value: string | null | undefined }[] = medication
    ? [
        { label: t('medications.genericName'), value: medication.genericName },
        { label: t('medications.category'), value: medication.category },
        { label: t('medications.dosageForms'), value: medication.dosageForms },
        { label: t('medications.commonDosages'), value: medication.commonDosages },
        { label: t('medications.administrationRoutes'), value: medication.administrationRoutes },
      ]
    : []

  return (
    <div className="space-y-6">
      <LoadingModal open={loading} message={t('common.loading')} />
      <ErrorModal open={!!error} message={error ?? t('medications.noMedications')} onClose={() => setError(null)} />
      <Link to="/medications" className="inline-flex items-center gap-2 text-[var(--color-primary)] hover:underline">
        <ArrowLeft size={18} />
        {t('medications.list')}
      </Link>
      {!medication && !loading && (
        <GlassCard>
          <p className="text-[var(--text-secondary)]">{t('medications.noMedications')}</p>
        </GlassCard>
      )}
      {medication && (
      <>
      <GlassCard className="border-[var(--color-primary)]/20">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)]/15">
            <Pill className="text-[var(--color-primary)]" size={28} />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">{medication.name}</h1>
            <p className="mt-1 text-[var(--text-secondary)]">{medication.genericName}</p>
            <span
              className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                medication.isActive
                  ? 'bg-[var(--color-success)]/15 text-[var(--color-success)]'
                  : 'bg-[var(--text-muted)]/20 text-[var(--text-muted)]'
              }`}
            >
              {medication.isActive ? t('medications.active') : t('medications.inactive')}
            </span>
          </div>
          {canManage && (
            <div className="flex shrink-0 flex-row items-center justify-end gap-2">
              <GlassButton
                type="button"
                variant="glass"
                onClick={() => navigate(`/medications/${medication.id}/edit`)}
                disabled={updating}
                title={t('common.edit', 'Editar')}
              >
                <Pencil size={18} />
              </GlassButton>
              <GlassButton
                type="button"
                variant={medication.isActive ? 'glass' : 'primary'}
                onClick={() => void toggleActive()}
                disabled={updating}
                title={medication.isActive ? t('common.deactivate', 'Desactivar') : t('common.activate', 'Activar')}
              >
                {medication.isActive ? <PowerOff size={18} /> : <Power size={18} />}
              </GlassButton>
            </div>
          )}
        </div>
      </GlassCard>
      <GlassCard>
        <h2 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">{t('medications.category')}</h2>
        <dl className="space-y-2">
          <div>
            <dt className="text-xs text-[var(--text-muted)]">{t('medications.stock')}</dt>
            <dd className="mt-0.5">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${stockLevelClasses[getStockLevel(medication.stock ?? 0)]}`}>
                <span>{medication.stock ?? 0}</span>
                <span className="opacity-90">·</span>
                <span>{stockLevelLabels[getStockLevel(medication.stock ?? 0)]}</span>
              </span>
            </dd>
          </div>
          {infoRows.map(({ label, value }) => (
            <div key={label}>
              <dt className="text-xs text-[var(--text-muted)]">{label}</dt>
              <dd className="text-[var(--text-secondary)]">{value ?? '—'}</dd>
            </div>
          ))}
        </dl>
      </GlassCard>
      {medication.contraindications && (
        <GlassCard>
          <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
            <FileText size={18} />
            {t('medications.contraindications')}
          </h2>
          <p className="whitespace-pre-wrap text-[var(--text-secondary)]">{medication.contraindications}</p>
        </GlassCard>
      )}
      {medication.sideEffects && (
        <GlassCard>
          <h2 className="mb-2 text-sm font-semibold text-[var(--text-primary)]">{t('medications.sideEffects')}</h2>
          <p className="whitespace-pre-wrap text-[var(--text-secondary)]">{medication.sideEffects}</p>
        </GlassCard>
      )}
      <GlassCard>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
          <BarChart3 size={18} className="text-[var(--color-primary)]" />
          {t('medications.consumptionHistory')}
        </h2>
        {consumptionLoading ? (
          <div className="flex h-64 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg)]/30">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent" />
          </div>
        ) : chartData.length > 0 ? (
          <>
            <p className="mb-4 text-sm text-[var(--text-muted)]">
              {t('medications.totalAdministrations')}: <strong className="text-[var(--text-primary)]">{totalAdministrations}</strong>
            </p>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="label" stroke="var(--text-muted)" fontSize={11} />
                  <YAxis stroke="var(--text-muted)" fontSize={11} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--glass-bg)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                    }}
                    formatter={(value: unknown) => {
                      const n = typeof value === 'number' ? value : Number(value ?? 0)
                      return [Number.isFinite(n) ? n : 0, t('medications.consumptionByMonth')]
                    }}
                    labelFormatter={(label) => label}
                  />
                  <Bar dataKey="count" fill="var(--color-primary)" radius={[4, 4, 0, 0]} name={t('medications.consumptionByMonth')} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        ) : (
          <p className="py-8 text-center text-sm text-[var(--text-muted)]">{t('patients.noHistoryData')}</p>
        )}
      </GlassCard>
      {medication.prescriptions && medication.prescriptions.length > 0 && (
        <GlassCard>
          <h2 className="mb-2 text-sm font-semibold text-[var(--text-primary)]">{t('medications.recentPrescriptions')}</h2>
          <ul className="space-y-1 text-sm text-[var(--text-secondary)]">
            {medication.prescriptions.map((p) => {
              const name =
                p.patient?.user?.firstName && p.patient?.user?.lastName
                  ? `${p.patient.user.firstName} ${p.patient.user.lastName}`.trim()
                  : '—'
              return <li key={p.id}>{name}</li>
            })}
          </ul>
        </GlassCard>
      )}
      </>
      )}
    </div>
  )
}
