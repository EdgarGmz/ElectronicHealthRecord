import { NavLink } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { navLinks } from '@/config/nav';
import type { Role } from '@/config/nav';
import { ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useState } from 'react';

export default function Sidebar() {
  const { user } = useAuthStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const role = user?.role as Role;
  const links = navLinks[role] || [];

  return (
    <aside className={`bg-white dark:bg-gray-800 text-gray-900 dark:text-white flex flex-col transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className="flex items-center justify-between h-16 p-4 border-b border-gray-200 dark:border-gray-700">
        {!isCollapsed && <span className="text-xl font-bold">UT-Care</span>}
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
          {isCollapsed ? <ChevronsRight /> : <ChevronsLeft />}
        </button>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {links.map(({ label, href, icon: Icon }) => (
          <NavLink
            key={href}
            to={href}
            className={({ isActive }) =>
              `flex items-center p-2 space-x-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 ${isActive ? 'bg-primary text-white' : ''}`
            }
          >
            <Icon className="w-6 h-6" />
            {!isCollapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
