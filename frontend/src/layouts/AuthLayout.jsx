// Centered card layout for login / register / password pages
import { Outlet } from 'react-router-dom';
import Logo from '../components/ui/Logo';
import ThemeToggle from '../components/ui/ThemeToggle';

export default function AuthLayout() {
  return (
    <div className="relative grid min-h-screen place-items-center bg-gradient-to-br from-brand-50 via-slate-50 to-violet-50 px-4 dark:from-slate-950 dark:via-slate-950 dark:to-brand-950/30">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md animate-fade-up">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <div className="card p-7 shadow-lg">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
