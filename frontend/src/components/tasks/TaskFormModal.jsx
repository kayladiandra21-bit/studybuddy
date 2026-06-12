// Create/Edit task modal. Pass `task` to edit, omit to create.
import { useEffect, useState } from 'react';
import Modal from '../ui/Modal';
import Alert from '../ui/Alert';
import { taskService } from '../../services/taskService';

const EMPTY = { title: '', description: '', subject: '', priority: 'medium', due_date: '' };

// MySQL DATETIME → value for <input type="datetime-local">
function toInputValue(d) {
  if (!d) return '';
  return String(d).replace(' ', 'T').slice(0, 16);
}

export default function TaskFormModal({ open, onClose, onSaved, task }) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setError('');
    setForm(task ? { ...task, due_date: toInputValue(task.due_date) } : EMPTY);
  }, [task, open]);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  async function handleSave() {
    setError('');
    if (!form.title.trim() || !form.subject.trim() || !form.due_date) {
      return setError('Title, subject and due date are required.');
    }
    setSaving(true);
    try {
      const payload = { ...form, due_date: form.due_date.replace('T', ' ') + ':00' };
      if (task) await taskService.update(task.id, payload);
      else await taskService.create(payload);
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save the task.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={task ? 'Edit task' : 'New task'}>
      <div className="space-y-4">
        <Alert>{error}</Alert>
        <div>
          <label className="label">Title</label>
          <input className="input" placeholder="e.g. Database assignment ch. 3" value={form.title} onChange={set('title')} />
        </div>
        <div>
          <label className="label">Description <span className="text-slate-400">(optional)</span></label>
          <textarea className="input min-h-20" placeholder="Details, links, notes…" value={form.description || ''} onChange={set('description')} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Subject</label>
            <input className="input" placeholder="e.g. Web Development" value={form.subject} onChange={set('subject')} />
          </div>
          <div>
            <label className="label">Priority</label>
            <select className="input" value={form.priority} onChange={set('priority')}>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
        <div>
          <label className="label">Due date</label>
          <input type="datetime-local" className="input" value={form.due_date} onChange={set('due_date')} />
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : task ? 'Save changes' : 'Create task'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
