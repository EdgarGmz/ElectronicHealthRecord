import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Pill, FileText } from 'lucide-react'
import { GlassCard } from '@/components/atoms/GlassCard'
import { LoadingModal } from '@/components/molecules/LoadingModal'
import { ErrorModal } from '@/components/molecules/ErrorModal'
import { getMedicationById } from '@/services/medication.service'
import type { MedicationWithPrescriptions } from '@/types/medication'

export function MedicationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const [medication, setMedication] = useState<MedicationWithPrescriptions | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(null)
    getMedicationById(id)
      .then(setMedication)
      .catch(() => setError(t('common.error')))
      .finally(() => setLoading(false))
  }, [id, t])

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
        </div>
      </GlassCard>
      <GlassCard>
        <h2 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">{t('medications.category')}</h2>
        <dl className="space-y-2">
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
