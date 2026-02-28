import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Search, UserPlus, FileText, ChevronLeft, ChevronRight } from 'lucide-react'
import { GlassCard } from '@/components/atoms/GlassCard'
import { GlassButton } from '@/components/atoms/GlassButton'
import { getPatients } from '@/services/patient.service'
import type { Patient } from '@/types/patient'

const PATIENT_TYPES = ['student', 'faculty', 'administrative'] as const

export function PatientListPage() {
  const { t } = useTranslation()
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [patientType, setPatientType] = useState<string>('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 })

  useEffect(() => {
    setLoading(true)
    setError(null)
    getPatients({ page, limit: 10, search: search || undefined, patientType: patientType || undefined })
      .then((r) => {
        setPatients(r.patients)
        setPagination(r.pagination)
      })
      .catch(() => setError(t('common.error')))
      .finally(() => setLoading(false))
  }, [page, search, patientType, t])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput.trim())
    setPage(1)
  }

  const fullName = (p: Patient) => `${p.user.firstName} ${p.user.lastName}`.trim()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('patients.title')}</h1>
        <Link to="/patients/new" className="glass-button inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-medium">
          <UserPlus size={18} />
          {t('patients.newPatient')}
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
              placeholder={t('patients.searchPlaceholder')}
              className="glass-input w-full pl-9 pr-4 py-2.5"
            />
          </div>
          <select
            value={patientType}
            onChange={(e) => { setPatientType(e.target.value); setPage(1) }}
            className="glass-input w-full sm:w-44 px-4 py-2.5"
          >
            <option value="">{t('patients.typeAll')}</option>
            {PATIENT_TYPES.map((type) => (
              <option key={type} value={type}>{t(`patients.${type}`)}</option>
            ))}
          </select>
          <GlassButton type="submit">{t('common.search')}</GlassButton>
        </form>
        {error && <p className="mb-4 text-sm text-[var(--color-error)]">{error}</p>}
        {loading ? (
          <p className="py-8 text-center text-[var(--text-muted)]">{t('common.loading')}</p>
        ) : patients.length === 0 ? (
          <p className="py-8 text-center text-[var(--text-secondary)]">{t('patients.noPatients')}</p>
        ) : (
          <>
            <div className="overflow-x-auto rounded-xl border border-[var(--glass-border)]">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-black/5 dark:bg-white/5">
                    <th className="px-4 py-3 font-medium text-[var(--text-primary)]">{t('nav.patients')}</th>
                    <th className="px-4 py-3 font-medium text-[var(--text-primary)]">{t('patients.email')}</th>
                    <th className="px-4 py-3 font-medium text-[var(--text-primary)]">{t('patients.enrollment')}</th>
                    <th className="px-4 py-3 font-medium text-[var(--text-primary)]">{t('patients.type')}</th>
                    <th className="px-4 py-3 font-medium text-[var(--text-primary)]">{t('patients.career')}</th>
                    <th className="w-24 px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {patients.map((patient) => (
                    <tr key={patient.id} className="border-b border-[var(--border)] last:border-0 hover:bg-black/5 dark:hover:bg-white/5">
                      <td className="px-4 py-3 font-medium text-[var(--text-primary)]">{fullName(patient)}</td>
                      <td className="px-4 py-3 text-[var(--text-secondary)]">{patient.user.email}</td>
                      <td className="px-4 py-3 text-[var(--text-secondary)]">{patient.user.enrollmentNumber ?? '—'}</td>
                      <td className="px-4 py-3 text-[var(--text-secondary)]">{t(`patients.${patient.patientType}`) || patient.patientType}</td>
                      <td className="px-4 py-3 text-[var(--text-secondary)]">{patient.career.name}</td>
                      <td className="px-4 py-3">
                        <Link to={`/patients/${patient.id}`} className="inline-flex items-center gap-1 text-[var(--color-primary)] hover:underline">
                          <FileText size={16} />
                          {t('patients.viewRecord')}
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
                  {t('patients.page')} {pagination.page} {t('patients.of')} {pagination.totalPages} ({pagination.total})
                </p>
                <div className="flex gap-2">
                  <GlassButton disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="inline-flex items-center gap-1">
                    <ChevronLeft size={18} />
                    {t('patients.previous')}
                  </GlassButton>
                  <GlassButton disabled={page >= pagination.totalPages} onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))} className="inline-flex items-center gap-1">
                    {t('patients.next')}
                    <ChevronRight size={18} />
                  </GlassButton>
                </div>
              </div>
            )}
          </>
        )}
      </GlassCard>
    </div>
  )
}
