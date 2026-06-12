import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Alert from '../../components/ui/Alert';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', major: '', university: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError('');
    if (form.password.length < 6) return setError('Password must be at least 6 characters.');
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">Create your account ✨</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Free for students. Takes 30 seconds.</p>
      </div>

      <Alert>{error}</Alert>

      <div>
        <label className="label">Full name</label>
        <input className="input" placeholder="Kayla Diandra" value={form.name} onChange={set('name')} />
      </div>
      <div>
        <label className="label">Email</label>
        <input type="email" className="input" placeholder="you@university.ac.id" value={form.email} onChange={set('email')} />
      </div>
      <div>
        <label className="label">Password</label>
        <input type="password" className="input" placeholder="Min. 6 characters" value={form.password} onChange={set('password')} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Major <span className="text-slate-400">(optional)</span></label>
          <input className="input" placeholder="Informatics" value={form.major} onChange={set('major')} />
        </div>
        <div>
          <label className="label">University <span className="text-slate-400">(optional)</span></label>
          <input className="input" placeholder="ITB" value={form.university} onChange={set('university')} />
        </div>
      </div>

      <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full">
        {loading ? 'Creating account…' : 'Create account'}
      </button>

      <p className="text-center text-sm text-slate-500 dark:text-slate-400">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-brand-600 hover:underline dark:text-brand-400">Log in</Link>
      </p>
    </div>
  );
}
