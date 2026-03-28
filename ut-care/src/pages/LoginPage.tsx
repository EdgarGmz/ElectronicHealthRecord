import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Lock, Mail, Heart } from 'lucide-react'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/auth.store'
import { GlassButton } from '@/components/atoms/GlassButton'
import { ErrorModal } from '@/components/molecules/ErrorModal'
import { PasswordInput } from '@/components/atoms/PasswordInput'
import { ThemeToggle } from '@/components/molecules/ThemeToggle'
import { LanguageSwitcher } from '@/components/molecules/LanguageSwitcher'

const schema = z.object({
  email: z.string().min(1, 'Email required').email(),
  password: z.string().min(1, 'Password required'),
})

type FormData = z.infer<typeof schema>

export function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { setAuth, setRememberMe, rememberMe } = useAuthStore()
  const [error, setError] = useState('')
  const [forgotOpen, setForgotOpen] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setError('')
    try {
      const res = await api.post<{ success: boolean; data: { accessToken: string; refreshToken?: string; user: { id: string; email: string; firstName: string; lastName: string; role: string } } }>('/auth/login', data)
      const { accessToken, refreshToken, user } = res.data.data
      setAuth(accessToken, refreshToken ?? null, user, rememberMe)
      const redirect = searchParams.get('redirect') || '/'
      navigate(redirect, { replace: true })
    } catch (err: unknown) {
      const message = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : null
      setError(message || t('auth.invalidCredentials'))
    }
  }

  const handleRememberChange = (checked: boolean) => {
    setRememberMe(checked)
  }

  return (
    <div className="login-page min-h-screen flex flex-col">
      <ErrorModal open={!!error} message={error || undefined} onClose={() => setError('')} />
      {/* Top bar */}
      <header className="flex-shrink-0 flex items-center justify-between px-4 py-3 md:px-6">
        <span className="text-lg font-semibold text-[var(--text-primary)] tracking-tight">
          {t('app.name')}
        </span>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LanguageSwitcher />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-4 md:p-6">
        <div className="login-card w-full max-w-[420px]">
          <div className="login-card-inner">
            {/* Branding */}
            <div className="flex flex-col items-center text-center mb-8">
              <div className="login-icon mb-4">
                <Heart className="w-10 h-10 text-[var(--color-primary)]" strokeWidth={1.8} />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
                {t('app.name')}
              </h1>
              <p className="mt-1.5 text-sm text-[var(--text-secondary)]">
                {t('app.subtitle')}
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                  {t('auth.email')}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)] pointer-events-none" />
                  <input
                    type="email"
                    autoComplete="email"
                    data-testid="login-email"
                    className="login-input w-full pl-10 pr-4 py-3"
                    placeholder="tu@institucion.edu"
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1.5 text-sm text-[var(--color-error)]">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                  {t('auth.password')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)] pointer-events-none z-10" />
                  <PasswordInput
                    autoComplete="current-password"
                    data-testid="login-password"
                    placeholder="••••••••"
                    className="pl-10 pr-12"
                    {...register('password')}
                  />
                </div>
                {errors.password && (
                  <p className="mt-1.5 text-sm text-[var(--color-error)]">{errors.password.message}</p>
                )}
              </div>

              <div className="flex items-center justify-between gap-4">
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => handleRememberChange(e.target.checked)}
                    className="w-4 h-4 rounded border-[var(--border)] text-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:ring-offset-0"
                  />
                  <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                    {t('auth.rememberMe')}
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => setForgotOpen(true)}
                  className="text-sm font-medium text-[var(--color-primary)] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/30 rounded"
                >
                  {t('auth.forgotPassword')}
                </button>
              </div>


              <GlassButton
                type="submit"
                variant="primary"
                className="w-full py-3 text-base font-semibold"
                data-testid="login-submit"
              >
                {t('auth.login')}
              </GlassButton>
            </form>
          </div>
        </div>
      </main>

      {/* Forgot password modal */}
      {forgotOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setForgotOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="forgot-title"
        >
          <div
            className="login-card w-full max-w-md p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="forgot-title" className="text-lg font-semibold text-[var(--text-primary)] mb-2">
              {t('auth.forgotPasswordTitle')}
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mb-6">
              {t('auth.forgotPasswordMessage')}
            </p>
            <GlassButton
              type="button"
              variant="primary"
              className="w-full"
              onClick={() => setForgotOpen(false)}
            >
              {t('auth.close')}
            </GlassButton>
          </div>
        </div>
      )}
    </div>
  )
}
