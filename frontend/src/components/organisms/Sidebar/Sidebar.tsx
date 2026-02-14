import { cn } from '../../../utils/cn';

interface NavItem {
  name: string;
  href: string;
  icon: string;
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: '🏠' },
  { name: 'Pacientes', href: '/patients', icon: '👥' },
  { name: 'Citas', href: '/appointments', icon: '📅' },
  { name: 'Expedientes', href: '/records', icon: '📋' },
  { name: 'Reportes', href: '/reports', icon: '📊' },
  { name: 'Configuración', href: '/settings', icon: '⚙️' },
];

export interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const currentPath = window.location.pathname;

  return (
    <aside className={cn('w-64 h-screen bg-gray-900 text-white flex flex-col fixed left-0 top-0', className)}>
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-800">
        <h1 className="text-xl font-bold">EHR System</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
        {navigation.map((item) => {
          const isActive = currentPath === item.href;
          return (
            <a
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200',
                isActive
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              )}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.name}</span>
            </a>
          );
        })}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary-500 flex items-center justify-center">
            <span className="text-sm font-semibold">JD</span>
          </div>
          <div>
            <p className="text-sm font-medium">John Doe</p>
            <p className="text-xs text-gray-400">Psicólogo</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
