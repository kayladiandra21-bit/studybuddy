// pages/GroupDetail.jsx — tabs: Chat, Announcements, Files, Members
import { useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import { groupService } from '../services/groupService';
import { useAuth } from '../contexts/AuthContext';
import ChatWindow from '../components/groups/ChatWindow';
import GroupFormModal from '../components/groups/GroupFormModal';
import Spinner from '../components/ui/Spinner';
import Alert from '../components/ui/Alert';
import Badge from '../components/ui/Badge';

const TABS = ['Chat', 'Announcements', 'Files', 'Members'];

function formatSize(bytes) {
  if (bytes > 1024 * 1024) return (bytes / 1024 / 1024).toFixed(1) + ' MB';
  return Math.max(1, Math.round(bytes / 1024)) + ' KB';
}

export default function GroupDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('Chat');
  const [editOpen, setEditOpen] = useState(false);

  const { data, loading, refetch } = useFetch(() => groupService.getOne(id), [id]);
  const ann = useFetch(() => groupService.announcements(id), [id]);
  const files = useFetch(() => groupService.files(id), [id]);

  const [annForm, setAnnForm] = useState({ title: '', content: '' });
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [actionError, setActionError] = useState('');

  if (loading) return <div className="grid h-64 place-items-center"><Spinner /></div>;
  const group = data?.group;
  if (!group) return <Alert>Group not found.</Alert>;

  const isOwner = group.created_by === user.id || user.role === 'admin';

  async function handleLeave() {
    if (!confirm('Leave this group?')) return;
    await groupService.leave(id);
    navigate('/groups');
  }

  async function handleDeleteGroup() {
    if (!confirm(`Delete "${group.group_name}" for everyone? This cannot be undone.`)) return;
    await groupService.remove(id);
    navigate('/groups');
  }

  async function handlePostAnnouncement() {
    setActionError('');
    if (!annForm.title.trim() || !annForm.content.trim()) return;
    try {
      await groupService.addAnnouncement(id, annForm);
      setAnnForm({ title: '', content: '' });
      ann.refetch();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Could not post.');
    }
  }

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setActionError('');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      await groupService.uploadFile(id, fd);
      files.refetch();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Upload failed (max 10 MB).');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  return (
    <div className="space-y-5">
      <Link to="/groups" className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">
        ← All groups
      </Link>

      {/* Header */}
      <div className="card">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">{group.group_name}</h1>
              <Badge variant="brand">{group.subject}</Badge>
            </div>
            {group.description && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{group.description}</p>}
            <p className="mt-1 text-xs text-slate-400">
              by {group.owner_name}{group.schedule && <> · 🗓 {group.schedule}</>}
            </p>
          </div>
          <div className="flex gap-2">
            {isOwner && (
              <>
                <button className="btn-ghost ring-1 ring-slate-200 dark:ring-slate-700" onClick={() => setEditOpen(true)}>Edit</button>
                <button className="btn-danger" onClick={handleDeleteGroup}>Delete</button>
              </>
            )}
            {!isOwner && <button className="btn-ghost text-rose-500" onClick={handleLeave}>Leave group</button>}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto rounded-2xl bg-slate-100 p-1 dark:bg-slate-900">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition ${
              tab === t ? 'bg-white shadow-sm dark:bg-slate-800' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}>
            {t}
          </button>
        ))}
      </div>

      <Alert>{actionError}</Alert>

      <div className="card">
        {tab === 'Chat' && <ChatWindow groupId={Number(id)} />}

        {tab === 'Announcements' && (
          <div className="space-y-4">
            {isOwner && (
              <div className="space-y-2 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">
                <input className="input" placeholder="Announcement title"
                  value={annForm.title} onChange={(e) => setAnnForm({ ...annForm, title: e.target.value })} />
                <textarea className="input min-h-16" placeholder="What does the group need to know?"
                  value={annForm.content} onChange={(e) => setAnnForm({ ...annForm, content: e.target.value })} />
                <button className="btn-primary" onClick={handlePostAnnouncement}>Post announcement</button>
              </div>
            )}
            {(ann.data?.announcements || []).length === 0 ? (
              <p className="py-10 text-center text-sm text-slate-400">No announcements yet.</p>
            ) : (
              ann.data.announcements.map((a) => (
                <div key={a.id} className="rounded-2xl border-l-4 border-brand-500 bg-slate-50 p-4 dark:bg-slate-800/50">
                  <h4 className="font-semibold">📣 {a.title}</h4>
                  <p className="mt-1 whitespace-pre-wrap text-sm">{a.content}</p>
                  <p className="mt-2 text-xs text-slate-400">
                    {a.author_name} · {new Date(a.created_at).toLocaleDateString('en-GB')}
                  </p>
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'Files' && (
          <div className="space-y-4">
            <div>
              <input ref={fileInputRef} type="file" className="hidden" onChange={handleUpload} />
              <button className="btn-primary" disabled={uploading} onClick={() => fileInputRef.current?.click()}>
                {uploading ? 'Uploading…' : '⬆️ Upload file'}
              </button>
              <span className="ml-3 text-xs text-slate-400">PDF, docs, slides, images — max 10 MB</span>
            </div>
            {(files.data?.files || []).length === 0 ? (
              <p className="py-10 text-center text-sm text-slate-400">No shared files yet.</p>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {files.data.files.map((f) => (
                  <li key={f.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">📎 {f.file_name}</p>
                      <p className="text-xs text-slate-400">
                        {formatSize(f.file_size)} · {f.uploader_name} · {new Date(f.uploaded_at).toLocaleDateString('en-GB')}
                      </p>
                    </div>
                    <a className="btn-ghost shrink-0 ring-1 ring-slate-200 dark:ring-slate-700"
                      href={`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}${f.file_path}`}
                      target="_blank" rel="noreferrer" download>
                      Download
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {tab === 'Members' && (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {(data?.members || []).map((m) => (
              <li key={m.id} className="flex items-center gap-3 py-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-600 text-sm font-bold text-white">
                  {m.name[0]?.toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">
                    {m.name} {m.id === group.created_by && <span className="text-xs text-brand-500">· owner</span>}
                  </p>
                  <p className="text-xs text-slate-400">{[m.major, m.university].filter(Boolean).join(' · ') || 'Student'}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <GroupFormModal open={editOpen} group={group} onClose={() => setEditOpen(false)} onSaved={refetch} />
    </div>
  );
}
