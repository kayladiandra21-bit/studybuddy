// Bell icon with unread badge; polls every 60s
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { notificationService } from '../services/notificationService';

export default function NotificationBell() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const res = await notificationService.list({ unread: '1' });
        if (alive) setCount(res.data.unreadCount || 0);
      } catch { /* ignore */ }
    }
    load();
    const t = setInterval(load, 60_000);
    return () => { alive = false; clearInterval(t); };
  }, []);

  return (
    <Link to="/notifications" className="btn-ghost relative h-10 w-10 rounded-xl p-0 text-lg" title="Notifications">
      🔔
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </Link>
  );
}
