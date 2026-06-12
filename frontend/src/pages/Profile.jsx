// pages/Profile.jsx — edit profile, avatar, change password, dark mode
import { useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { profileService } from '../services/profileService';
import { API_URL } from '../services/api';
import Alert from '../components/ui/Alert';

export default function Profile() {
  const { user, setUser } = useAuth();
  const { dark, toggle } = useTheme();
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    name: user?.name || '',
    major: user?.major || '',
    university: user?.university || '',
  });
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' });
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [saving, setSaving] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const setP = (k) => (e) => setPw({ ...pw, [k]: e.target.value });
  const show = (type, text) => { setMsg({ type, text }); setTimeout(() => setMsg({ type: '', text: '' }), 4000); };

  async function saveProfile() {
    setSaving(true);
    try {
      const res = await profileService.update({ ...form, dark_mode: dark });
      setUser(res.data.user);
      show('success', 'Profile updated! ✅');
    } catch (err) {
      show('error', err.response?.data?.message || 'Could not save.');
    } finally {
      setSaving(false);
    }
  }

  async function changePassword() {
    if (pw.newPassword.length < 6) return show('error', 'New password must be at least 6 characters.');
    try {
      await profileService.changePassword(pw);
      setPw({ currentPassword: '', newPassword: '' });
      show('success', 'Password changed! 🔒');
    } catch (err) {
      show('error', err.response?.data?.message || 'Could not change password.');
    }
  }

  async function uploadAvatar(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await profileService.uploadPicture(fd);
      setUser({ ...user, profile_image: res.data.profile_image });
      show('success', 'Profile picture updated! 📸');
    } catch (err) {
      show('error', err.response?.data?.message || 'Upload failed (image, max 2 MB).');
    } finally {
      e.target.value = '';
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <h1 className="text-2xl font-bold">Profile</h1>
      {msg.text && <Alert type={msg.type}>{msg.text}</Alert>}

      {/* Avatar + identity */}
      <div className="card flex items-center gap-4">
        {user?.profile_image ? (
          <img src={`${API_URL}${user.profile_image}`} alt="avatar"
            className="h-16 w-16 rounded-2xl object-cover ring-2 ring-brand-200 dark:ring-brand-500/30" />
        ) : (
          <span className="grid h-16 w-16 place-items-center rounded-2xl bg-brand-600 text-2xl font-bold text-white">
            {user?.name?.[0]?.toUpperCase()}
          </span>
        )}
        <div className="flex-1">
          <p className="font-semibold">{user?.name}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={uploadAvatar} />
        <button className="btn-ghost ring-1 ring-slate-200 dark:ring-slate-700" onClick={() => fileRef.current?.click()}>
          Change photo
        </button>
      </div>

      {/* Edit profile */}
      <div className="card space-y-4">
        <h2 className="font-semibold">Account details</h2>
        <div>
          <label className="label">Full name</label>
          <input className="input" value={form.name} onChange={set('name')} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Major</label>
            <input className="input" placeholder="e.g. Informatics" value={form.major} onChange={set('major')} />
          </div>
          <div>
            <label className="label">University</label>
            <input className="input" placeholder="e.g. ITB" value={form.university} onChange={set('university')} />
          </div>
        </div>
        <button className="btn-primary" onClick={saveProfile} disabled={saving}>
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>

      {/* Dark mode */}
      <div className="card flex items-center justify-between">
        <div>
          <h2 className="font-semibold">Dark mode</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Easier on the eyes at night.</p>
        </div>
        <button onClick={toggle}
          className={`relative h-8 w-14 rounded-full transition ${dark ? 'bg-brand-600' : 'bg-slate-300'}`}
          aria-label="Toggle dark mode">
          <span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all ${dark ? 'left-7' : 'left-1'}`} />
        </button>
      </div>

      {/* Change password */}
      <div className="card space-y-4">
        <h2 className="font-semibold">Change password</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Current password</label>
            <input type="password" className="input" value={pw.currentPassword} onChange={setP('currentPassword')} />
          </div>
          <div>
            <label className="label">New password</label>
            <input type="password" className="input" placeholder="Min. 6 characters" value={pw.newPassword} onChange={setP('newPassword')} />
          </div>
        </div>
        <button className="btn-primary" onClick={changePassword}>Update password</button>
      </div>
    </div>
  );
}
