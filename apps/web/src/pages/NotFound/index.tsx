import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Home } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-slate-50 dark:bg-obsidian-950 space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-primary-500/10 text-primary-500 flex items-center justify-center">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-black font-mono text-slate-900 dark:text-slate-100">404</h1>
      <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">
        Clinical Telemetry Route Not Found
      </h2>
      <p className="text-xs text-slate-400 max-w-sm">
        The requested path does not exist on this medical platform.
      </p>
      <Link to="/dashboard">
        <Button variant="primary" leftIcon={<Home className="w-4 h-4" />}>
          Return to Dashboard
        </Button>
      </Link>
    </div>
  );
};
