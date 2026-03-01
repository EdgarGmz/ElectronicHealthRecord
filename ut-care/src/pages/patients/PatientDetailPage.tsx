import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, User, Mail, Hash, BookOpen } from 'lucide-react'
import { GlassCard } from '@/components/atoms/GlassCard'
import { LoadingModal } from '@/components/molecules/LoadingModal'
import { ErrorModal } from '@/components/molecules/ErrorModal'
import { getPatientById } from '@/services/patient.service'
import type { Patient } from '@/types/patient'

export function PatientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(null)
    getPatientById(id).then(setPatient).catch(() => setError(t('common.error'))).finally(() => setLoading(false))
  }, [id, t])

  const fullName = patient ? `${patient.user.firstName} ${patient.user.lastName}`.trim() : ''
  return (
    <div className="space-y-6">
      <LoadingModal open={loading} message={t('common.loading')} />
      <ErrorModal open={!!error} message={error ?? t('patients.noPatients')} onClose={() => setError(null)} />
      <Link to="/patients" className="inline-flex items-center gap-2 text-[var(--color-primary)] hover:underline">
        <ArrowLeft size={18} />
        {t('patients.list')}
      </Link>
      {!patient && !loading && (
        <GlassCard>
          <p className="text-[var(--text-secondary)]">{t('patients.noPatients')}</p>
        </GlassCard>
      )}
      {patient && (
      <>
      <GlassCard className="border-[var(--color-primary)]/20">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)]/15">
            <User className="text-[var(--color-primary)]" size={28} />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">{fullName}</h1>
            <p className="mt-1 text-[var(--text-secondary)]">
              {t(`patients.${patient.patientType}`) || patient.patientType} · {patient.career.name}
            </p>
          </div>
        </div>
      </GlassCard>
      <div className="grid gap-4 sm:grid-cols-2">
        <GlassCard>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
            <Mail size={18} />
            {t('patients.email')}
          </h2>
          <p className="text-[var(--text-secondary)]">{patient.user.email}</p>
        </GlassCard>
        <GlassCard>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
            <Hash size={18} />
            {t('patients.enrollment')}
          </h2>
          <p className="text-[var(--text-secondary)]">{patient.user.enrollmentNumber ?? '—'}</p>
        </GlassCard>
      </div>
      <GlassCard>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
          <BookOpen size={18} />
          Expediente médico
        </h2>
        <p className="text-sm text-[var(--text-muted)]">Módulo de expediente en construcción.</p>
      </GlassCard>
      </>
      )}
    </div>
  )
}
