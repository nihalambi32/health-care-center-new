import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const Disclaimer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex items-start space-x-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs leading-relaxed">
      <ShieldAlert className="w-4 h-4 flex-shrink-0 text-amber-500 mt-0.5" />
      <span>{t('assistant.disclaimer')}</span>
    </div>
  );
};
