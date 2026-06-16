import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { User } from 'lucide-react'
import { EmailLink } from '@/components/atoms/EmailLink'
import { GlassCard } from '@/components/atoms/GlassCard'
import { PhoneWhatsAppLink } from '@/components/atoms/PhoneWhatsAppLink'
import { GlassButton } from '@/components/atoms/GlassButton'
import { LoadingModal } from '@/components/molecules/LoadingModal'
import { ErrorModal } from '@/components/molecules/ErrorModal'
import { SuccessModal } from '@/components/molecules/SuccessModal'
import { getMyProfile, updateMyProfile } from '@/services/profile.service'
import { useAuthStore } from '@/store/auth.store'
import type { Profile, UpdateProfileInput } from '@/types/profile'

function formatDate(value: string | null | undefined): string {
  if (!value) return '—'
  try {
    const d = new Date(value)
    return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString()
  } catch {
    return value
  }
}

export function ProfilePage() {
  const { t } = useTranslation()
  const { setUser } = useAuthStore()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState<UpdateProfileInput>({
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: '',
  })

  useEffect(() => {
    let cancelled = false
    setError('')
    getMyProfile()
      .then((data) => {
        if (!cancelled) {
          setProfile(data)
          setForm({
            firstName: data.firstName ?? '',
            lastName: data.lastName ?? '',
            phone: data.phone ?? '',
            dateOfBirth: data.dateOfBirth ? data.dateOfBirth.slice(0, 10) : '',
          })
        }
      })
      .catch(() => {
        if (!cancelled) setError(t('common.error'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [t])

  const update = (field: keyof UpdateProfileInput, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setError('')
    setSuccess('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!form.firstName?.trim() || !form.lastName?.trim()) {
      setError(t('common.error'))
      return
    }
    setSubmitting(true)
    try {
      const payload: UpdateProfileInput = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
      }
      if (form.phone?.trim()) payload.phone = form.phone.trim()
      if (form.dateOfBirth?.trim()) payload.dateOfBirth = form.dateOfBirth.trim()
      const updated = await updateMyProfile(payload)
      setProfile(updated)
      setUser({
        id: updated.id,
        email: updated.email,
        firstName: updated.firstName,
        lastName: updated.lastName,
        role: updated.role,
        isActive: updated.isActive,
      })
      setForm({
        firstName: updated.firstName ?? '',
        lastName: updated.lastName ?? '',
        phone: updated.phone ?? '',
        dateOfBirth: updated.dateOfBirth ? updated.dateOfBirth.slice(0, 10) : '',
      })
      setEditing(false)
      setSuccess(t('profilePage.updatedSuccess'))
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


  const initial = [profile?.firstName?.[0], profile?.lastName?.[0]]
    .filter(Boolean)
    .join('')
    .toUpperCase() || '?'

  return (
    <div className="container mx-auto px-4 py-6 space-y-6 max-w-2xl">
      <LoadingModal open={loading || submitting} message={t('common.loading')} />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <User className="text-[var(--color-primary)]" size={28} />
            {t('profilePage.title')}
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {t('profilePage.description')}
          </p>
        </div>
      </div>
      <ErrorModal open={!!error} message={error || undefined} onClose={() => setError('')} />
      <SuccessModal open={!!success} message={success} onClose={() => setSuccess('')} />
      {!profile && !loading && (
        <GlassCard className="profile-animate-in">
          <p className="text-[var(--text-secondary)]">{t('common.error')}</p>
        </GlassCard>
      )}
      {profile && (
        <>
          {/* Hero: avatar + name */}
          <div className="flex flex-col items-center gap-4 text-center opacity-0 profile-avatar-animate">
            <div
              className="flex h-24 w-24 items-center justify-center rounded-full text-3xl font-semibold text-white shadow-lg transition-transform duration-300 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark, #1d4ed8) 100%)',
              }}
            >
              {initial}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                {profile.firstName} {profile.lastName}
              </h1>
              <p className="mt-1 text-sm font-medium uppercase tracking-wider text-[var(--text-muted)]">
                {profile.role || '—'}
              </p>
            </div>
          </div>

          <GlassCard className="profile-animate-in profile-card-delay transition-shadow duration-300 hover:shadow-xl rounded-2xl overflow-hidden">
            {editing ? (
              <form onSubmit={handleSubmit} className="space-y-4 opacity-0 profile-form-animate">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-[var(--text-primary)]">
                    {t('profilePage.firstName')} *
                  </label>
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={(e) => update('firstName', e.target.value)}
                    className="glass-input w-full px-4 py-2.5 rounded-lg transition focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 focus:ring-offset-[var(--bg)]"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-[var(--text-primary)]">
                    {t('profilePage.lastName')} *
                  </label>
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={(e) => update('lastName', e.target.value)}
                    className="glass-input w-full px-4 py-2.5 rounded-lg transition focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 focus:ring-offset-[var(--bg)]"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-[var(--text-primary)]">
                    {t('profilePage.email')}
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    readOnly
                    className="glass-input w-full px-4 py-2.5 rounded-lg bg-black/5 dark:bg-white/5 cursor-not-allowed"
                  />
                  <p className="text-xs text-[var(--text-muted)]">{t('profilePage.emailReadOnly')}</p>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-[var(--text-primary)]">
                    {t('profilePage.phone')}
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => update('phone', e.target.value)}
                    className="glass-input w-full px-4 py-2.5 rounded-lg transition focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 focus:ring-offset-[var(--bg)]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-[var(--text-primary)]">
                    {t('profilePage.dateOfBirth')}
                  </label>
                  <input
                    type="date"
                    value={form.dateOfBirth}
                    onChange={(e) => update('dateOfBirth', e.target.value)}
                    className="glass-input w-full px-4 py-2.5 rounded-lg transition focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 focus:ring-offset-[var(--bg)]"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <GlassButton
                    type="submit"
                    disabled={submitting}
                    className="transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {submitting ? t('common.loading') : t('common.save')}
                  </GlassButton>
                  <GlassButton
                    type="button"
                    onClick={() => setEditing(false)}
                    disabled={submitting}
                    className="transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {t('common.cancel')}
                  </GlassButton>
                </div>
              </form>
            ) : (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { key: 'firstName', label: t('profilePage.firstName'), value: profile.firstName || '—' },
                    { key: 'lastName', label: t('profilePage.lastName'), value: profile.lastName || '—' },
                    { key: 'email', label: t('profilePage.email'), value: profile.email || '—' },
                    { key: 'role', label: t('profilePage.role'), value: profile.role || '—' },
                    { key: 'phone', label: t('profilePage.phone'), value: profile.phone || '—' },
                    { key: 'dateOfBirth', label: t('profilePage.dateOfBirth'), value: formatDate(profile.dateOfBirth) },
                    ...(profile.enrollmentNumber
                      ? [{ key: 'enrollmentNumber', label: t('profilePage.enrollmentNumber'), value: profile.enrollmentNumber }]
                      : []),
                  ].map((item, i) => (
                    <div
                      key={item.key}
                      className={`opacity-0 profile-animate-in profile-stagger-${Math.min(i + 1, 8)} rounded-xl border border-[var(--border)] bg-[var(--bg)]/50 p-3 transition-all duration-200 hover:border-[var(--primary)]/30 hover:shadow-md`}
                    >
                      <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
                        {item.label}
                      </p>
                      <p className="mt-1 text-[var(--text-primary)]">
                        {item.key === 'email' && item.value !== '—' ? (
                          <EmailLink email={item.value} />
                        ) : item.key === 'phone' && item.value !== '—' ? (
                          <PhoneWhatsAppLink phone={item.value} />
                        ) : (
                          item.value
                        )}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t border-[var(--border)]">
                  <GlassButton
                    type="button"
                    onClick={() => setEditing(true)}
                    className="transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {t('profilePage.editProfile')}
                  </GlassButton>
                </div>
              </>
            )}
          </GlassCard>
        </>
      )}
    </div>
  )
}
