import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Alert from '../../components/ui/Alert';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', rememberMe: false });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password, form.rememberMe);
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">Welcome back 👋</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Log in to your StudyBuddy account.</p>
      </div>

      <Alert>{error}</Alert>

      <div>
        <label className="label" htmlFor="email">Email</label>
        <input id="email" type="email" className="input" placeholder="you@university.ac.id"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()} />
      </div>
      <div>
        <label className="label" htmlFor="password">Password</label>
        <input id="password" type="password" className="input" placeholder="••••••••"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()} />
      </div>

      <div className="flex items-center justify-between text-sm">
        <label className="flex cursor-pointer items-center gap-2">
          <input type="checkbox" className="h-4 w-4 rounded accent-brand-600"
            checked={form.rememberMe}
            onChange={(e) => setForm({ ...form, rememberMe: e.target.checked })} />
          Remember me
        </label>
        <Link to="/forgot-password" className="font-medium text-brand-600 hover:underline dark:text-brand-400">
          Forgot password?
        </Link>
      </div>

      <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full">
        {loading ? 'Logging in…' : 'Log in'}
      </button>

      <p className="text-center text-sm text-slate-500 dark:text-slate-400">
        New here?{' '}
        <Link to="/register" className="font-medium text-brand-600 hover:underline dark:text-brand-400">
          Create an account
        </Link>
      </p>
    </div>
  );
}
