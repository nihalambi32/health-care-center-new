import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Activity,
  Pill,
  Bell,
  Calendar,
  LineChart,
  Bot,
  Settings,
  LogOut,
  X,
} from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/utils';

export const Sidebar: React.FC = () => {
  const { t } = useTranslation();
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const logout = useAuthStore((state) => state.logout);

  const navigation = [
    { name: t('nav.dashboard'), href: '/dashboard', icon: LayoutDashboard },
    { name: t('nav.logs'), href: '/logs', icon: Activity },
    { name: t('nav.medicines'), href: '/medicines', icon: Pill },
    { name: t('nav.reminders'), href: '/reminders', icon: Bell },
    { name: t('nav.appointments'), href: '/appointments', icon: Calendar },
    { name: t('nav.analytics'), href: '/analytics', icon: LineChart },
    { name: t('nav.assistant'), href: '/assistant', icon: Bot },
    { name: t('nav.settings'), href: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Sidebar Rail */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 glass-panel border-r border-slate-200/60 dark:border-slate-800/60 flex flex-col justify-between py-5 px-3 transform transition-transform duration-300 ease-in-out lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between px-3">
            <div className="flex items-center space-x-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-vital-emerald animate-pulse"></span>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                CLINICAL PORTAL
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                      isActive
                        ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20 font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                    )
                  }
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800/60 px-2">
          <button
            onClick={() => logout()}
            className="flex items-center space-x-3 w-full px-3.5 py-2.5 rounded-xl text-sm font-medium text-vital-coral hover:bg-rose-500/10 transition"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span>{t('nav.logout')}</span>
          </button>
        </div>
      </aside>
    </>
  );
};
