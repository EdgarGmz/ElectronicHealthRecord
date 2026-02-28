import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Search, Plus, Stethoscope, ChevronLeft, ChevronRight } from 'lucide-react'
import { GlassCard } from '@/components/atoms/GlassCard'
import { GlassButton } from '@/components/atoms/GlassButton'
import { getNursingProcedures } from '@/services/nursing-procedure.service'
import type { NursingProcedure } from '@/types/nursing-procedure'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { dateStyle: 'short' })
}

function patientName(p: NursingProcedure): string {
  const patient = p.consultation?.medicalRecord?.patient
  if (!patient?.user) return '—'
  return `${patient.user.firstName} ${patient.user.lastName}`.trim()
}

function performedByName(p: NursingProcedure): string {
  if (!p.performedByUser) return '—'
  return `${p.performedByUser.firstName} ${p.performedByUser.lastName}`.trim()
}

export function ProcedureListPage() {
  const { t } = useTranslation()
  const [procedures, setProcedures] = useState<NursingProcedure[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [procedureType, setProcedureType] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 })

  useEffect(() => {
    setLoading(true)
    setError(null)
    getNursingProcedures({
      page,
      limit: 10,
      search: search || undefined,
      procedureType: procedureType || undefined,
    })
      .then((r) => {
        setProcedures(r.procedures)
        setPagination(r.pagination)
      })
      .catch(() => setError(t('common.error')))
      .finally(() => setLoading(false))
  }, [page, search, procedureType, t])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput.trim())
    setPage(1)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('procedures.title')}</h1>
        <Link
          to="/procedures/new"
          className="glass-button inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-medium"
        >
          <Plus size={18} />
          {t('procedures.newProcedure')}
        </Link>
      </div>
      <GlassCard>
        <form onSubmit={handleSearchSubmit} className="mb-4 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t('procedures.searchPlaceholder')}
              className="glass-input w-full pl-9 pr-4 py-2.5"
            />
          </div>
          <input
            type="text"
            value={procedureType}
            onChange={(e) => { setProcedureType(e.target.value); setPage(1) }}
            placeholder={t('procedures.procedureType')}
            className="glass-input w-full sm:w-48 px-4 py-2.5"
          />
          <GlassButton type="submit">{t('common.search')}</GlassButton>
        </form>
        {error && <p className="mb-4 text-sm text-[var(--color-error)]">{error}</p>}
        {loading ? (
          <p className="py-8 text-center text-[var(--text-muted)]">{t('common.loading')}</p>
        ) : procedures.length === 0 ? (
          <p className="py-8 text-center text-[var(--text-secondary)]">{t('procedures.noProcedures')}</p>
        ) : (
          <>
            <div className="overflow-x-auto rounded-xl border border-[var(--glass-border)]">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-black/5 dark:bg-white/5">
                    <th className="px-4 py-3 font-medium text-[var(--text-primary)]">{t('procedures.procedureType')}</th>
                    <th className="px-4 py-3 font-medium text-[var(--text-primary)]">{t('procedures.patient')}</th>
                    <th className="px-4 py-3 font-medium text-[var(--text-primary)]">{t('procedures.procedureDate')}</th>
                    <th className="px-4 py-3 font-medium text-[var(--text-primary)]">{t('procedures.performedBy')}</th>
                    <th className="w-24 px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {procedures.map((proc) => (
                    <tr
                      key={proc.id}
                      className="border-b border-[var(--border)] last:border-0 hover:bg-black/5 dark:hover:bg-white/5"
                    >
                      <td className="px-4 py-3 font-medium text-[var(--text-primary)]">{proc.procedureType}</td>
                      <td className="px-4 py-3 text-[var(--text-secondary)]">{patientName(proc)}</td>
                      <td className="px-4 py-3 text-[var(--text-secondary)]">{formatDate(proc.procedureDate)}</td>
                      <td className="px-4 py-3 text-[var(--text-secondary)]">{performedByName(proc)}</td>
                      <td className="px-4 py-3">
                        <Link
                          to={`/procedures/${proc.id}`}
                          className="inline-flex items-center gap-1 text-[var(--color-primary)] hover:underline"
                        >
                          <Stethoscope size={16} />
                          {t('procedures.viewDetail')}
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
                  {t('procedures.page')} {pagination.page} {t('procedures.of')} {pagination.totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="glass-button inline-flex items-center gap-1 disabled:opacity-50"
                  >
                    <ChevronLeft size={18} />
                    {t('procedures.previous')}
                  </button>
                  <button
                    type="button"
                    disabled={page >= pagination.totalPages}
                    onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                    className="glass-button inline-flex items-center gap-1 disabled:opacity-50"
                  >
                    {t('procedures.next')}
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
