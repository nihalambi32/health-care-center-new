import React from 'react';
import { cn } from '@/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
  headerSlot?: React.ReactNode;
  footerSlot?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  glow = false,
  headerSlot,
  footerSlot,
  ...props
}) => {
  return (
    <div
      className={cn(
        'glass-card rounded-2xl p-5 relative overflow-hidden',
        glow && 'ring-1 ring-primary-500/30 shadow-lg shadow-primary-500/10',
        className
      )}
      {...props}
    >
      {headerSlot && <div className="mb-4 pb-3 border-b border-slate-200/60 dark:border-slate-800/60">{headerSlot}</div>}
      <div>{children}</div>
      {footerSlot && <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800/60">{footerSlot}</div>}
    </div>
  );
};
