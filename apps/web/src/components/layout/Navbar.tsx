import React from 'react';
import { useTranslation } from 'react-i18next';
import { Sun, Moon, Globe, Plus, Pill, Menu } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { Button } from '@/components/ui/Button';

interface NavbarProps {
  onQuickLog?: () => void;
  onTakeDose?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onQuickLog, onTakeDose }) => {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme, toggleSidebar } = useUIStore();

  const toggleLanguage = () => {
    const nextLang = i18n.language.startsWith('hi') ? 'en' : 'hi';
    i18n.changeLanguage(nextLang);
  };

  return (
    <header className="sticky top-0 z-30 w-full glass-panel border-b border-slate-200/60 dark:border-slate-800/60 px-4 lg:px-8 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary-600 to-vital-emerald flex items-center justify-center text-white font-black text-sm shadow-md shadow-primary-500/20">
            ✚
          </div>
          <span className="font-extrabold text-base tracking-tight hidden sm:inline bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            Daily Health Companion
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-primary-500/10 text-primary-400 font-bold border border-primary-500/20">
            v2.0 3D
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-3">
        {onQuickLog && (
          <Button
            size="sm"
            variant="ghost"
            leftIcon={<Plus className="w-4 h-4 text-primary-500" />}
            onClick={onQuickLog}
            className="hidden sm:inline-flex"
          >
            {t('nav.quickLog')}
          </Button>
        )}
        {onTakeDose && (
          <Button
            size="sm"
            variant="secondary"
            leftIcon={<Pill className="w-4 h-4 text-vital-emerald" />}
            onClick={onTakeDose}
            className="hidden sm:inline-flex"
          >
            {t('nav.takeDose')}
          </Button>
        )}

        {/* Bilingual EN/HI Switch */}
        <button
          onClick={toggleLanguage}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-1 text-xs font-bold transition"
          title="Switch Language"
        >
          <Globe className="w-4 h-4 text-primary-500" />
          <span>{i18n.language.startsWith('hi') ? 'हिन्दी' : 'EN'}</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>
      </div>
    </header>
  );
};
