// pages/Groups.jsx — browse, search, create, join study groups
import { useState } from 'react';
import { Link } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import useDebounce from '../hooks/useDebounce';
import { groupService } from '../services/groupService';
import GroupFormModal from '../components/groups/GroupFormModal';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';

export default function Groups() {
  const [search, setSearch] = useState('');
  const debounced = useDebounce(search);
  const [modalOpen, setModalOpen] = useState(false);

  const { data, loading, refetch } = useFetch(
    () => groupService.list({ search: debounced }),
    [debounced]
  );
  const groups = data?.groups || [];

  async function handleJoin(g) {
    await groupService.join(g.id);
    refetch();
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Study Groups</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Join a group or start your own.
          </p>
        </div>
        <button className="btn-primary" onClick={() => setModalOpen(true)}>＋ Create group</button>
      </div>

      <input
        className="input max-w-md"
        placeholder="🔍 Search groups…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading ? (
        <div className="grid h-40 place-items-center"><Spinner /></div>
      ) : groups.length === 0 ? (
        <div className="card py-16 text-center text-sm text-slate-400">
          No groups yet. Be the first to create one! 🚀
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((g) => (
            <div key={g.id} className="card flex flex-col">
              <div className="mb-2 flex items-start justify-between gap-2">
                <h3 className="font-semibold leading-snug">{g.group_name}</h3>
                <Badge variant="brand">{g.subject}</Badge>
              </div>
              <p className="line-clamp-2 flex-1 text-sm text-slate-500 dark:text-slate-400">
                {g.description || 'No description.'}
              </p>
              <p className="mt-3 text-xs text-slate-400">
                👥 {g.member_count} member{g.member_count !== 1 && 's'} · by {g.owner_name}
                {g.schedule && <> · 🗓 {g.schedule}</>}
              </p>
              <div className="mt-4">
                {g.is_member ? (
                  <Link to={`/groups/${g.id}`} className="btn-primary w-full">Open group</Link>
                ) : (
                  <button className="btn-ghost w-full ring-1 ring-slate-200 dark:ring-slate-700" onClick={() => handleJoin(g)}>
                    Join group
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <GroupFormModal open={modalOpen} onClose={() => setModalOpen(false)} onSaved={refetch} />
    </div>
  );
}
