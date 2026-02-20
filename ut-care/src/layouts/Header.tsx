import { useAuthStore } from '@/store/auth.store';
import { LogOut, User as UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function Header() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
      <div>
        {/* Breadcrumbs placeholder */}
        <span className="text-gray-500">Dashboard /</span>
      </div>
      <div className="relative">
        <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center space-x-2">
          <span className="hidden sm:inline">{user?.email}</span>
          <UserIcon className="w-8 h-8 p-1 bg-gray-200 rounded-full dark:bg-gray-700" />
        </button>
        {dropdownOpen && (
          <div className="absolute right-0 w-48 mt-2 origin-top-right bg-white rounded-md shadow-lg dark:bg-gray-800 ring-1 ring-black ring-opacity-5">
            <div className="py-1">
              <a href="/profile" className="flex items-center w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                <UserIcon className="w-4 h-4 mr-2" />
                Profile
              </a>
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-sm text-left text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
