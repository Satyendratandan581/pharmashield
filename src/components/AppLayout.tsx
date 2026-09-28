import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useMedicines } from '../context/MedicineContext';
import { useToast } from './Toast';
import { clearSession, loadSession } from '../lib/storage';
import { formatTodayLong } from '../lib/date';
import {
  BellIcon,
  CloseIcon,
  DashboardIcon,
  LogoutIcon,
  MenuIcon,
  PillIcon,
  ShieldIcon,
} from './icons';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: DashboardIcon, end: true },
  { to: '/medicines', label: 'Medicines', icon: PillIcon, end: false },
  { to: '/alerts', label: 'Alerts', icon: BellIcon, end: false },
];

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { stats, resetToSampleData } = useMedicines();
  const toast = useToast();
  const session = loadSession();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    clearSession();
    navigate('/login', { replace: true });
  };

  const handleReset = () => {
    resetToSampleData();
    toast.info('Sample inventory restored', 'All demo batches are back to their original state.');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {sidebarOpen ? (
        <div
          className="fixed inset-0 z-30 animate-fade-in bg-slate-900/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
        aria-label="Sidebar navigation"
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-100 px-5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
              <ShieldIcon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-bold leading-tight text-slate-900">PharmaShield</p>
              <p className="text-[11px] leading-tight text-slate-500">Expiry Alert System</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 lg:hidden"
            aria-label="Close navigation"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Inventory
          </p>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-100'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <span className="flex items-center gap-3">
                  <Icon className="h-5 w-5" />
                  {item.label}
                </span>
                {item.to === '/alerts' && stats.totalAlerts > 0 ? (
                  <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-700">
                    {stats.totalAlerts}
                  </span>
                ) : null}
              </NavLink>
            );
          })}

          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold text-slate-700">Alert thresholds</p>
            <ul className="mt-2.5 space-y-1.5 text-[11px] text-slate-600">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500" /> Expired
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-orange-500" /> 0–30 days
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> 31–90 days
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> 90+ days
              </li>
            </ul>
          </div>
        </nav>

        <div className="border-t border-slate-100 p-4">
          <button
            type="button"
            onClick={handleReset}
            className="mb-3 w-full rounded-lg border border-dashed border-slate-300 px-3 py-2 text-xs font-semibold text-slate-500 transition hover:border-brand-300 hover:text-brand-700"
          >
            Reset sample inventory
          </button>
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
              {session?.name?.charAt(0).toUpperCase() ?? 'P'}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">
                {session?.name ?? 'Pharmacist'}
              </p>
              <p className="truncate text-xs text-slate-500">{session?.email ?? ''}</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg p-2 text-slate-400 transition hover:bg-white hover:text-rose-600"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogoutIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg border border-slate-200 p-2 text-slate-600 lg:hidden"
              aria-label="Open navigation"
            >
              <MenuIcon className="h-5 w-5" />
            </button>
            <div>
              <p className="text-sm font-semibold text-slate-900">Central Pharmacy Store</p>
              <p className="text-xs text-slate-500">{formatTodayLong()}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 sm:inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Expiry monitoring active
            </span>
            <button
              type="button"
              onClick={() => navigate('/alerts')}
              className="relative rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50"
              aria-label={`${stats.totalAlerts} active alerts`}
            >
              <BellIcon className="h-5 w-5" />
              {stats.totalAlerts > 0 ? (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                  {stats.totalAlerts}
                </span>
              ) : null}
            </button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
