// pages/Analytics.jsx — productivity charts & headline stats
import useFetch from '../hooks/useFetch';
import { analyticsService } from '../services/analyticsService';
import StatCard from '../components/StatCard';
import Spinner from '../components/ui/Spinner';
import Alert from '../components/ui/Alert';
import WeeklyFocusChart from '../components/charts/WeeklyFocusChart';
import MonthlyTasksChart from '../components/charts/MonthlyTasksChart';
import SubjectDonutChart from '../components/charts/SubjectDonutChart';
import '../components/charts/setup';

export default function Analytics() {
  const { data, loading, error } = useFetch(() => analyticsService.productivity());

  if (loading) return <div className="grid h-64 place-items-center"><Spinner /></div>;
  if (error) return <Alert>{error}</Alert>;

  const { charts = {}, stats = {} } = data || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Productivity Analytics</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Your study habits, visualized.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard icon="🗂" label="Total Tasks" value={stats.totalTasks ?? 0} />
        <StatCard icon="🎯" label="Completion Rate" value={`${stats.completionRate ?? 0}%`} />
        <StatCard icon="⏱️" label="Avg Focus / Day" value={`${stats.avgFocusHours ?? 0}h`} />
        <StatCard icon="🔥" label="Study Streak" value={`${stats.studyStreak ?? 0} days`} />
        <StatCard icon="✔️" label="Total Sessions" value={stats.totalSessions ?? 0} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card">
          <h2 className="mb-3 font-semibold">Weekly Focus Hours</h2>
          <WeeklyFocusChart weekly={charts.weeklyFocus} />
        </div>
        <div className="card">
          <h2 className="mb-3 font-semibold">Tasks Completed per Month</h2>
          {charts.monthlyCompleted?.length ? (
            <MonthlyTasksChart monthly={charts.monthlyCompleted} />
          ) : (
            <p className="grid h-56 place-items-center text-sm text-slate-400">Complete tasks to see this chart.</p>
          )}
        </div>
        <div className="card lg:col-span-2">
          <h2 className="mb-3 font-semibold">Subject Distribution</h2>
          {charts.subjectDistribution?.length ? (
            <div className="mx-auto max-w-sm"><SubjectDonutChart subjects={charts.subjectDistribution} /></div>
          ) : (
            <p className="grid h-40 place-items-center text-sm text-slate-400">Add tasks with subjects to see this chart.</p>
          )}
        </div>
      </div>
    </div>
  );
}
