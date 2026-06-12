// pages/Notifications.jsx
import { Link } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import { notificationService } from '../services/notificationService';
import Spinner from '../components/ui/Spinner';

const ICONS = { deadline: '⏰', exam: '📚', meeting: '👥', task: '📝', system: '🔔' };

export default function Notifications() {
  const { data, loading, refetch } = useFetch(() => notificationService.list());
  const notifications = data?.notifications || [];
  const unread = data?.unreadCount || 0;

  async function handleRead(n) {
    if (!n.is_read) {
      await notificationService.markRead(n.id);
      refetch();
    }
  }

  async function handleReadAll() {
    await notificationService.markAllRead();
    refetch();
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{unread} unread</p>
        </div>
        {unread > 0 && (
          <button className="btn-ghost ring-1 ring-slate-200 dark:ring-slate-700" onClick={handleReadAll}>
            Mark all as read
          </button>
        )}
      </div>

      <div className="card">
        {loading ? (
          <div className="grid h-40 place-items-center"><Spinner /></div>
        ) : notifications.length === 0 ? (
          <p className="py-14 text-center text-sm text-slate-400">
            No notifications yet. Reminders for deadlines, exams and meetings will appear here. 🔔
          </p>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {notifications.map((n) => (
              <li key={n.id}>
                <Link
                  to={n.link || '#'}
                  onClick={() => handleRead(n)}
                  className={`flex items-start gap-3 px-1 py-3.5 transition hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                    !n.is_read ? 'font-medium' : 'opacity-60'
                  }`}
                >
                  <span className="text-xl">{ICONS[n.type] || '🔔'}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm">{n.message}</p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {new Date(n.created_at).toLocaleString('en-GB')}
                    </p>
                  </div>
                  {!n.is_read && <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-brand-500" />}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
