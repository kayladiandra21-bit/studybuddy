// pages/Dashboard.jsx
import { Link } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import { analyticsService } from '../services/analyticsService';
import { useAuth } from '../contexts/AuthContext';
import StatCard from '../components/StatCard';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import Alert from '../components/ui/Alert';
import WeeklyFocusChart from '../components/charts/WeeklyFocusChart';
import SubjectDonutChart from '../components/charts/SubjectDonutChart';
import '../components/charts/setup';

function formatDate(d) {
  return new Date(d).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  });
}

export default function Dashboard() {
  const { user } = useAuth();
  const dash = useFetch(() => analyticsService.dashboard());
  const prod = useFetch(() => analyticsService.productivity());

  if (dash.loading || prod.loading) {
    return <div className="grid h-64 place-items-center"><Spinner /></div>;
  }
  if (dash.error) return <Alert>{dash.error}</Alert>;

  const cards = dash.data?.cards || {};
  const upcoming = dash.data?.upcomingDeadlines || [];
  const charts = prod.data?.charts || {};
  const completionRate = prod.data?.stats?.completionRate ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Hi, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Here's your study overview for today.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard icon="📝" label="Pending Tasks" value={cards.pendingTasks ?? 0} />
        <StatCard icon="✅" label="Completed Tasks" value={cards.completedTasks ?? 0} />
        <StatCard icon="⏱️" label="Focus This Week" value={`${cards.focusHoursThisWeek ?? 0}h`} />
        <StatCard icon="🔥" label="Study Streak" value={`${cards.studyStreak ?? 0} days`} />
        <StatCard icon="🎯" label="Completion Rate" value={`${completionRate}%`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Weekly Focus Hours</h2>
            <Link to="/pomodoro" className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">
              Start a session →
            </Link>
          </div>
          <WeeklyFocusChart weekly={charts.weeklyFocus} />
        </div>

        <div className="card">
          <h2 className="mb-3 font-semibold">Subjects</h2>
          {charts.subjectDistribution?.length ? (
            <SubjectDonutChart subjects={charts.subjectDistribution} />
          ) : (
            <p className="py-12 text-center text-sm text-slate-400">
              Add tasks with subjects to see your distribution.
            </p>
          )}
        </div>
      </div>

      <div className="card">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Upcoming Deadlines</h2>
          <Link to="/tasks" className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">
            All tasks →
          </Link>
        </div>
        {upcoming.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">
            Nothing due soon. Add a task to get started! 🎉
          </p>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {upcoming.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate font-medium">{t.title}</p>
                  <p className="text-xs text-slate-400">{t.subject} · due {formatDate(t.due_date)}</p>
                </div>
                <Badge variant={t.priority}>{t.priority}</Badge>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
