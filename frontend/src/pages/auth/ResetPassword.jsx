import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../../services/authService';
import Alert from '../../components/ui/Alert';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError('');
    setLoading(true);
    try {
      await authService.resetPassword(token, password);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed. The link may have expired.');
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="space-y-4 text-center">
        <Alert>This reset link is invalid.</Alert>
        <Link to="/forgot-password" className="font-medium text-brand-600 hover:underline dark:text-brand-400">
          Request a new one
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Choose a new password 🔒</h1>
      <Alert>{error}</Alert>
      <div>
        <label className="label">New password</label>
        <input type="password" className="input" placeholder="Min. 6 characters"
          value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full">
        {loading ? 'Saving…' : 'Save new password'}
      </button>
    </div>
  );
}
