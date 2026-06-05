import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { KeyRound, Lock, Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { GlassCard } from '@/components/atoms/GlassCard'
import { GlassButton } from '@/components/atoms/GlassButton'
import { PasswordInput } from '@/components/atoms/PasswordInput'
import { api } from '@/lib/api'

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 bg-[var(--bg-primary)]">
        <GlassCard className="w-full max-w-md text-center p-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
            <XCircle className="text-red-500" size={32} />
          </div>
          <h1 className="text-xl font-bold text-[var(--text-primary)] mt-4">
            Token Inexistente
          </h1>
          <p className="text-[var(--text-secondary)] mt-2">
            No se ha proporcionado un token válido para restablecer la contraseña.
          </p>
          <div className="pt-4">
            <Link to="/login">
              <GlassButton variant="primary" className="w-full">
                Ir al Inicio de Sesión
              </GlassButton>
            </Link>
          </div>
        </GlassCard>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!newPassword || !confirmPassword) {
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
      await api.post('/auth/reset-password', {
        token,
        newPassword,
      })

      setSuccess(true)
      setTimeout(() => {
        navigate('/login', { replace: true })
      }, 3000)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Error al restablecer la contraseña. El token podría haber expirado.')
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
            Restablecer Contraseña
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Ingresa tu nueva contraseña para recuperar el acceso a tu cuenta.
          </p>
        </div>

        {success ? (
          <div className="space-y-4 text-center animate-fade-in">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 size={24} />
            </div>
            <p className="text-sm font-medium text-emerald-500">
              ¡Contraseña restablecida con éxito! Redirigiendo al inicio de sesión...
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
                  <span>Restableciendo...</span>
                </>
              ) : (
                'Restablecer Contraseña'
              )}
            </GlassButton>
          </form>
        )}
      </GlassCard>
    </div>
  )
}
