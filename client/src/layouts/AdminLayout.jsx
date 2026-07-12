import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Key, MessageCircle, Phone, LogOut, FileText, Settings, Moon, Sun } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { ROUTES } from '../constants';

const AdminLayout = () => {
  const { logout, user } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.ADMIN_LOGIN, { replace: true });
  };

  const navItems = [
    { name: 'Dashboard', path: ROUTES.ADMIN_DASHBOARD, icon: LayoutDashboard },
    { name: 'Users', path: ROUTES.ADMIN_USERS, icon: Users },
    { name: 'Secret Codes', path: ROUTES.ADMIN_SECRET_CODES, icon: Key },
    { name: 'Chats', path: ROUTES.ADMIN_CHATS, icon: MessageCircle },
    { name: 'Calls', path: ROUTES.ADMIN_CALLS, icon: Phone },
    { name: 'Logs', path: ROUTES.ADMIN_LOGS, icon: FileText },
    { name: 'Settings', path: ROUTES.ADMIN_SETTINGS, icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shadow-sm">
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 dark:bg-blue-500 flex items-center justify-center shadow-sm">
            <Key className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-slate-900 dark:text-slate-100 tracking-tight text-lg">Admin Panel</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm dark:bg-blue-600'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100'
                  }`
                }
              >
                <Icon size={18} />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between px-2 py-2">
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{user?.username}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Administrator</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors"
                title="Toggle Theme"
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                aria-label="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50 dark:bg-slate-950">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
