import { Shield, Home, Users, Calendar, FileText, Pill, Stethoscope, Briefcase, BarChart2, Bell, Settings } from 'lucide-react';

export const navLinks = {
  admin: [
    { label: 'Dashboard', href: '/dashboard', icon: Home },
    { label: 'Patients', href: '/patients', icon: Users },
    { label: 'Appointments', href: '/appointments', icon: Calendar },
    { label: 'Sessions', href: '/sessions', icon: FileText },
    { label: 'Medications', href: '/medications', icon: Pill },
    { label: 'Interconsultations', href: '/consultations', icon: Briefcase },
    { label: 'Reports', href: '/reports', icon: BarChart2 },
    { label: 'Notifications', href: '/notifications', icon: Bell },
    { label: 'Admin', href: '/admin', icon: Shield, 
      subLinks: [
        { label: 'Users', href: '/admin/users' },
        { label: 'Roles', href: '/admin/roles' },
        { label: 'Settings', href: '/admin/settings' },
        { label: 'Audit Logs', href: '/admin/audit-logs' },
      ]
    },
  ],
  psychologist: [
    { label: 'Dashboard', href: '/dashboard', icon: Home },
    { label: 'My Patients', href: '/patients', icon: Users },
    { label: 'My Appointments', href: '/appointments', icon: Calendar },
    { label: 'Sessions', href: '/sessions', icon: FileText },
    { label: 'Evaluations', href: '/evaluations', icon: FileText },
    { label: 'Interconsultations', href: '/consultations', icon: Briefcase },
    { label: 'My Reports', href: '/reports', icon: BarChart2 },
  ],
  nurse: [
    { label: 'Dashboard', href: '/dashboard', icon: Home },
    { label: 'Patients', href: '/patients', icon: Users },
    { label: 'Appointments', href: '/appointments', icon: Calendar },
    { label: 'Medications', href: '/medications', icon: Pill },
    { label: 'Procedures', href: '/procedures', icon: Stethoscope },
    { label: 'Interconsultations', href: '/consultations', icon: Briefcase },
  ],
  receptionist: [
    { label: 'Dashboard', href: '/dashboard', icon: Home },
    { label: 'Patients', href: '/patients', icon: Users },
    { label: 'Appointments', href: '/appointments', icon: Calendar },
  ],
};

export type Role = keyof typeof navLinks;
