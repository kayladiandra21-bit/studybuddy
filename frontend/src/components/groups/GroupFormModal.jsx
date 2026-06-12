import { useEffect, useState } from 'react';
import Modal from '../ui/Modal';
import Alert from '../ui/Alert';
import { groupService } from '../../services/groupService';

const EMPTY = { group_name: '', subject: '', description: '', schedule: '' };

export default function GroupFormModal({ open, onClose, onSaved, group }) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setError('');
    setForm(group || EMPTY);
  }, [group, open]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function handleSave() {
    setError('');
    if (!form.group_name.trim() || !form.subject.trim()) {
      return setError('Group name and subject are required.');
    }
    setSaving(true);
    try {
      if (group) await groupService.update(group.id, form);
      else await groupService.create(form);
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save the group.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={group ? 'Edit group' : 'Create study group'}>
      <div className="space-y-4">
        <Alert>{error}</Alert>
        <div>
          <label className="label">Group name</label>
          <input className="input" placeholder="e.g. Web Dev Warriors" value={form.group_name} onChange={set('group_name')} />
        </div>
        <div>
          <label className="label">Subject</label>
          <input className="input" placeholder="e.g. Web Development" value={form.subject} onChange={set('subject')} />
        </div>
        <div>
          <label className="label">Description <span className="text-slate-400">(optional)</span></label>
          <textarea className="input min-h-16" value={form.description || ''} onChange={set('description')} />
        </div>
        <div>
          <label className="label">Schedule <span className="text-slate-400">(optional)</span></label>
          <input className="input" placeholder="e.g. Tue & Thu, 19:00" value={form.schedule || ''} onChange={set('schedule')} />
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : group ? 'Save changes' : 'Create group'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
