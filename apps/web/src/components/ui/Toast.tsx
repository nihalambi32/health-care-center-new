import React from 'react';
import { create } from 'zustand';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import { cn } from '@/utils';

export type ToastType = 'success' | 'warning' | 'error' | 'info';

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastStore {
  toasts: ToastItem[];
  addToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (message, type = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 4000);
  },
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

export const Toast: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-vital-emerald" />,
    warning: <AlertTriangle className="w-5 h-5 text-vital-amber" />,
    error: <XCircle className="w-5 h-5 text-vital-coral" />,
    info: <Info className="w-5 h-5 text-primary-400" />,
  };

  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'pointer-events-auto glass-panel p-3.5 rounded-xl shadow-xl flex items-center justify-between space-x-3 text-sm text-slate-800 dark:text-slate-100 border-l-4 transition-all duration-300 animate-slide-in',
            toast.type === 'success' && 'border-l-vital-emerald',
            toast.type === 'warning' && 'border-l-vital-amber',
            toast.type === 'error' && 'border-l-vital-coral',
            toast.type === 'info' && 'border-l-primary-500'
          )}
        >
          <div className="flex items-center space-x-3">
            {icons[toast.type]}
            <span>{toast.message}</span>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
