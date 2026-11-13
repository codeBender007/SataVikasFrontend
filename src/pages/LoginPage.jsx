import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Eye, EyeOff, LogIn, Sun, Moon, UserPlus, CheckCircle2 } from 'lucide-react';
import CreateUserModal from '../components/auth/CreateUserModal';

export default function LoginPage() {
  const { login } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successNotice, setSuccessNotice] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleUserCreated = (userData) => {
    setUsername(userData.username || '');
    setPassword(userData.password || '');
    setSuccessNotice(`Account "${userData.fullName || userData.username}" created! Credentials have been pre-filled. Click Sign In to continue.`);
    setError('');
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50 to-blue-100 p-4 transition-colors duration-300 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      <div className="absolute inset-0 pointer-events-none opacity-20 dark:opacity-10" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234f46e5' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4h-4z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />

      <div className="absolute right-4 top-4 z-20">
        <button onClick={toggleTheme} className="flex cursor-pointer items-center gap-2 rounded-2xl border border-slate-200 bg-white/90 p-3 text-xs font-semibold text-slate-700 shadow-lg backdrop-blur-md transition-all duration-300 hover:bg-white dark:border-slate-700 dark:bg-slate-800/80 dark:text-amber-400 dark:hover:bg-slate-700/80">
          {isDark ? <><Sun size={18} className="text-amber-400 animate-spin-slow" /><span>Light Mode</span></> : <><Moon size={18} className="text-indigo-600" /><span>Dark Mode</span></>}
        </button>
      </div>

      <div className="relative my-8 w-full max-w-md animate-slide-up">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center justify-center rounded-2xl border border-slate-200/80 bg-white px-5 py-3 shadow-xl shadow-indigo-500/10 dark:border-slate-700/80 dark:bg-slate-900/90 backdrop-blur-md">
            <img src={`${import.meta.env.BASE_URL}sata-vikas-logo-transparent.png`} alt="Sata Vikas Logo" className="h-10 w-auto object-contain" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">Production &amp; TPM Tracker</h1>
          <p className="mt-1 text-xs font-medium text-indigo-600 dark:text-indigo-300 sm:text-sm">Sata Vikas India Pvt Ltd · Palwal Plant</p>
        </div>

        <div className="rounded-3xl border border-white bg-white/90 p-6 shadow-2xl backdrop-blur-2xl dark:border-slate-800 dark:bg-slate-900/90 sm:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Sign In</h2>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 sm:text-sm">Sign in with your registered username and password.</p>
          </div>

          {successNotice && (
            <div className="mb-5 flex items-start gap-2 rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-700 animate-fade-in dark:border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-200">
              <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>{successNotice}</span>
            </div>
          )}

          {error && <div className="mb-5 rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700 animate-fade-in dark:border-red-500/30 dark:bg-red-500/20 dark:text-red-200">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-200">Username</label>
              <input type="text" value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Enter your username" autoComplete="username" className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-white/15 dark:bg-slate-950/60 dark:text-white dark:placeholder:text-slate-500" required />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-200">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" autoComplete="current-password" className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-11 text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-white/15 dark:bg-slate-950/60 dark:text-white dark:placeholder:text-slate-500" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer text-slate-400 hover:text-slate-700 dark:hover:text-slate-200" aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-700 px-4 py-3.5 text-sm font-bold text-white shadow-xl shadow-indigo-600/30 transition-all duration-200 hover:from-indigo-500 hover:to-indigo-600 hover:shadow-2xl hover:shadow-indigo-600/50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-slate-900">
              {loading ? <><span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Signing in...</> : <><LogIn size={18} /> Sign In to Dashboard</>}
            </button>
          </form>

         
         
        </div>
       
      </div>
     
    </div>
  );
}

