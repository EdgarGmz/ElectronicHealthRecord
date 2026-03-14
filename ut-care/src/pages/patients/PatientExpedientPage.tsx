import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft,
  User,
  Droplets,
  Brain,
  Stethoscope,
  Phone,
  Calendar,
} from 'lucide-react'
import { EmailLink } from '@/components/atoms/EmailLink'
import { GlassCard } from '@/components/atoms/GlassCard'
import { PhoneWhatsAppLink } from '@/components/atoms/PhoneWhatsAppLink'
import { LoadingModal } from '@/components/molecules/LoadingModal'
import { ErrorModal } from '@/components/molecules/ErrorModal'
import { getMedicalRecordByPatientId } from '@/services/medical-record.service'
import type { MedicalRecord, NursingConsultation } from '@/types/medical-record'

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  try {
    const d = new Date(iso)
    return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString(undefined, { dateStyle: 'medium' })
  } catch {
    return String(iso)
  }
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })
}

function nurseName(n: NursingConsultation): string {
  const u = n.nurse
  return u ? `${u.firstName} ${u.lastName}`.trim() : '—'
}

export function PatientExpedientPage() {
  const { id: patientId } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const [record, setRecord] = useState<MedicalRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!patientId) return
    setLoading(true)
    setError(null)
    setNotFound(false)
    getMedicalRecordByPatientId(patientId)
      .then(setRecord)
      .catch((err) => {
        if (err.response?.status === 404) setNotFound(true)
        else setError(t('expedient.error'))
      })
      .finally(() => setLoading(false))
  }, [patientId, t])

  const patient = record?.patient
  const fullName = patient
    ? `${patient.user.firstName} ${patient.user.lastName}`.trim()
    : ''

  return (
    <div className="space-y-6">
      <LoadingModal open={loading} message={t('common.loading')} />
      <ErrorModal open={!!error} message={error ?? undefined} onClose={() => setError(null)} />
      <Link
        to={patientId ? `/patients/${patientId}` : '/patients'}
        className="inline-flex items-center gap-2 text-[var(--color-primary)] hover:underline"
      >
        <ArrowLeft size={18} />
        {t('expedient.backToPatient')}
      </Link>

      {notFound && !record && (
        <GlassCard className="border-amber-500/30">
          <p className="text-[var(--text-secondary)]">{t('expedient.noRecord')}</p>
          <p className="mt-2 text-sm text-[var(--text-muted)]">{t('expedient.createRecord')}</p>
        </GlassCard>
      )}

      {record && patient && (
        <>
          <GlassCard className="border-[var(--color-primary)]/20">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)]/15">
                <User className="text-[var(--color-primary)]" size={28} />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl font-bold text-[var(--text-primary)]">{fullName}</h1>
                <p className="mt-1 text-[var(--text-secondary)]">
                  {t('expedient.title')} · <EmailLink email={patient.user.email} />
                </p>
                {patient.user.enrollmentNumber && (
                  <p className="mt-0.5 text-sm text-[var(--text-muted)]">
                    {t('patients.enrollment')}: {patient.user.enrollmentNumber}
                  </p>
                )}
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
              <Droplets size={18} />
              {t('expedient.generalData')}
            </h2>
            <dl className="grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-[var(--text-muted)]">{t('expedient.bloodType')}</dt>
                <dd className="text-[var(--text-primary)]">{record.bloodType ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--text-muted)]">{t('expedient.allergies')}</dt>
                <dd className="text-[var(--text-primary)] whitespace-pre-wrap">{record.allergies ?? '—'}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-[var(--text-muted)]">{t('expedient.chronicConditions')}</dt>
                <dd className="text-[var(--text-primary)] whitespace-pre-wrap">{record.chronicConditions ?? '—'}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-[var(--text-muted)]">{t('expedient.currentMedications')}</dt>
                <dd className="text-[var(--text-primary)] whitespace-pre-wrap">{record.currentMedications ?? '—'}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-[var(--text-muted)]">{t('expedient.familyHistory')}</dt>
                <dd className="text-[var(--text-primary)] whitespace-pre-wrap">{record.familyHistory ?? '—'}</dd>
              </div>
              {record.notes && (
                <div className="sm:col-span-2">
                  <dt className="text-xs text-[var(--text-muted)]">{t('expedient.notes')}</dt>
                  <dd className="text-[var(--text-primary)] whitespace-pre-wrap">{record.notes}</dd>
                </div>
              )}
            </dl>
            {(record.createdByUser || record.updatedByUser) && (
              <div className="mt-4 pt-4 border-t border-[var(--border)] text-xs text-[var(--text-muted)]">
                {record.createdByUser && (
                  <span>{t('expedient.createdBy')}: {record.createdByUser.firstName} {record.createdByUser.lastName}</span>
                )}
                {record.updatedByUser && (
                  <span className="ml-4">{t('expedient.updatedBy')}: {record.updatedByUser.firstName} {record.updatedByUser.lastName}</span>
                )}
              </div>
            )}
          </GlassCard>

          {record.psychologyRecord ? (
            <GlassCard>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
                <Brain size={18} />
                {t('expedient.psychologyRecord')}
              </h2>
              <dl className="space-y-2">
                {record.psychologyRecord.assignedPsychologist && (
                  <div>
                    <dt className="text-xs text-[var(--text-muted)]">{t('expedient.assignedPsychologist')}</dt>
                    <dd className="text-[var(--text-primary)]">
                      {record.psychologyRecord.assignedPsychologist.firstName} {record.psychologyRecord.assignedPsychologist.lastName}
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-xs text-[var(--text-muted)]">{t('expedient.chiefComplaint')}</dt>
                  <dd className="text-[var(--text-primary)] whitespace-pre-wrap">{record.psychologyRecord.chiefComplaint ?? '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs text-[var(--text-muted)]">{t('expedient.psychologicalHistory')}</dt>
                  <dd className="text-[var(--text-primary)] whitespace-pre-wrap">{record.psychologyRecord.psychologicalHistory ?? '—'}</dd>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs text-[var(--text-muted)]">{t('expedient.currentDiagnosisDsm5')}</dt>
                    <dd className="text-[var(--text-primary)]">{record.psychologyRecord.currentDiagnosisDsm5 ?? '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-[var(--text-muted)]">{t('expedient.currentDiagnosisCie10')}</dt>
                    <dd className="text-[var(--text-primary)]">{record.psychologyRecord.currentDiagnosisCie10 ?? '—'}</dd>
                  </div>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs text-[var(--text-muted)]">{t('expedient.suicideRiskLevel')}</dt>
                    <dd className="text-[var(--text-primary)]">{record.psychologyRecord.suicideRiskLevel}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-[var(--text-muted)]">{t('expedient.violenceRiskLevel')}</dt>
                    <dd className="text-[var(--text-primary)]">{record.psychologyRecord.violenceRiskLevel}</dd>
                  </div>
                </div>
                {record.psychologyRecord.supportNetwork && (
                  <div>
                    <dt className="text-xs text-[var(--text-muted)]">{t('expedient.supportNetwork')}</dt>
                    <dd className="text-[var(--text-primary)] whitespace-pre-wrap">{record.psychologyRecord.supportNetwork}</dd>
                  </div>
                )}
                <div className="text-xs text-[var(--text-muted)]">
                  {t('expedient.consultationDate')} evaluación inicial: {formatDate(record.psychologyRecord.initialEvaluationDate)}
                </div>
              </dl>
            </GlassCard>
          ) : (
            <GlassCard>
              <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
                <Brain size={18} />
                {t('expedient.psychology')}
              </h2>
              <p className="text-sm text-[var(--text-muted)]">{t('expedient.noPsychologyRecord')}</p>
            </GlassCard>
          )}

          <GlassCard>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
              <Stethoscope size={18} />
              {t('expedient.lastConsultations')}
            </h2>
            {record.nursingConsultations.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">{t('expedient.noNursingConsultations')}</p>
            ) : (
              <ul className="space-y-4">
                {record.nursingConsultations.map((c) => (
                  <li key={c.id} className="rounded-xl border border-[var(--border)] bg-black/5 dark:bg-white/5 p-4">
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <Calendar size={16} className="text-[var(--text-muted)]" />
                      <span className="font-medium text-[var(--text-primary)]">{formatDateTime(c.consultationDate)}</span>
                      <span className="text-[var(--text-muted)]">·</span>
                      <span className="text-[var(--text-secondary)]">{t('expedient.nurse')}: {nurseName(c)}</span>
                    </div>
                    {c.chiefComplaint && (
                      <p className="mt-2 text-sm text-[var(--text-secondary)]"><strong>{t('expedient.chiefComplaint')}:</strong> {c.chiefComplaint}</p>
                    )}
                    {(c.vitalSignsTemperature != null || c.vitalSignsBloodPressureSys != null || c.vitalSignsHeartRate != null) && (
                      <p className="mt-1 text-xs text-[var(--text-muted)]">
                        {t('expedient.vitalSigns')}:
                        {c.vitalSignsTemperature != null && ` ${t('expedient.temperature')} ${c.vitalSignsTemperature}°C`}
                        {(c.vitalSignsBloodPressureSys != null || c.vitalSignsBloodPressureDia != null) && ` · ${t('expedient.bloodPressure')} ${c.vitalSignsBloodPressureSys ?? '?'}/${c.vitalSignsBloodPressureDia ?? '?'}`}
                        {c.vitalSignsHeartRate != null && ` · ${t('expedient.heartRate')} ${c.vitalSignsHeartRate}`}
                      </p>
                    )}
                    {c.diagnosis && <p className="mt-1 text-sm text-[var(--text-secondary)]"><strong>{t('expedient.diagnosis')}:</strong> {c.diagnosis}</p>}
                    {c.treatmentPlan && <p className="mt-1 text-sm text-[var(--text-secondary)]"><strong>{t('expedient.treatmentPlan')}:</strong> {c.treatmentPlan}</p>}
                  </li>
                ))}
              </ul>
            )}
          </GlassCard>

          {patient.emergencyContacts.length > 0 && (
            <GlassCard>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
                <Phone size={18} />
                {t('expedient.emergencyContacts')}
              </h2>
              <ul className="space-y-2">
                {patient.emergencyContacts.map((ec) => (
                  <li key={ec.id} className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="font-medium text-[var(--text-primary)]">{ec.name}</span>
                    <span className="text-[var(--text-muted)]">{ec.relationship}</span>
                    {ec.phone ? (
                      <PhoneWhatsAppLink phone={ec.phone} className="text-[var(--text-secondary)]" />
                    ) : (
                      <span className="text-[var(--text-secondary)]">—</span>
                    )}
                    {ec.phoneSecondary ? (
                      <>
                        {' '}
                        <PhoneWhatsAppLink phone={ec.phoneSecondary} className="text-[var(--text-muted)]" />
                      </>
                    ) : null}
                  </li>
                ))}
              </ul>
            </GlassCard>
          )}
        </>
      )}
    </div>
  )
}
