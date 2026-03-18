import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, X } from 'lucide-react'
import { GlassCard } from '@/components/atoms/GlassCard'
import { GlassButton } from '@/components/atoms/GlassButton'
import { LoadingModal } from '@/components/molecules/LoadingModal'
import { ErrorModal } from '@/components/molecules/ErrorModal'
import { SuccessModal } from '@/components/molecules/SuccessModal'
import {
  createNotification,
  getNotificationRecipients,
  getAllNotificationRecipients,
  getRecentPrescriptions,
} from '@/services/notification.service'
import { getAppointments } from '@/services/appointment.service'
import { getMedications } from '@/services/medication.service'
import { getInterconsultations } from '@/services/interconsultation.service'
import type { CreateNotificationInput } from '@/types/notification'
import { NOTIFICATION_PRIORITIES } from '@/types/notification'
import type { Appointment } from '@/types/appointment'
import type { Interconsultation } from '@/types/interconsultation'
import type { Medication } from '@/types/medication'
import type { User } from '@/types/user'
import { useAuthStore } from '@/store/auth.store'
import { ROLES } from '@/constants/roles'

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

export function NewNotificationPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [createdId, setCreatedId] = useState<string | null>(null)
  const [sentToName, setSentToName] = useState('')
  const [sentAtLabel, setSentAtLabel] = useState('')
  const [form, setForm] = useState<CreateNotificationInput & { title: string }>({
    userId: '',
    type: '',
    title: '',
    message: '',
    priority: 'normal',
    relatedEntityType: '',
    relatedEntityId: '',
  })

  const currentUser = useAuthStore((s) => s.user)
  const currentUserId = currentUser?.id
  const wrapperRef = useRef<HTMLDivElement | null>(null)

  const [recipientOpen, setRecipientOpen] = useState(false)
  const [recipientDisplay, setRecipientDisplay] = useState('')
  const [recipientLoading, setRecipientLoading] = useState(false)
  const [recipientCandidates, setRecipientCandidates] = useState<User[]>([])
  const [allRecipientsLoaded, setAllRecipientsLoaded] = useState(false)
  const [allRecipients, setAllRecipients] = useState<User[]>([])

  const [relatedEntityTypeOptions] = useState<Array<{ value: string; label: string }>>([
    { value: 'appointment', label: 'appointment (cita)' },
    { value: 'prescription', label: 'prescription (prescripción)' },
    { value: 'medication', label: 'medication (medicamento)' },
    { value: 'interconsultation', label: 'interconsultation (interconsulta)' },
  ])

  const [entityOptions, setEntityOptions] = useState<Array<{ id: string; label: string }>>([])
  const [entityOptionsLoading, setEntityOptionsLoading] = useState(false)

  const isUuid = (value: string): boolean => {
    const v = value.trim()
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v)
  }

  const relatedEntityTypeValue = form.relatedEntityType?.trim() ?? ''
  const relatedEntityIdValue = form.relatedEntityId?.trim() ?? ''

  const destinationUser = useMemo(() => {
    const id = form.userId?.trim()
    if (!id) return null
    return (
      allRecipients.find((u) => u.id === id) ||
      recipientCandidates.find((u) => u.id === id) ||
      null
    )
  }, [form.userId, allRecipients, recipientCandidates])

  const destinationName =
    destinationUser && destinationUser.firstName && destinationUser.lastName
      ? `${destinationUser.firstName} ${destinationUser.lastName}`
      : ''

  const recipientFiltered = useMemo(() => {
    const q = recipientDisplay.trim().toLowerCase()
    if (!q) return recipientCandidates.slice(0, 10)
    return recipientCandidates
      .filter((u) => {
        const fullName = `${u.firstName} ${u.lastName}`.toLowerCase()
        return fullName.includes(q) || (u.email?.toLowerCase?.().includes(q) ?? false) || u.id.toLowerCase().includes(q)
      })
      .slice(0, 10)
  }, [recipientCandidates, recipientDisplay])

  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (!recipientOpen) return
      if (!wrapperRef.current) return
      const target = e.target as Node | null
      if (target && !wrapperRef.current.contains(target)) setRecipientOpen(false)
    }
    window.addEventListener('mousedown', onMouseDown)
    return () => window.removeEventListener('mousedown', onMouseDown)
  }, [recipientOpen])

  useEffect(() => {
    if (!recipientOpen) return

    let cancelled = false

    const run = async () => {
      setRecipientLoading(true)

      if (allRecipientsLoaded) {
        setRecipientCandidates(
          currentUserId ? allRecipients.filter((u) => u.id !== currentUserId) : allRecipients
        )
        setRecipientLoading(false)
        return
      }

      setRecipientCandidates([])
      try {
        const users = await getAllNotificationRecipients({ limit: 500 })
        if (cancelled) return
        setAllRecipients(users)
        setAllRecipientsLoaded(true)
        setRecipientCandidates(currentUserId ? users.filter((u) => u.id !== currentUserId) : users)
      } catch {
        if (cancelled) return
        setRecipientCandidates([])
      } finally {
        if (cancelled) return
        setRecipientLoading(false)
      }
    }

    void run()

    return () => {
      cancelled = true
    }
  }, [
    recipientOpen,
    allRecipientsLoaded,
    allRecipients,
    currentUserId,
  ])

  useEffect(() => {
    let cancelled = false
    setEntityOptions([])

    if (!relatedEntityTypeValue) return

    setEntityOptionsLoading(true)

    const run = async () => {
      if (relatedEntityTypeValue === 'appointment') {
        const start = new Date()
        start.setDate(start.getDate() - 30)
        const end = new Date()
        end.setDate(end.getDate() + 7)

        const r = await getAppointments({
          page: 1,
          limit: 20,
          startDate: start.toISOString(),
          endDate: end.toISOString(),
        })

        if (cancelled) return
        setEntityOptions(
          r.appointments.map((a: Appointment) => ({
            id: a.id,
            label: `${a.appointmentType} · ${a.patient.user.firstName} ${a.patient.user.lastName} · ${new Date(a.scheduledDate).toLocaleDateString()}`,
          }))
        )
        return
      }

      if (relatedEntityTypeValue === 'interconsultation') {
        const r = await getInterconsultations({ page: 1, limit: 20 })
        if (cancelled) return
        setEntityOptions(
          r.interconsultations.map((ic: Interconsultation) => ({
            id: ic.id,
            label: `${ic.patient?.user.firstName ?? ''} ${ic.patient?.user.lastName ?? ''}`.trim()
              ? `${ic.patient?.user.firstName ?? ''} ${ic.patient?.user.lastName ?? ''}`.trim() +
                ` · ${ic.fromDepartment}→${ic.toDepartment}`
              : `Interconsulta ${ic.id.slice(0, 8)}`,
          }))
        )
        return
      }

      if (relatedEntityTypeValue === 'medication') {
        const r = await getMedications({ page: 1, limit: 20, isActive: true })
        if (cancelled) return
        setEntityOptions(
          r.medications.map((m: Medication) => ({
            id: m.id,
            label: `${m.name}${m.genericName ? ` (${m.genericName})` : ''}`,
          }))
        )
        return
      }

      if (relatedEntityTypeValue === 'prescription') {
        const list = await getRecentPrescriptions(20)
        if (cancelled) return
        setEntityOptions(list)
        return
      }
    }

    void run().catch(() => {
      if (!cancelled) setEntityOptions([])
    }).finally(() => {
      if (!cancelled) setEntityOptionsLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [relatedEntityTypeValue])

  const update = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.userId.trim() || !form.type.trim() || !form.title.trim() || !form.message.trim()) {
      setError(t('common.error'))
      return
    }
    setSubmitting(true)
    try {
      const payload: CreateNotificationInput = {
        userId: form.userId.trim(),
        type: form.type.trim(),
        title: form.title.trim(),
        message: form.message.trim(),
        priority: form.priority || 'normal',
      }
      if (form.relatedEntityType?.trim()) payload.relatedEntityType = form.relatedEntityType.trim()
      if (form.relatedEntityId?.trim()) payload.relatedEntityId = form.relatedEntityId.trim()
      const created = await createNotification(payload)
      setCreatedId(created.id)
      setSentToName(destinationName || recipientDisplay.split(' (')[0] || form.userId.trim())
      setSentAtLabel(created.createdAt ? formatDateTime(created.createdAt) : formatDateTime(new Date().toISOString()))
      setShowSuccess(true)
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null
      setError(msg || t('common.error'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <LoadingModal open={submitting} message={t('common.loading')} />
      <ErrorModal open={!!error} message={error || undefined} onClose={() => setError('')} />
      <SuccessModal
        open={showSuccess}
        onClose={() => {
          setShowSuccess(false)
          navigate('/notifications', { replace: true })
          setCreatedId(null)
          setSentToName('')
          setSentAtLabel('')
        }}
        message={`Enviada a ${sentToName} a las ${sentAtLabel}.`}
      />
      <Link to="/notifications" className="inline-flex items-center gap-2 text-[var(--color-primary)] hover:underline">
        <ArrowLeft size={18} />
        {t('notifications.list')}
      </Link>
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('notifications.newNotification')}</h1>
      <GlassCard>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">{t('notifications.recipient')} *</label>
            <div ref={wrapperRef} className="relative">
              <input
                type="text"
                value={recipientDisplay}
                onChange={(e) => {
                  const v = e.target.value
                  setRecipientDisplay(v)
                  if (isUuid(v)) {
                    setForm((prev) => ({ ...prev, userId: v }))
                  } else {
                    setForm((prev) => ({ ...prev, userId: '' }))
                  }
                  setError('')
                }}
                onFocus={() => setRecipientOpen(true)}
                onClick={() => setRecipientOpen(true)}
                className={`glass-input w-full px-4 py-2.5 font-mono text-sm opacity-100 !bg-white/90 dark:!bg-black/75 text-[var(--text-primary)] ${
                  recipientDisplay ? 'pr-10' : ''
                }`}
                placeholder="Selecciona o pega UUID del usuario"
                required
              />

              {recipientDisplay && (
                <button
                  type="button"
                  aria-label={t('common.cancel', 'Cancelar')}
                  title={t('common.cancel', 'Cancelar')}
                  onMouseDown={(e) => {
                    // Evita que el click en el botón afecte al dropdown.
                    e.preventDefault()
                  }}
                  onClick={() => {
                    setRecipientDisplay('')
                    setRecipientOpen(false)
                    setForm((prev) => ({ ...prev, userId: '' }))
                    setError('')
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-[var(--text-muted)] hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <X size={16} />
                </button>
              )}

              {recipientOpen && (
                <div className="absolute left-0 right-0 z-20 mt-1 rounded-xl border border-[var(--border)] bg-white/95 dark:bg-black/85 shadow-lg">
                  <div className="px-3 py-2 border-b border-[var(--border)] text-xs text-[var(--text-muted)]">
                    {t(
                      'notifications.allRecipients',
                      'Coordinadores, enfermeros y psicólogos'
                    )}
                  </div>

                  {recipientLoading ? (
                    <div className="px-3 py-3 text-sm text-[var(--text-muted)]">{t('common.loading')}</div>
                  ) : recipientFiltered.length === 0 ? (
                    <div className="px-3 py-3 text-sm text-[var(--text-muted)]">
                      {t('notifications.noCandidates', 'Sin candidatos')}
                    </div>
                  ) : (
                    <ul className="max-h-60 overflow-y-auto">
                      {recipientFiltered.map((u) => (
                        <li key={u.id}>
                          <button
                            type="button"
                            onClick={() => {
                              setForm((prev) => ({ ...prev, userId: u.id }))
                              setRecipientDisplay(`${u.firstName} ${u.lastName} (${u.role})`)
                              setRecipientOpen(false)
                              setError('')
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-black/5 dark:hover:bg-white/5"
                          >
                            <div className="text-sm font-medium text-[var(--text-primary)] truncate">
                              {u.firstName} {u.lastName} <span className="text-xs text-[var(--text-muted)]">· {u.role}</span>
                            </div>
                            <div className="text-xs text-[var(--text-muted)] font-mono truncate">{u.id}</div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">{t('notifications.type')} *</label>
            <input
              type="text"
              value={form.type}
              onChange={(e) => update('type', e.target.value)}
              className="glass-input w-full px-4 py-2.5"
              placeholder="ej. appointment_reminder, system_alert"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">{t('notifications.notificationTitle')} *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
              className="glass-input w-full px-4 py-2.5"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">{t('notifications.message')} *</label>
            <textarea
              value={form.message}
              onChange={(e) => update('message', e.target.value)}
              className="glass-input w-full px-4 py-2.5 min-h-[120px]"
              rows={4}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">{t('notifications.priority')}</label>
            <select
              value={form.priority}
              onChange={(e) => update('priority', e.target.value)}
              className="glass-input w-full px-4 py-2.5"
            >
              {NOTIFICATION_PRIORITIES.map((p) => (
                <option key={p} value={p}>{t(`notifications.${p === 'normal' ? 'priorityNormal' : p === 'high' ? 'priorityHigh' : 'priorityUrgent'}`)}</option>
              ))}
            </select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Entidad relacionada (tipo)</label>
              <select
                value={form.relatedEntityType}
                onChange={(e) => {
                  update('relatedEntityType', e.target.value)
                  setForm((prev) => ({ ...prev, relatedEntityId: '' }))
                  setRecipientDisplay('')
                  setRecipientOpen(false)
                }}
                className="glass-input w-full px-4 py-2.5"
              >
                <option value="">{t('common.select', 'Seleccionar')}</option>
                {relatedEntityTypeOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Entidad relacionada (ID)</label>
              {entityOptionsLoading ? (
                <div className="glass-input px-4 py-2.5 text-sm text-[var(--text-muted)]">Cargando…</div>
              ) : (
                <select
                  value={form.relatedEntityId}
                  onChange={(e) => {
                    update('relatedEntityId', e.target.value)
                    setRecipientDisplay('')
                    setRecipientOpen(false)
                  }}
                  className="glass-input w-full px-4 py-2.5 font-mono text-sm"
                  disabled={!relatedEntityTypeValue}
                >
                  <option value="">
                    {relatedEntityTypeValue
                      ? t('common.select', 'Seleccionar')
                      : t('notifications.selectTypeFirst', 'Primero selecciona tipo')}
                  </option>
                  {entityOptions.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <GlassButton type="submit" variant="primary" disabled={submitting}>
              {submitting
                ? t('common.loading')
                : destinationName
                  ? `Enviar Notificación a ${destinationName}`
                  : t('common.save')}
            </GlassButton>
            <Link to="/notifications">
              <GlassButton type="button">{t('common.cancel')}</GlassButton>
            </Link>
          </div>
        </form>
      </GlassCard>
    </div>
  )
}
