// pages/Tasks.jsx — full CRUD + search, filters, sort
import { useState } from 'react';
import useFetch from '../hooks/useFetch';
import useDebounce from '../hooks/useDebounce';
import { taskService } from '../services/taskService';
import TaskFormModal from '../components/tasks/TaskFormModal';
import TaskRow from '../components/tasks/TaskRow';
import Spinner from '../components/ui/Spinner';
import Alert from '../components/ui/Alert';

export default function Tasks() {
  const [search, setSearch] = useState('');
  const [priority, setPriority] = useState('');
  const [subject, setSubject] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('due_date');
  const debouncedSearch = useDebounce(search);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const subjects = useFetch(() => taskService.subjects());
  const { data, loading, error, refetch } = useFetch(
    () => taskService.list({ search: debouncedSearch, priority, subject, status, sort }),
    [debouncedSearch, priority, subject, status, sort]
  );
  const tasks = data?.tasks || [];

  async function handleToggle(task) {
    await taskService.setStatus(task.id, task.status === 'completed' ? 'pending' : 'completed');
    refetch();
    subjects.refetch();
  }

  async function handleDelete(task) {
    if (!confirm(`Delete "${task.title}"?`)) return;
    await taskService.remove(task.id);
    refetch();
    subjects.refetch();
  }

  function openCreate() { setEditing(null); setModalOpen(true); }
  function openEdit(task) { setEditing(task); setModalOpen(true); }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Tasks</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {tasks.filter((t) => t.status === 'pending').length} pending ·{' '}
            {tasks.filter((t) => t.status === 'completed').length} completed
          </p>
        </div>
        <button className="btn-primary" onClick={openCreate}>＋ New task</button>
      </div>

      {/* Search + filters */}
      <div className="card grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <input
          className="input lg:col-span-2"
          placeholder="🔍 Search tasks…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="input" value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="">All priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select className="input" value={subject} onChange={(e) => setSubject(e.target.value)}>
          <option value="">All subjects</option>
          {(subjects.data?.subjects || []).map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <div className="grid grid-cols-2 gap-3">
          <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="completed">Done</option>
          </select>
          <select className="input" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="due_date">Deadline</option>
            <option value="priority">Priority</option>
            <option value="created_at">Newest</option>
          </select>
        </div>
      </div>

      {/* List */}
      <div className="card">
        {loading ? (
          <div className="grid h-40 place-items-center"><Spinner /></div>
        ) : error ? (
          <Alert>{error}</Alert>
        ) : tasks.length === 0 ? (
          <p className="py-12 text-center text-sm text-slate-400">
            No tasks found. Create your first one! ✨
          </p>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {tasks.map((t) => (
              <TaskRow key={t.id} task={t} onToggle={handleToggle} onEdit={openEdit} onDelete={handleDelete} />
            ))}
          </ul>
        )}
      </div>

      <TaskFormModal
        open={modalOpen}
        task={editing}
        onClose={() => setModalOpen(false)}
        onSaved={() => { refetch(); subjects.refetch(); }}
      />
    </div>
  );
}
