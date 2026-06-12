// layouts/AppLayout.jsx
// The logged-in shell: Sidebar (responsive) + Navbar + page content.
import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Logo from '../components/ui/Logo';
import ThemeToggle from '../components/ui/ThemeToggle';
import NotificationBell from '../components/NotificationBell';

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/tasks', label: 'Tasks', icon: '✅' },
  { to: '/calendar', label: 'Calendar', icon: '🗓️' },
  { to: '/pomodoro', label: 'Pomodoro', icon: '⏱️' },
  { to: '/groups', label: 'Study Groups', icon: '👥' },
  { to: '/analytics', label: 'Analytics', icon: '📈' },
  { to: '/notifications', label: 'Notifications', icon: '🔔' },
  { to: '/profile', label: 'Profile', icon: '👤' },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false); // mobile sidebar

  const items = user?.role === 'admin' ? [...NAV, { to: '/admin', label: 'Admin', icon: '🛠️' }] : NAV;

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const sidebar = (
    <div className="flex h-full flex-col gap-6 p-5">
      <Logo to="/dashboard" />
      <nav className="flex flex-1 flex-col gap-1">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                isActive
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`
            }
          >
            <span>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
      <button onClick={handleLogout} className="btn-ghost justify-start text-rose-500">
        🚪 Log out
      </button>
    </div>
  );

  return (
    <div className="min-h-screen lg:flex">
      {/* Sidebar — fixed on desktop, drawer on mobile */}
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 lg:block">
        {sidebar}
      </aside>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-white shadow-xl dark:bg-slate-900">
            {sidebar}
          </aside>
        </div>
      )}

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Navbar */}
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80 lg:px-6">
          <button
            className="btn-ghost h-10 w-10 p-0 text-xl lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            ☰
          </button>
          <div className="flex-1" />
          <NotificationBell />
          <ThemeToggle />
          <div className="flex items-center gap-2.5 rounded-xl bg-slate-100 py-1.5 pl-1.5 pr-3.5 dark:bg-slate-800">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-600 text-xs font-bold text-white">
              {user?.name?.[0]?.toUpperCase() || '?'}
            </span>
            <span className="hidden text-sm font-medium sm:block">{user?.name}</span>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6">
          <div className="mx-auto max-w-6xl animate-fade-up">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
