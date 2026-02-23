import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { User as UserIcon } from 'lucide-react'
import { GlassCard } from '@/components/atoms/GlassCard'
import { GlassButton } from '@/components/atoms/GlassButton'
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
  const { user, setUser } = useAuthStore()
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

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
          <UserIcon size={28} />
          {t('profilePage.title')}
        </h1>
        <p className="py-8 text-center text-[var(--text-muted)]">{t('common.loading')}</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('profilePage.title')}</h1>
        <p className="text-[var(--color-error)]">{error || t('common.error')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
        <UserIcon size={28} />
        {t('profilePage.title')}
      </h1>

      {success && (
        <p className="rounded-xl bg-[var(--color-primary)]/10 px-4 py-2 text-sm text-[var(--color-primary)]">
          {success}
        </p>
      )}
      {error && <p className="text-sm text-[var(--color-error)]">{error}</p>}

      <GlassCard>
        {editing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                {t('profilePage.firstName')} *
              </label>
              <input
                type="text"
                value={form.firstName}
                onChange={(e) => update('firstName', e.target.value)}
                className="glass-input w-full px-4 py-2.5"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                {t('profilePage.lastName')} *
              </label>
              <input
                type="text"
                value={form.lastName}
                onChange={(e) => update('lastName', e.target.value)}
                className="glass-input w-full px-4 py-2.5"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                {t('profilePage.email')}
              </label>
              <input
                type="email"
                value={profile.email}
                readOnly
                className="glass-input w-full px-4 py-2.5 bg-black/5 dark:bg-white/5 cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-[var(--text-muted)]">{t('profilePage.emailReadOnly')}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                {t('profilePage.phone')}
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
                className="glass-input w-full px-4 py-2.5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                {t('profilePage.dateOfBirth')}
              </label>
              <input
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => update('dateOfBirth', e.target.value)}
                className="glass-input w-full px-4 py-2.5"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <GlassButton type="submit" disabled={submitting}>
                {submitting ? t('common.loading') : t('common.save')}
              </GlassButton>
              <GlassButton type="button" onClick={() => setEditing(false)} disabled={submitting}>
                {t('common.cancel')}
              </GlassButton>
            </div>
          </form>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
                  {t('profilePage.firstName')}
                </p>
                <p className="mt-0.5 text-[var(--text-primary)]">{profile.firstName || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
                  {t('profilePage.lastName')}
                </p>
                <p className="mt-0.5 text-[var(--text-primary)]">{profile.lastName || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
                  {t('profilePage.email')}
                </p>
                <p className="mt-0.5 text-[var(--text-primary)]">{profile.email || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
                  {t('profilePage.role')}
                </p>
                <p className="mt-0.5 text-[var(--text-primary)]">{profile.role || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
                  {t('profilePage.phone')}
                </p>
                <p className="mt-0.5 text-[var(--text-primary)]">{profile.phone || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
                  {t('profilePage.dateOfBirth')}
                </p>
                <p className="mt-0.5 text-[var(--text-primary)]">{formatDate(profile.dateOfBirth)}</p>
              </div>
              {profile.enrollmentNumber && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
                    {t('profilePage.enrollmentNumber')}
                  </p>
                  <p className="mt-0.5 text-[var(--text-primary)]">{profile.enrollmentNumber}</p>
                </div>
              )}
            </div>
            <div className="mt-6 pt-4 border-t border-[var(--border)]">
              <GlassButton type="button" onClick={() => setEditing(true)}>
                {t('profilePage.editProfile')}
              </GlassButton>
            </div>
          </>
        )}
      </GlassCard>
    </div>
  )
}
