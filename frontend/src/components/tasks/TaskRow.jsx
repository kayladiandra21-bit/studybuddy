import Badge from '../ui/Badge';

function formatDate(d) {
  return new Date(d).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export default function TaskRow({ task, onToggle, onEdit, onDelete }) {
  const done = task.status === 'completed';
  const overdue = !done && new Date(task.due_date) < new Date();

  return (
    <li className="flex items-center gap-3 py-3.5">
      <input
        type="checkbox"
        checked={done}
        onChange={() => onToggle(task)}
        className="h-5 w-5 shrink-0 cursor-pointer rounded accent-brand-600"
        title={done ? 'Mark as pending' : 'Mark as completed'}
      />
      <div className="min-w-0 flex-1">
        <p className={`truncate font-medium ${done ? 'text-slate-400 line-through' : ''}`}>
          {task.title}
        </p>
        <p className="text-xs text-slate-400">
          {task.subject} · due {formatDate(task.due_date)}
          {overdue && <span className="ml-1.5 font-semibold text-rose-500">overdue</span>}
        </p>
      </div>
      <Badge variant={task.priority}>{task.priority}</Badge>
      <div className="flex shrink-0 gap-1">
        <button className="btn-ghost h-9 w-9 p-0" onClick={() => onEdit(task)} title="Edit">✏️</button>
        <button className="btn-ghost h-9 w-9 p-0" onClick={() => onDelete(task)} title="Delete">🗑️</button>
      </div>
    </li>
  );
}
