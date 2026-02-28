import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react'
import { GlassCard } from '@/components/atoms/GlassCard'
import { getInterconsultations } from '@/services/interconsultation.service'
import type { Interconsultation } from '@/types/interconsultation'
import { STATUS_VALUES, URGENCY_VALUES, DEPARTMENT_VALUES } from '@/types/interconsultation'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { dateStyle: 'short' })
}

function patientName(i: Interconsultation): string {
  if (!i.patient?.user) return '—'
  return `${i.patient.user.firstName} ${i.patient.user.lastName}`.trim()
}

const STATUS_KEY: Record<string, string> = {
  Pendiente: 'statusPending',
  Respondida: 'statusResponded',
  Cancelada: 'statusCancelled',
}
const URGENCY_KEY: Record<string, string> = {
  Baja: 'urgencyLow',
  Media: 'urgencyMedium',
  Alta: 'urgencyHigh',
  Urgente: 'urgencyUrgent',
}

export function InterconsultationListPage() {
  const { t } = useTranslation()
  const [interconsultations, setInterconsultations] = useState<Interconsultation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState('')
  const [urgency, setUrgency] = useState('')
  const [fromDepartment, setFromDepartment] = useState('')
  const [toDepartment, setToDepartment] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 })

  useEffect(() => {
    setLoading(true)
    setError(null)
    getInterconsultations({
      page,
      limit: 10,
      status: status || undefined,
      urgency: urgency || undefined,
      fromDepartment: fromDepartment || undefined,
      toDepartment: toDepartment || undefined,
    })
      .then((r) => {
        setInterconsultations(r.interconsultations)
        setPagination(r.pagination)
      })
      .catch(() => setError(t('common.error')))
      .finally(() => setLoading(false))
  }, [page, status, urgency, fromDepartment, toDepartment, t])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('interconsultations.title')}</h1>
        <Link
          to="/interconsultations/new"
          className="glass-button inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-medium"
        >
          <Plus size={18} />
          {t('interconsultations.newInterconsultation')}
        </Link>
      </div>
      <GlassCard>
        <div className="mb-4 flex flex-wrap gap-3">
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1) }}
            className="glass-input w-full sm:w-40 px-4 py-2.5 text-sm"
          >
            <option value="">{t('interconsultations.status')}</option>
            {STATUS_VALUES.map((v) => (
              <option key={v} value={v}>{t(`interconsultations.${STATUS_KEY[v] || v}`)}</option>
            ))}
          </select>
          <select
            value={urgency}
            onChange={(e) => { setUrgency(e.target.value); setPage(1) }}
            className="glass-input w-full sm:w-40 px-4 py-2.5 text-sm"
          >
            <option value="">{t('interconsultations.urgency')}</option>
            {URGENCY_VALUES.map((v) => (
              <option key={v} value={v}>{t(`interconsultations.${URGENCY_KEY[v] || v}`)}</option>
            ))}
          </select>
          <select
            value={fromDepartment}
            onChange={(e) => { setFromDepartment(e.target.value); setPage(1) }}
            className="glass-input w-full sm:w-44 px-4 py-2.5 text-sm"
          >
            <option value="">{t('interconsultations.fromDepartment')}</option>
            {DEPARTMENT_VALUES.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
          <select
            value={toDepartment}
            onChange={(e) => { setToDepartment(e.target.value); setPage(1) }}
            className="glass-input w-full sm:w-44 px-4 py-2.5 text-sm"
          >
            <option value="">{t('interconsultations.toDepartment')}</option>
            {DEPARTMENT_VALUES.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>
        {error && <p className="mb-4 text-sm text-[var(--color-error)]">{error}</p>}
        {loading ? (
          <p className="py-8 text-center text-[var(--text-muted)]">{t('common.loading')}</p>
        ) : interconsultations.length === 0 ? (
          <p className="py-8 text-center text-[var(--text-secondary)]">{t('interconsultations.noInterconsultations')}</p>
        ) : (
          <>
            <div className="overflow-x-auto rounded-xl border border-[var(--glass-border)]">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-black/5 dark:bg-white/5">
                    <th className="px-4 py-3 font-medium text-[var(--text-primary)]">{t('interconsultations.patient')}</th>
                    <th className="px-4 py-3 font-medium text-[var(--text-primary)]">{t('interconsultations.fromDepartment')}</th>
                    <th className="px-4 py-3 font-medium text-[var(--text-primary)]">{t('interconsultations.toDepartment')}</th>
                    <th className="px-4 py-3 font-medium text-[var(--text-primary)]">{t('interconsultations.urgency')}</th>
                    <th className="px-4 py-3 font-medium text-[var(--text-primary)]">{t('interconsultations.status')}</th>
                    <th className="px-4 py-3 font-medium text-[var(--text-primary)]">Fecha</th>
                    <th className="w-24 px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {interconsultations.map((ic) => (
                    <tr
                      key={ic.id}
                      className="border-b border-[var(--border)] last:border-0 hover:bg-black/5 dark:hover:bg-white/5"
                    >
                      <td className="px-4 py-3 font-medium text-[var(--text-primary)]">{patientName(ic)}</td>
                      <td className="px-4 py-3 text-[var(--text-secondary)]">{ic.fromDepartment}</td>
                      <td className="px-4 py-3 text-[var(--text-secondary)]">{ic.toDepartment}</td>
                      <td className="px-4 py-3 text-[var(--text-secondary)]">{t(`interconsultations.${URGENCY_KEY[ic.urgency] || ic.urgency}`)}</td>
                      <td className="px-4 py-3 text-[var(--text-secondary)]">{t(`interconsultations.${STATUS_KEY[ic.status] || ic.status}`)}</td>
                      <td className="px-4 py-3 text-[var(--text-secondary)]">{formatDate(ic.createdAt)}</td>
                      <td className="px-4 py-3">
                        <Link
                          to={`/interconsultations/${ic.id}`}
                          className="inline-flex items-center gap-1 text-[var(--color-primary)] hover:underline"
                        >
                          <MessageSquare size={16} />
                          {t('interconsultations.viewDetail')}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {pagination.totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-4">
                <p className="text-sm text-[var(--text-muted)]">
                  {t('interconsultations.page')} {pagination.page} {t('interconsultations.of')} {pagination.totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="glass-button inline-flex items-center gap-1 disabled:opacity-50"
                  >
                    <ChevronLeft size={18} />
                    {t('interconsultations.previous')}
                  </button>
                  <button
                    type="button"
                    disabled={page >= pagination.totalPages}
                    onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                    className="glass-button inline-flex items-center gap-1 disabled:opacity-50"
                  >
                    {t('interconsultations.next')}
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </GlassCard>
    </div>
  )
}
