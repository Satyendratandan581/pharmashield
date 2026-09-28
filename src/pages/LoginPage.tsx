import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { loadSession, saveSession } from '../lib/storage';
import { LockIcon, MailIcon, ShieldIcon, SparkIcon } from '../components/icons';

const DEMO_EMAIL = 'pharmacist@pharmashield.io';
const DEMO_PASSWORD = 'pharmashield';

export function LoginPage() {
  const navigate = useNavigate();
  const session = loadSession();

  const [email, setEmail] = useState(DEMO_EMAIL);
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (session) return <Navigate to="/" replace />;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Enter both email and password to continue.');
      return;
    }

    setSubmitting(true);
    // Demo authentication - no backend by design.
    window.setTimeout(() => {
      saveSession({
        email: email.trim(),
        name: 'Ananya Rao',
        signedInAt: Date.now(),
      });
      navigate('/', { replace: true });
    }, 450);
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-slate-900 p-10 lg:flex">
        <div
          className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-brand-600/20 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-sky-500/20 blur-3xl"
          aria-hidden
        />
        <div className="relative flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white">
            <ShieldIcon className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-bold text-white">PharmaShield</p>
            <p className="text-xs text-slate-400">Medicine Management &amp; Expiry Alerts</p>
          </div>
        </div>

        <div className="relative">
          <h1 className="max-w-md text-4xl font-bold leading-tight tracking-tight text-white">
            Never dispense a medicine past its expiry date.
          </h1>
          <p className="mt-4 max-w-md text-sm leading-6 text-slate-300">
            PharmaShield tracks every batch, calculates remaining shelf life automatically and raises
            alerts before stock becomes unusable.
          </p>
          <ul className="mt-8 space-y-3">
            {[
              'Automatic day-level expiry calculation',
              'Critical alerts for batches under 30 days',
              'One-click removal of expired stock',
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm text-slate-200">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-brand-300">
                  <SparkIcon className="h-3.5 w-3.5" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-slate-500">
          Demo environment · Data is stored locally in your browser.
        </p>
      </div>

      <div className="flex w-full items-center justify-center px-4 py-10 sm:px-8 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white">
              <ShieldIcon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-bold text-slate-900">PharmaShield</p>
              <p className="text-xs text-slate-500">Medicine Management &amp; Expiry Alerts</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Sign in</h2>
          <p className="mt-1.5 text-sm text-slate-500">
            Use the pre-filled demo credentials to access the dashboard.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label htmlFor="email" className="text-sm font-medium text-slate-700">
                Email address
              </label>
              <div className="relative mt-1.5">
                <MailIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="block w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium text-slate-700">
                  Password
                </label>
                <span className="text-xs text-slate-400">Demo mode</span>
              </div>
              <div className="relative mt-1.5">
                <LockIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="block w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>

            {error ? (
              <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 ring-1 ring-inset ring-rose-200">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? 'Signing in…' : 'Sign in to dashboard'}
            </button>
          </form>

          <div className="mt-8 rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Demo credentials
            </p>
            <dl className="mt-2.5 space-y-1 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Email</dt>
                <dd className="font-medium text-slate-900">{DEMO_EMAIL}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Password</dt>
                <dd className="font-medium text-slate-900">{DEMO_PASSWORD}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
