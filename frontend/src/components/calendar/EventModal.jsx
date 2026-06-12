// View / create / edit a calendar event.
// mode: 'create' | 'view'. Task items are read-only here (managed on the Tasks page).
import { useEffect, useState } from 'react';
import Modal from '../ui/Modal';
import Alert from '../ui/Alert';
import Badge from '../ui/Badge';
import { eventService } from '../../services/eventService';

const EMPTY = { title: '', description: '', category: 'assignment', event_date: '', end_date: '' };
const CATEGORIES = [
  { value: 'assignment', label: 'Assignment' },
  { value: 'exam', label: 'Exam' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'group_study', label: 'Group Study' },
];

function toInput(d) { return d ? String(d).replace(' ', 'T').slice(0, 16) : ''; }
function toSql(v) { return v ? v.replace('T', ' ') + ':00' : null; }

export default function EventModal({ open, onClose, onSaved, selected, defaultDate }) {
  const isTask = selected?.source === 'task';
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setError('');
    setEditing(!selected); // creating → straight to the form
    setForm(
      selected
        ? {
            title: selected.title,
            description: selected.description || '',
            category: selected.category,
            event_date: toInput(selected.start),
            end_date: toInput(selected.end),
          }
        : { ...EMPTY, event_date: defaultDate ? `${defaultDate}T09:00` : '' }
    );
  }, [selected, defaultDate, open]);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  async function handleSave() {
    setError('');
    if (!form.title.trim() || !form.event_date) return setError('Title and date are required.');
    setSaving(true);
    try {
      const payload = { ...form, event_date: toSql(form.event_date), end_date: toSql(form.end_date) };
      if (selected) await eventService.update(selected.sourceId, payload);
      else await eventService.create(payload);
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save the event.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete "${selected.title}"?`)) return;
    await eventService.remove(selected.sourceId);
    onSaved();
    onClose();
  }

  // ---------- read-only view ----------
  if (selected && !editing) {
    return (
      <Modal open={open} onClose={onClose} title="Event details">
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">{selected.title}</h3>
          <Badge variant="brand">{isTask ? 'task deadline' : selected.category?.replace('_', ' ')}</Badge>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            🗓 {new Date(selected.start).toLocaleString('en-GB')}
            {selected.end && ` → ${new Date(selected.end).toLocaleString('en-GB')}`}
          </p>
          {selected.description && <p className="text-sm">{selected.description}</p>}
          <div className="flex justify-end gap-2 pt-2">
            {isTask ? (
              <p className="text-xs text-slate-400">Manage this on the Tasks page.</p>
            ) : (
              <>
                <button className="btn-danger" onClick={handleDelete}>Delete</button>
                <button className="btn-primary" onClick={() => setEditing(true)}>Edit</button>
              </>
            )}
          </div>
        </div>
      </Modal>
    );
  }

  // ---------- create / edit form ----------
  return (
    <Modal open={open} onClose={onClose} title={selected ? 'Edit event' : 'New event'}>
      <div className="space-y-4">
        <Alert>{error}</Alert>
        <div>
          <label className="label">Title</label>
          <input className="input" placeholder="e.g. Midterm exam — Databases" value={form.title} onChange={set('title')} />
        </div>
        <div>
          <label className="label">Category</label>
          <select className="input" value={form.category} onChange={set('category')}>
            {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Starts</label>
            <input type="datetime-local" className="input" value={form.event_date} onChange={set('event_date')} />
          </div>
          <div>
            <label className="label">Ends <span className="text-slate-400">(optional)</span></label>
            <input type="datetime-local" className="input" value={form.end_date} onChange={set('end_date')} />
          </div>
        </div>
        <div>
          <label className="label">Notes <span className="text-slate-400">(optional)</span></label>
          <textarea className="input min-h-16" value={form.description} onChange={set('description')} />
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save event'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
