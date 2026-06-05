import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { GlassCard } from '@/components/atoms/GlassCard'
import { GlassButton } from '@/components/atoms/GlassButton'
import { api } from '@/lib/api'

export function ConfirmAccountPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Falta el token de confirmación en la URL.')
      return
    }

    const confirmAccount = async () => {
      try {
        const res = await api.post<{ success: boolean; message: string }>('/auth/confirm-account', { token })
        setStatus('success')
        setMessage(res.data.message || 'Cuenta confirmada con éxito.')
      } catch (err: any) {
        const errorMsg = err?.response?.data?.message || 'Hubo un error al confirmar la cuenta.'
        setStatus('error')
        setMessage(errorMsg)
      }
    }

    confirmAccount()
  }, [token])

  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-[var(--bg-primary)]">
      <GlassCard className="w-full max-w-md text-center p-6 animate-fade-in">
        {status === 'loading' && (
          <div className="space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-primary)]/10 animate-pulse">
              <Loader2 className="text-[var(--color-primary)] animate-spin" size={32} />
            </div>
            <h1 className="text-xl font-bold text-[var(--text-primary)]">
              Confirmando tu cuenta
            </h1>
            <p className="text-[var(--text-secondary)]">
              Por favor, espera un momento mientras validamos tu registro.
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
              <CheckCircle2 className="text-emerald-500" size={32} />
            </div>
            <h1 className="text-xl font-bold text-[var(--text-primary)]">
              ¡Cuenta Confirmada!
            </h1>
            <p className="text-[var(--text-secondary)]">
              {message}
            </p>
            <div className="pt-4">
              <Link to="/login">
                <GlassButton variant="primary" className="w-full">
                  Ir al Inicio de Sesión
                </GlassButton>
              </Link>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
              <XCircle className="text-red-500" size={32} />
            </div>
            <h1 className="text-xl font-bold text-[var(--text-primary)]">
              Error de Confirmación
            </h1>
            <p className="text-[var(--text-secondary)]">
              {message}
            </p>
            <div className="pt-4">
              <Link to="/login">
                <GlassButton variant="outline" className="w-full">
                  Volver al Inicio
                </GlassButton>
              </Link>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  )
}
