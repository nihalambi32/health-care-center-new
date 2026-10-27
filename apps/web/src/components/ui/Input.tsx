import React from 'react';
import { cn } from '@/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  unitSuffix?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  unitSuffix,
  error,
  className,
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <div className="relative rounded-xl shadow-sm">
        <input
          id={inputId}
          className={cn(
            'w-full px-4 py-2.5 rounded-xl text-sm bg-white/70 dark:bg-slate-900/70 border border-slate-300/80 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all',
            unitSuffix && 'pr-14',
            error && 'border-vital-coral focus:ring-vital-coral/50 focus:border-vital-coral',
            className
          )}
          {...props}
        />
        {unitSuffix && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <span className="text-xs font-mono font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
              {unitSuffix}
            </span>
          </div>
        )}
      </div>
      {error && <p className="text-xs text-vital-coral font-medium mt-1">{error}</p>}
    </div>
  );
};
