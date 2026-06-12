import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import Alert from '../../components/ui/Alert';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError('');
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">Forgot your password? 🔑</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Enter your email and we'll send a reset link.
        </p>
      </div>

      <Alert>{error}</Alert>
      {sent && <Alert type="success">If that email is registered, a reset link has been sent.</Alert>}

      <div>
        <label className="label">Email</label>
        <input type="email" className="input" placeholder="you@university.ac.id"
          value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>

      <button onClick={handleSubmit} disabled={loading || sent} className="btn-primary w-full">
        {loading ? 'Sending…' : 'Send reset link'}
      </button>

      <p className="text-center text-sm">
        <Link to="/login" className="font-medium text-brand-600 hover:underline dark:text-brand-400">← Back to login</Link>
      </p>
    </div>
  );
}
