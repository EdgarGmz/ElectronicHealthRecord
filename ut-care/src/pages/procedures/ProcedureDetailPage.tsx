import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Stethoscope, User, FileText } from 'lucide-react'
import { GlassCard } from '@/components/atoms/GlassCard'
import { getNursingProcedureById } from '@/services/nursing-procedure.service'
import type { NursingProcedure } from '@/types/nursing-procedure'

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' })
}

function patientName(p: NursingProcedure): string {
  const patient = p.consultation?.medicalRecord?.patient
  if (!patient?.user) return '—'
  return `${patient.user.firstName} ${patient.user.lastName}`.trim()
}

export function ProcedureDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const [procedure, setProcedure] = useState<NursingProcedure | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(null)
    getNursingProcedureById(id)
      .then(setProcedure)
      .catch(() => setError(t('common.error')))
      .finally(() => setLoading(false))
  }, [id, t])

  if (loading) {
    return (
      <div className="space-y-6">
        <Link to="/procedures" className="inline-flex items-center gap-2 text-[var(--color-primary)] hover:underline">
          <ArrowLeft size={18} />
          {t('procedures.list')}
        </Link>
        <p className="py-8 text-center text-[var(--text-muted)]">{t('common.loading')}</p>
      </div>
    )
  }
  if (error || !procedure) {
    return (
      <div className="space-y-6">
        <Link to="/procedures" className="inline-flex items-center gap-2 text-[var(--color-primary)] hover:underline">
          <ArrowLeft size={18} />
          {t('procedures.list')}
        </Link>
        <GlassCard>
          <p className="text-[var(--color-error)]">{error || t('procedures.noProcedures')}</p>
        </GlassCard>
      </div>
    )
  }

  const performedByName = procedure.performedByUser
    ? `${procedure.performedByUser.firstName} ${procedure.performedByUser.lastName}`.trim()
    : '—'

  return (
    <div className="space-y-6">
      <Link to="/procedures" className="inline-flex items-center gap-2 text-[var(--color-primary)] hover:underline">
        <ArrowLeft size={18} />
        {t('procedures.list')}
      </Link>
      <GlassCard className="border-[var(--color-primary)]/20">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)]/15">
            <Stethoscope className="text-[var(--color-primary)]" size={28} />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">{procedure.procedureType}</h1>
            <p className="mt-1 text-[var(--text-secondary)]">{formatDateTime(procedure.procedureDate)}</p>
          </div>
        </div>
      </GlassCard>
      <div className="grid gap-4 sm:grid-cols-2">
        <GlassCard>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
            <User size={18} />
            {t('procedures.patient')}
          </h2>
          <p className="font-medium text-[var(--text-primary)]">{patientName(procedure)}</p>
        </GlassCard>
        <GlassCard>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
            <User size={18} />
            {t('procedures.performedBy')}
          </h2>
          <p className="font-medium text-[var(--text-primary)]">{performedByName}</p>
        </GlassCard>
      </div>
      <GlassCard>
        <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
          <FileText size={18} />
          {t('procedures.description')}
        </h2>
        <p className="whitespace-pre-wrap text-[var(--text-secondary)]">{procedure.description}</p>
      </GlassCard>
      {procedure.materialsUsed && (
        <GlassCard>
          <h2 className="mb-2 text-sm font-semibold text-[var(--text-primary)]">{t('procedures.materialsUsed')}</h2>
          <p className="whitespace-pre-wrap text-[var(--text-secondary)]">{procedure.materialsUsed}</p>
        </GlassCard>
      )}
      {procedure.observations && (
        <GlassCard>
          <h2 className="mb-2 text-sm font-semibold text-[var(--text-primary)]">{t('procedures.observations')}</h2>
          <p className="whitespace-pre-wrap text-[var(--text-secondary)]">{procedure.observations}</p>
        </GlassCard>
      )}
    </div>
  )
}
