import React, { useState } from 'react';
import { Plus, Trash2, Calendar, Droplet, Footprints, Moon, Weight, Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { useLogs, useCreateLog, useDeleteLog } from '@/features/logs/useLogs';
import { useToastStore } from '@/components/ui/Toast';
import { formatDate, formatTime } from '@/utils';

export const LogsList: React.FC = () => {
  const { t } = useTranslation();
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [type, setType] = useState('WATER');
  const [amount, setAmount] = useState('500');
  const [systolic, setSystolic] = useState('120');
  const [diastolic, setDiastolic] = useState('80');
  const [pulse, setPulse] = useState('72');
  const [note, setNote] = useState('');

  const { data: logs = [], isLoading } = useLogs(
    selectedType === 'ALL' ? undefined : { type: selectedType }
  );
  const createLog = useCreateLog();
  const deleteLog = useDeleteLog();
  const addToast = useToastStore((state) => state.addToast);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let value: any = {};
      let unit = '';

      if (type === 'WATER') {
        value = { amountMl: parseFloat(amount) };
        unit = 'ml';
      } else if (type === 'BLOOD_PRESSURE') {
        value = {
          systolic: parseInt(systolic, 10),
          diastolic: parseInt(diastolic, 10),
          pulse: parseInt(pulse, 10),
        };
        unit = 'mmHg';
      } else if (type === 'STEPS') {
        value = { count: parseInt(amount, 10) };
        unit = 'steps';
      } else if (type === 'SLEEP') {
        value = { hours: parseFloat(amount) };
        unit = 'hours';
      } else if (type === 'WEIGHT') {
        value = { weightKg: parseFloat(amount) };
        unit = 'kg';
      }

      await createLog.mutateAsync({
        type,
        value,
        unit,
        note: note || undefined,
        loggedAt: new Date().toISOString(),
      });

      addToast('Health vital saved and 3D telemetry synchronized!', 'success');
      setIsModalOpen(false);
      setNote('');
    } catch {
      addToast('Failed to create health log.', 'error');
    }
  };

  const getLogIcon = (logType: string) => {
    switch (logType) {
      case 'WATER':
        return <Droplet className="w-4 h-4 text-primary-400" />;
      case 'STEPS':
        return <Footprints className="w-4 h-4 text-vital-emerald" />;
      case 'SLEEP':
        return <Moon className="w-4 h-4 text-indigo-400" />;
      case 'WEIGHT':
        return <Weight className="w-4 h-4 text-amber-400" />;
      case 'BLOOD_PRESSURE':
        return <Heart className="w-4 h-4 text-vital-coral" />;
      default:
        return <Calendar className="w-4 h-4 text-slate-400" />;
    }
  };

  const formatLogValue = (log: any) => {
    if (log.type === 'BLOOD_PRESSURE') {
      return `${log.value.systolic}/${log.value.diastolic} mmHg (Pulse: ${log.value.pulse || '--'} BPM)`;
    }
    if (log.type === 'WATER') {
      return `${log.value.amountMl} mL`;
    }
    if (log.type === 'STEPS') {
      return `${log.value.count} steps`;
    }
    if (log.type === 'SLEEP') {
      return `${log.value.hours} hours`;
    }
    if (log.type === 'WEIGHT') {
      return `${log.value.weightKg} kg`;
    }
    return JSON.stringify(log.value);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 max-w-full">
          {['ALL', 'BLOOD_PRESSURE', 'WATER', 'STEPS', 'SLEEP', 'WEIGHT'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedType(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedType === cat
                  ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20'
                  : 'bg-white/60 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsModalOpen(true)}
        >
          {t('logs.addLog')}
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-xs font-mono text-slate-400">
          LOADING HEALTH LOGS...
        </div>
      ) : logs.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-sm text-slate-400">{t('logs.noLogs')}</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {logs.map((log) => (
            <Card key={log.id} className="relative group">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
                    {getLogIcon(log.type)}
                  </div>
                  <div>
                    <span className="text-xs font-mono font-bold text-slate-400 uppercase">
                      {log.type}
                    </span>
                    <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 font-mono">
                      {formatLogValue(log)}
                    </h4>
                  </div>
                </div>

                <button
                  onClick={() => deleteLog.mutate(log.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-vital-coral transition"
                  title="Delete log"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {log.note && (
                <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-2 italic">
                  "{log.note}"
                </p>
              )}

              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>{formatDate(log.loggedAt)}</span>
                <span>{formatTime(log.loggedAt)}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Log Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Record New Vital Metric">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Metric Category
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl text-sm bg-white/70 dark:bg-slate-900/70 border border-slate-300/80 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
            >
              <option value="BLOOD_PRESSURE">Blood Pressure & Pulse</option>
              <option value="WATER">Water Intake</option>
              <option value="STEPS">Daily Steps</option>
              <option value="SLEEP">Sleep Duration</option>
              <option value="WEIGHT">Body Weight</option>
            </select>
          </div>

          {type === 'BLOOD_PRESSURE' ? (
            <div className="grid grid-cols-3 gap-3">
              <Input
                label="Systolic"
                type="number"
                value={systolic}
                onChange={(e) => setSystolic(e.target.value)}
                unitSuffix="mmHg"
                required
              />
              <Input
                label="Diastolic"
                type="number"
                value={diastolic}
                onChange={(e) => setDiastolic(e.target.value)}
                unitSuffix="mmHg"
                required
              />
              <Input
                label="Pulse"
                type="number"
                value={pulse}
                onChange={(e) => setPulse(e.target.value)}
                unitSuffix="BPM"
                required
              />
            </div>
          ) : (
            <Input
              label="Metric Value"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              unitSuffix={type === 'WATER' ? 'mL' : type === 'STEPS' ? 'steps' : type === 'SLEEP' ? 'hrs' : 'kg'}
              required
            />
          )}

          <Input
            label="Clinical Note (AES-256 Encrypted)"
            type="text"
            placeholder="e.g. Taken post-workout with light breakfast"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          <div className="flex justify-end space-x-3 pt-3">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={createLog.isPending}>
              Save Vital
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
