import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { AuthLayout } from '../templates/AuthLayout';
import { FormField } from '../molecules/FormField';
import { Button } from '../atoms/Button';
import { useAuthStore } from '../../store/authStore';

// Validation schema
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El correo electrónico es requerido')
    .email('Correo electrónico inválido'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError, isAuthenticated } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Clear errors when component unmounts
  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
      toast.success('Inicio de sesión exitoso');
      navigate('/dashboard');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al iniciar sesión';
      toast.error(errorMessage);
    }
  };

  return (
    <AuthLayout>
      <div className="text-center mb-8">
        {/* Logo placeholder - using a simple medical icon */}
        <div className="mx-auto w-20 h-20 mb-6 flex items-center justify-center">
          <svg
            className="w-20 h-20 text-primary-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Iniciar Sesión
        </h1>
        <p className="text-gray-600">
          Sistema de Registro de Salud Electrónico
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Error message */}
        {error && (
          <div className="bg-error-50 border border-error-200 text-error-800 px-4 py-3 rounded-lg">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Email field */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <EnvelopeIcon className="h-5 w-5 text-gray-400" />
          </div>
          <FormField
            label="Correo Electrónico"
            type="email"
            placeholder="ejemplo@correo.com"
            required
            {...register('email')}
            error={errors.email?.message}
            className="pl-11"
          />
        </div>

        {/* Password field */}
        <div className="relative">
          <div className="absolute left-0 pl-4 flex items-center pointer-events-none z-10 top-8">
            <LockClosedIcon className="h-5 w-5 text-gray-400" />
          </div>
          <FormField
            label="Contraseña"
            type="password"
            placeholder="••••••••"
            required
            {...register('password')}
            error={errors.password?.message}
            className="pl-11"
          />
        </div>

        {/* Remember me and forgot password */}
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="h-4 w-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
            />
            <span className="ml-2 text-gray-600">Recordarme</span>
          </label>
          <a href="#" className="text-primary-500 hover:text-primary-600 font-medium">
            ¿Olvidaste tu contraseña?
          </a>
        </div>

        {/* Submit button */}
        <Button
          type="submit"
          variant="primary"
          className="w-full"
          isLoading={isLoading}
          disabled={isLoading}
        >
          {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </Button>
      </form>

      {/* Footer */}
      <div className="mt-6 text-center text-sm text-gray-600">
        <p>
          ¿No tienes una cuenta?{' '}
          <a href="#" className="text-primary-500 hover:text-primary-600 font-medium">
            Contacta al administrador
          </a>
        </p>
      </div>
    </AuthLayout>
  );
}
