import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Shield, Moon, Sun, Download, Trash2, Globe } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { apiClient } from '@/lib/apiClient';
import { useToastStore } from '@/components/ui/Toast';

export const SettingsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useUIStore();
  const addToast = useToastStore((state) => state.addToast);

  const [aiContextOptIn, setAiContextOptIn] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleExportData = async () => {
    try {
      const response = await apiClient.get('/privacy/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `daily-health-export-${Date.now()}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      addToast('Medical data export downloaded safely!', 'success');
    } catch {
      addToast('Failed to export medical data.', 'error');
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsDeleting(true);
    try {
      await apiClient.delete('/privacy/account', { data: { password: deletePassword } });
      addToast('Account permanently deleted.', 'info');
      logout();
    } catch {
      addToast('Incorrect password confirmation.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">
          {t('settings.title')}
        </h1>
        <p className="text-xs text-slate-500">{t('settings.subtitle')}</p>
      </div>

      {/* User Profile Card */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center space-x-3 pb-3 border-b border-slate-200/60 dark:border-slate-800/60">
          <User className="w-5 h-5 text-primary-500" />
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            {t('settings.profile')}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          <div>
            <span className="text-slate-400">NAME</span>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{user?.name || 'Authorized Patient'}</p>
          </div>
          <div>
            <span className="text-slate-400">EMAIL</span>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{user?.email || 'patient@internal.care'}</p>
          </div>
          <div>
            <span className="text-slate-400">TIMEZONE</span>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{user?.timezone || 'UTC'}</p>
          </div>
          <div>
            <span className="text-slate-400">LOCALE</span>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{user?.locale || 'en'}</p>
          </div>
        </div>
      </Card>

      {/* Privacy & AI Consent */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center space-x-3 pb-3 border-b border-slate-200/60 dark:border-slate-800/60">
          <Shield className="w-5 h-5 text-vital-emerald" />
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            {t('settings.aiConsent')}
          </h3>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500 max-w-lg">{t('settings.aiConsentDesc')}</p>
          <input
            type="checkbox"
            checked={aiContextOptIn}
            onChange={(e) => {
              setAiContextOptIn(e.target.checked);
              addToast(
                e.target.checked ? 'AI health context sharing enabled' : 'AI health context sharing disabled',
                'info'
              );
            }}
            className="w-5 h-5 rounded text-primary-600 focus:ring-primary-500 cursor-pointer"
          />
        </div>
      </Card>

      {/* Preferences (Theme & Language) */}
      <Card className="p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 pb-3 border-b border-slate-200/60 dark:border-slate-800/60">
          Preferences
        </h3>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            {theme === 'dark' ? <Moon className="w-5 h-5 text-amber-400" /> : <Sun className="w-5 h-5 text-slate-600" />}
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{t('settings.theme')}</h4>
              <p className="text-xs text-slate-400">Current: {theme === 'dark' ? 'Clinical Dark Obsidian' : 'Clinical Alabaster'}</p>
            </div>
          </div>
          <Button size="sm" variant="secondary" onClick={toggleTheme}>
            Toggle Theme
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-3 border-t border-slate-200/60 dark:border-slate-800/60">
          <div className="flex items-center space-x-3">
            <Globe className="w-5 h-5 text-primary-500" />
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{t('settings.language')}</h4>
              <p className="text-xs text-slate-400">English & हिन्दी (Bilingual)</p>
            </div>
          </div>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => i18n.changeLanguage(i18n.language.startsWith('hi') ? 'en' : 'hi')}
          >
            Switch to {i18n.language.startsWith('hi') ? 'English' : 'हिन्दी'}
          </Button>
        </div>
      </Card>

      {/* Data Rights & Permanent Actions */}
      <Card className="p-6 space-y-4 border-rose-500/20">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 pb-3 border-b border-slate-200/60 dark:border-slate-800/60">
          Data Rights & Security
        </h3>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Export All Medical Data</h4>
            <p className="text-xs text-slate-500">Download decrypted JSON bundle containing all vitals, medicines, and appointments.</p>
          </div>
          <Button size="sm" variant="secondary" leftIcon={<Download className="w-4 h-4" />} onClick={handleExportData}>
            Export JSON
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-3 border-t border-slate-200/60 dark:border-slate-800/60">
          <div>
            <h4 className="text-sm font-bold text-vital-coral">Permanent Account Deletion</h4>
            <p className="text-xs text-slate-500">Cascades and removes all health logs, prescriptions, and sessions permanently.</p>
          </div>
          <Button size="sm" variant="danger" leftIcon={<Trash2 className="w-4 h-4" />} onClick={() => setDeleteModalOpen(true)}>
            Delete Account
          </Button>
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Confirm Account Deletion">
        <form onSubmit={handleDeleteAccount} className="space-y-4">
          <p className="text-xs text-vital-coral font-medium">
            Warning: This action cannot be reversed. All medical metrics, history, and records will be deleted immediately.
          </p>
          <Input
            label="Confirm Password"
            type="password"
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
            placeholder="••••••••••••"
            required
          />
          <div className="flex justify-end space-x-3 pt-3">
            <Button variant="ghost" type="button" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" type="submit" isLoading={isDeleting}>
              Delete Permanently
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
