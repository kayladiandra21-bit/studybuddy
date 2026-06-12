// Landing page — public marketing page
import { Link } from 'react-router-dom';
import Logo from '../components/ui/Logo';
import ThemeToggle from '../components/ui/ThemeToggle';
import { useAuth } from '../contexts/AuthContext';

const FEATURES = [
  { icon: '✅', title: 'Smart Tasks', desc: 'Organize assignments by subject, priority and deadline — never miss a due date again.' },
  { icon: '🗓️', title: 'Academic Calendar', desc: 'Exams, meetings and deadlines in one calendar. Tasks appear automatically.' },
  { icon: '⏱️', title: 'Pomodoro Timer', desc: 'Stay focused with 25/5 sessions, build streaks and earn achievements.' },
  { icon: '👥', title: 'Study Groups', desc: 'Real-time chat, file sharing and announcements with your classmates.' },
  { icon: '📈', title: 'Analytics', desc: 'See your focus hours, completion rate and productivity per subject.' },
  { icon: '🔔', title: 'Reminders', desc: 'Get nudged before deadlines, exams and group meetings.' },
];

export default function Landing() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-slate-50 to-violet-50 dark:from-slate-950 dark:via-slate-950 dark:to-brand-950/30">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <Logo />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <Link to="/dashboard" className="btn-primary">Open App</Link>
          ) : (
            <>
              <Link to="/login" className="btn-ghost">Log in</Link>
              <Link to="/register" className="btn-primary">Get started</Link>
            </>
          )}
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-4 pb-16 pt-14 text-center">
        <p className="mb-4 inline-block rounded-full bg-brand-100 px-3.5 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
          Built for university students 🎓
        </p>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          Plan smarter. <span className="text-brand-600 dark:text-brand-400">Study better.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-slate-600 dark:text-slate-300">
          StudyBuddy keeps your assignments, deadlines, focus sessions and study
          groups in one calm, organized place.
        </p>
        <div className="mt-7 flex justify-center gap-3">
          <Link to="/register" className="btn-primary px-6 py-3 text-base">Create free account</Link>
          <Link to="/login" className="btn-ghost px-6 py-3 text-base ring-1 ring-slate-200 dark:ring-slate-700">I have an account</Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 pb-20 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <div key={f.title} className="card">
            <div className="mb-2 text-2xl">{f.icon}</div>
            <h3 className="font-semibold">{f.title}</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{f.desc}</p>
          </div>
        ))}
      </section>

      <footer className="border-t border-slate-200 py-6 text-center text-sm text-slate-400 dark:border-slate-800">
        StudyBuddy — Web Development Course Project
      </footer>
    </div>
  );
}
