import { Shield, Home, Users, Calendar, FileText, Pill, Stethoscope, Briefcase, BarChart2, Bell, Settings } from 'lucide-react';
import { ROLES } from '@/constants/roles';

/** Enlaces del menú por rol. Los 5 roles del sistema: admin, coordinador_psicologia, coordinador_enfermeria, psicologo, enfermero. */
export const navLinks: Record<string, Array<{ label: string; href: string; icon: typeof Home; subLinks?: Array<{ label: string; href: string }> }>> = {
  [ROLES.ADMIN]: [
    { label: 'Dashboard', href: '/dashboard', icon: Home },
    { label: 'Pacientes', href: '/patients', icon: Users },
    { label: 'Citas', href: '/appointments', icon: Calendar },
    { label: 'Sesiones', href: '/sessions', icon: FileText },
    { label: 'Medicamentos', href: '/medications', icon: Pill },
    { label: 'Interconsultas', href: '/consultations', icon: Briefcase },
    { label: 'Reportes', href: '/reports', icon: BarChart2 },
    { label: 'Notificaciones', href: '/notifications', icon: Bell },
    {
      label: 'Admin',
      href: '/admin',
      icon: Shield,
      subLinks: [
        { label: 'Usuarios', href: '/admin/users' },
        { label: 'Roles', href: '/admin/roles' },
        { label: 'Configuración', href: '/admin/settings' },
        { label: 'Auditoría', href: '/admin/audit-logs' },
      ],
    },
  ],
  [ROLES.COORDINADOR_PSICOLOGIA]: [
    { label: 'Dashboard', href: '/dashboard', icon: Home },
    { label: 'Pacientes', href: '/patients', icon: Users },
    { label: 'Citas', href: '/appointments', icon: Calendar },
    { label: 'Sesiones', href: '/sessions', icon: FileText },
    { label: 'Evaluaciones', href: '/evaluations', icon: FileText },
    { label: 'Interconsultas', href: '/consultations', icon: Briefcase },
    { label: 'Reportes', href: '/reports', icon: BarChart2 },
    { label: 'Auditoría', href: '/admin/audit-logs', icon: Shield },
  ],
  [ROLES.COORDINADOR_ENFERMERIA]: [
    { label: 'Dashboard', href: '/dashboard', icon: Home },
    { label: 'Pacientes', href: '/patients', icon: Users },
    { label: 'Citas', href: '/appointments', icon: Calendar },
    { label: 'Sesiones', href: '/sessions', icon: FileText },
    { label: 'Evaluaciones', href: '/evaluations', icon: FileText },
    { label: 'Medicamentos', href: '/medications', icon: Pill },
    { label: 'Procedimientos', href: '/procedures', icon: Stethoscope },
    { label: 'Interconsultas', href: '/consultations', icon: Briefcase },
    { label: 'Reportes', href: '/reports', icon: BarChart2 },
    { label: 'Notificaciones', href: '/notifications', icon: Bell },
    { label: 'Auditoría', href: '/admin/audit-logs', icon: Shield },
  ],
  [ROLES.PSICOLOGO]: [
    { label: 'Dashboard', href: '/dashboard', icon: Home },
    { label: 'Mis Pacientes', href: '/patients', icon: Users },
    { label: 'Mis Citas', href: '/appointments', icon: Calendar },
    { label: 'Sesiones', href: '/sessions', icon: FileText },
    { label: 'Evaluaciones', href: '/evaluations', icon: FileText },
    { label: 'Interconsultas', href: '/consultations', icon: Briefcase },
    { label: 'Reportes', href: '/reports', icon: BarChart2 },
  ],
  [ROLES.ENFERMERO]: [
    { label: 'Dashboard', href: '/dashboard', icon: Home },
    { label: 'Pacientes', href: '/patients', icon: Users },
    { label: 'Citas', href: '/appointments', icon: Calendar },
    { label: 'Medicamentos', href: '/medications', icon: Pill },
    { label: 'Procedimientos', href: '/procedures', icon: Stethoscope },
    { label: 'Interconsultas', href: '/consultations', icon: Briefcase },
  ],
};

export type NavRole =
  | typeof ROLES.ADMIN
  | typeof ROLES.COORDINADOR_PSICOLOGIA
  | typeof ROLES.COORDINADOR_ENFERMERIA
  | typeof ROLES.PSICOLOGO
  | typeof ROLES.ENFERMERO;

/** Alias para uso en Sidebar y otros componentes. */
export type Role = NavRole;
