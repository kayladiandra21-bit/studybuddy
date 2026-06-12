// pages/admin/AdminDashboard.jsx — platform stats + user management
import { useState } from 'react';
import useFetch from '../../hooks/useFetch';
import useDebounce from '../../hooks/useDebounce';
import { adminService } from '../../services/adminService';
import { useAuth } from '../../contexts/AuthContext';
import StatCard from '../../components/StatCard';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import MonthlyTasksChart from '../../components/charts/MonthlyTasksChart';
import '../../components/charts/setup';

export default function AdminDashboard() {
  const { user: me } = useAuth();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debounced = useDebounce(search);

  const stats = useFetch(() => adminService.stats());
  const users = useFetch(() => adminService.users({ search: debounced, page, limit: 8 }), [debounced, page]);
  const [error, setError] = useState('');

  async function handleDelete(u) {
    setError('');
    if (!confirm(`Delete user "${u.name}" and ALL their data? This cannot be undone.`)) return;
    try {
      await adminService.deleteUser(u.id);
      users.refetch();
      stats.refetch();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete user.');
    }
  }

  if (stats.loading) return <div className="grid h-64 place-items-center"><Spinner /></div>;
  const s = stats.data || {};
  const signups = (s.signupsPerMonth || []).map((r) => ({ month: r.month, completed: r.users }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Platform overview & user management.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard icon="👥" label="Total Users" value={s.users?.total ?? 0} sub={`${s.users?.students ?? 0} students`} />
        <StatCard icon="🟢" label="Active (7 days)" value={s.users?.active ?? 0} />
        <StatCard icon="🧑‍🤝‍🧑" label="Study Groups" value={s.groups ?? 0} />
        <StatCard icon="🗂" label="Total Tasks" value={s.tasks?.total ?? 0} sub={`${s.tasks?.completion_rate ?? 0}% completed`} />
        <StatCard icon="⏱️" label="Total Focus" value={`${s.totalFocusHours ?? 0}h`} />
      </div>

      <div className="card">
        <h2 className="mb-3 font-semibold">New users per month</h2>
        {signups.length ? (
          <MonthlyTasksChart monthly={signups} />
        ) : (
          <p className="grid h-40 place-items-center text-sm text-slate-400">No signup data yet.</p>
        )}
      </div>

      {/* User management */}
      <div className="card space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-semibold">Users</h2>
          <input className="input max-w-xs" placeholder="🔍 Search name or email…"
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>

        <Alert>{error}</Alert>

        {users.loading ? (
          <div className="grid h-32 place-items-center"><Spinner /></div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400 dark:border-slate-700">
                    <th className="pb-2.5">Name</th>
                    <th className="pb-2.5">Email</th>
                    <th className="pb-2.5">Role</th>
                    <th className="pb-2.5">Joined</th>
                    <th className="pb-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {(users.data?.users || []).map((u) => (
                    <tr key={u.id}>
                      <td className="py-3 font-medium">{u.name}</td>
                      <td className="py-3 text-slate-500 dark:text-slate-400">{u.email}</td>
                      <td className="py-3"><Badge variant={u.role === 'admin' ? 'brand' : 'pending'}>{u.role}</Badge></td>
                      <td className="py-3 text-slate-500 dark:text-slate-400">
                        {new Date(u.created_at).toLocaleDateString('en-GB')}
                      </td>
                      <td className="py-3 text-right">
                        {u.id !== me.id && (
                          <button className="btn-ghost h-8 px-2.5 text-rose-500" onClick={() => handleDelete(u)}>Delete</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between text-sm">
              <p className="text-slate-400">{users.data?.total ?? 0} users</p>
              <div className="flex gap-2">
                <button className="btn-ghost ring-1 ring-slate-200 dark:ring-slate-700" disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}>← Prev</button>
                <span className="grid place-items-center px-2 font-medium">
                  {page} / {users.data?.pages || 1}
                </span>
                <button className="btn-ghost ring-1 ring-slate-200 dark:ring-slate-700"
                  disabled={page >= (users.data?.pages || 1)}
                  onClick={() => setPage((p) => p + 1)}>Next →</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
