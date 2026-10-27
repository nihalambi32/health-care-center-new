import React from 'react';
import { useTranslation } from 'react-i18next';
import { LogsList } from '@/components/logs/LogsList';

export const LogsPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">
          {t('logs.title')}
        </h1>
        <p className="text-xs text-slate-500">{t('logs.subtitle')}</p>
      </div>

      <LogsList />
    </div>
  );
};
