import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Search, Plus, Pill, ChevronLeft, ChevronRight } from 'lucide-react'
import { GlassCard } from '@/components/atoms/GlassCard'
import { GlassButton } from '@/components/atoms/GlassButton'
import { LoadingModal } from '@/components/molecules/LoadingModal'
import { ErrorModal } from '@/components/molecules/ErrorModal'
import { getMedications } from '@/services/medication.service'
import type { Medication } from '@/types/medication'

export function MedicationListPage() {
  const { t } = useTranslation()
  const [medications, setMedications] = useState<Medication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [category, setCategory] = useState('')
  const [isActiveFilter, setIsActiveFilter] = useState<string>('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 })

  useEffect(() => {
    setLoading(true)
    setError(null)
    const isActive =
      isActiveFilter === 'true' ? true : isActiveFilter === 'false' ? false : undefined
    getMedications({
      page,
      limit: 10,
      search: search || undefined,
      category: category || undefined,
      isActive,
    })
      .then((r) => {
        setMedications(r.medications)
        setPagination(r.pagination)
      })
      .catch(() => setError(t('common.error')))
      .finally(() => setLoading(false))
  }, [page, search, category, isActiveFilter, t])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput.trim())
    setPage(1)
  }

  return (
    <div className="space-y-6">
      <LoadingModal open={loading} message={t('common.loading')} />
      <ErrorModal open={!!error} message={error ?? undefined} onClose={() => setError(null)} />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('medications.title')}</h1>
        <Link
          to="/medications/new"
          className="glass-button inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-medium"
        >
          <Plus size={18} />
          {t('medications.newMedication')}
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
              placeholder={t('medications.searchPlaceholder')}
              className="glass-input w-full pl-9 pr-4 py-2.5"
            />
          </div>
          <select
            value={isActiveFilter}
            onChange={(e) => {
              setIsActiveFilter(e.target.value)
              setPage(1)
            }}
            className="glass-input w-full sm:w-36 px-4 py-2.5"
          >
            <option value="">{t('medications.status')}</option>
            <option value="true">{t('medications.active')}</option>
            <option value="false">{t('medications.inactive')}</option>
          </select>
          <GlassButton type="submit">{t('common.search')}</GlassButton>
        </form>
        {loading ? null : medications.length === 0 ? (
          <p className="py-8 text-center text-[var(--text-secondary)]">{t('medications.noMedications')}</p>
        ) : (
          <>
            <div className="overflow-x-auto rounded-xl border border-[var(--glass-border)]">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-black/5 dark:bg-white/5">
                    <th className="px-4 py-3 font-medium text-[var(--text-primary)]">{t('medications.name')}</th>
                    <th className="px-4 py-3 font-medium text-[var(--text-primary)]">{t('medications.genericName')}</th>
                    <th className="px-4 py-3 font-medium text-[var(--text-primary)]">{t('medications.category')}</th>
                    <th className="px-4 py-3 font-medium text-[var(--text-primary)]">{t('medications.status')}</th>
                    <th className="w-24 px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {medications.map((med) => (
                    <tr
                      key={med.id}
                      className="border-b border-[var(--border)] last:border-0 hover:bg-black/5 dark:hover:bg-white/5"
                    >
                      <td className="px-4 py-3 font-medium text-[var(--text-primary)]">{med.name}</td>
                      <td className="px-4 py-3 text-[var(--text-secondary)]">{med.genericName}</td>
                      <td className="px-4 py-3 text-[var(--text-secondary)]">{med.category ?? '—'}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            med.isActive
                              ? 'bg-[var(--color-success)]/15 text-[var(--color-success)]'
                              : 'bg-[var(--text-muted)]/20 text-[var(--text-muted)]'
                          }`}
                        >
                          {med.isActive ? t('medications.active') : t('medications.inactive')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          to={`/medications/${med.id}`}
                          className="inline-flex items-center gap-1 text-[var(--color-primary)] hover:underline"
                        >
                          <Pill size={16} />
                          {t('medications.viewDetail')}
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
                  {t('medications.page')} {pagination.page} {t('medications.of')} {pagination.totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="glass-button inline-flex items-center gap-1 disabled:opacity-50"
                  >
                    <ChevronLeft size={18} />
                    {t('medications.previous')}
                  </button>
                  <button
                    type="button"
                    disabled={page >= pagination.totalPages}
                    onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                    className="glass-button inline-flex items-center gap-1 disabled:opacity-50"
                  >
                    {t('medications.next')}
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
