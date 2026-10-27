import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { Toast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useCreateLog } from '@/features/logs/useLogs';
import { useToastStore } from '@/components/ui/Toast';

export const AppShell: React.FC = () => {
  const [quickLogOpen, setQuickLogOpen] = useState(false);
  const [metricType, setMetricType] = useState('WATER');
  const [metricVal, setMetricVal] = useState('250');
  const createLog = useCreateLog();
  const addToast = useToastStore((state) => state.addToast);

  const handleQuickLog = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let valueObj: any = {};
      let unit = '';
      if (metricType === 'WATER') {
        valueObj = { amountMl: parseFloat(metricVal) || 250 };
        unit = 'ml';
      } else if (metricType === 'STEPS') {
        valueObj = { count: parseInt(metricVal, 10) || 1000 };
        unit = 'steps';
      } else if (metricType === 'WEIGHT') {
        valueObj = { weightKg: parseFloat(metricVal) || 70 };
        unit = 'kg';
      }

      await createLog.mutateAsync({
        type: metricType,
        value: valueObj,
        unit,
        loggedAt: new Date().toISOString(),
      });
      addToast('Quick log saved successfully!', 'success');
      setQuickLogOpen(false);
    } catch {
      addToast('Failed to record quick log.', 'error');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-obsidian-950 text-slate-900 dark:text-slate-100 selection:bg-primary-500 selection:text-white">
      <Navbar onQuickLog={() => setQuickLogOpen(true)} onTakeDose={() => setQuickLogOpen(true)} />
      <div className="flex-1 flex">
        <Sidebar />
        <main className="flex-1 lg:pl-64 p-4 lg:p-8 max-w-7xl mx-auto w-full transition-all">
          <Outlet />
        </main>
      </div>
      <Toast />

      {/* Global Quick Log Modal */}
      <Modal isOpen={quickLogOpen} onClose={() => setQuickLogOpen(false)} title="Quick Log Vitals">
        <form onSubmit={handleQuickLog} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Metric Category
            </label>
            <select
              value={metricType}
              onChange={(e) => setMetricType(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl text-sm bg-white/70 dark:bg-slate-900/70 border border-slate-300/80 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
            >
              <option value="WATER">Water Intake (mL)</option>
              <option value="STEPS">Steps Walked</option>
              <option value="WEIGHT">Body Weight (kg)</option>
            </select>
          </div>
          <Input
            label="Value"
            type="number"
            value={metricVal}
            onChange={(e) => setMetricVal(e.target.value)}
            unitSuffix={metricType === 'WATER' ? 'mL' : metricType === 'STEPS' ? 'steps' : 'kg'}
            required
          />
          <div className="flex justify-end space-x-3 pt-3">
            <Button variant="ghost" type="button" onClick={() => setQuickLogOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={createLog.isPending}>
              Record Vital
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
