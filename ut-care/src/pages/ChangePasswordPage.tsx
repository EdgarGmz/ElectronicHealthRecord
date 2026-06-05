import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { KeyRound, Lock, Loader2, CheckCircle2 } from 'lucide-react'
import { GlassCard } from '@/components/atoms/GlassCard'
import { GlassButton } from '@/components/atoms/GlassButton'
import { PasswordInput } from '@/components/atoms/PasswordInput'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/auth.store'

export function ChangePasswordPage() {
  const navigate = useNavigate()
  const { user, setAuth, token, refreshToken, rememberMe } = useAuthStore()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Por favor completa todos los campos.')
      return
    }

    if (newPassword.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('La nueva contraseña y su confirmación no coinciden.')
      return
    }

    setIsLoading(true)
    try {
      await api.post('/users/change-password', {
        currentPassword,
        newPassword,
      })

      setSuccess(true)
      
      // Update the mustChangePassword flag in our auth store user details
      if (user && token) {
        const updatedUser = { ...user, mustChangePassword: false }
        setAuth(token, refreshToken, updatedUser, rememberMe)
      }

      setTimeout(() => {
        navigate('/', { replace: true })
      }, 2000)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Error al cambiar la contraseña. Inténtalo de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-[var(--bg-primary)]">
      <GlassCard className="w-full max-w-md p-6">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
            <KeyRound size={24} />
          </div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">
            Restablecer Contraseña Obligatorio
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Por seguridad, debes cambiar tu contraseña temporal antes de continuar.
          </p>
        </div>

        {success ? (
          <div className="space-y-4 text-center animate-fade-in">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 size={24} />
            </div>
            <p className="text-sm font-medium text-emerald-500">
              ¡Contraseña cambiada con éxito! Redirigiendo...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-500/10 rounded-lg border border-red-500/20">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                Contraseña Temporal / Actual
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] z-10 pointer-events-none" />
                <PasswordInput
                  placeholder="••••••••"
                  className="pl-10"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                Nueva Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] z-10 pointer-events-none" />
                <PasswordInput
                  placeholder="Mínimo 8 caracteres"
                  className="pl-10"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                Confirmar Nueva Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] z-10 pointer-events-none" />
                <PasswordInput
                  placeholder="••••••••"
                  className="pl-10"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <GlassButton
              type="submit"
              variant="primary"
              className="w-full flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>Guardando...</span>
                </>
              ) : (
                'Cambiar Contraseña'
              )}
            </GlassButton>
          </form>
        )}
      </GlassCard>
    </div>
  )
}
