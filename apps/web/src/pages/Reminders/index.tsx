import React, { useState } from 'react';
import { Bell, Plus, Trash2, Clock, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import {
  useReminders,
  useCreateReminder,
  useSnoozeReminder,
  useDeleteReminder,
} from '@/features/reminders/useReminders';
import { usePushSubscription } from '@/hooks/usePushSubscription';
import { useToastStore } from '@/components/ui/Toast';
import { formatDate, formatTime } from '@/utils';

export const RemindersPage: React.FC = () => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [kind, setKind] = useState('CUSTOM');
  const [time, setTime] = useState('09:00');

  const { data: reminders = [], isLoading } = useReminders();
  const createReminder = useCreateReminder();
  const snoozeReminder = useSnoozeReminder();
  const deleteReminder = useDeleteReminder();
  const { isSubscribed, subscribe, unsubscribe, loading: pushLoading } = usePushSubscription();
  const addToast = useToastStore((state) => state.addToast);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createReminder.mutateAsync({
        title,
        kind,
        rrule: 'FREQ=DAILY;INTERVAL=1',
        channels: ['IN_APP', 'PUSH'],
      });
      addToast('Reminder created successfully!', 'success');
      setIsModalOpen(false);
      setTitle('');
    } catch {
      addToast('Failed to create reminder.', 'error');
    }
  };

  const handleTogglePush = async () => {
    try {
      if (isSubscribed) {
        await unsubscribe();
        addToast('Web push notifications disabled.', 'info');
      } else {
        await subscribe();
        addToast('Web push notifications enabled successfully!', 'success');
      }
    } catch (err: any) {
      addToast(err.message || 'Push permission was denied.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">
            {t('reminders.title')}
          </h1>
          <p className="text-xs text-slate-500">{t('reminders.subtitle')}</p>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            size="sm"
            variant="secondary"
            isLoading={pushLoading}
            onClick={handleTogglePush}
            leftIcon={<Bell className="w-4 h-4 text-primary-500" />}
          >
            {isSubscribed ? t('reminders.disablePush') : t('reminders.enablePush')}
          </Button>

          <Button
            size="sm"
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsModalOpen(true)}
          >
            {t('reminders.addReminder')}
          </Button>
        </div>
      </div>

      {/* Push Status Banner */}
      <Card className="flex items-center justify-between p-4 bg-primary-500/5 border-primary-500/20">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-primary-500/10 text-primary-500">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Web Push Delivery Status
            </h4>
            <p className="text-xs text-slate-500">
              {isSubscribed
                ? 'Active: Your browser is registered to receive critical medication and vital alerts.'
                : 'Inactive: Enable Web Push to receive offline reminders on desktop and mobile.'}
            </p>
          </div>
        </div>
        <span
          className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full ${
            isSubscribed
              ? 'bg-vital-emerald/10 text-vital-emerald'
              : 'bg-amber-500/10 text-amber-500'
          }`}
        >
          {isSubscribed ? 'CONNECTED' : 'STANDBY'}
        </span>
      </Card>

      {/* Reminders List */}
      {isLoading ? (
        <div className="text-center py-12 text-xs font-mono text-slate-400">
          LOADING REMINDERS...
        </div>
      ) : reminders.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-sm text-slate-400">{t('reminders.noReminders')}</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reminders.map((rem) => (
            <Card key={rem.id} className="relative group p-5">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-primary-500 bg-primary-500/10 px-2 py-0.5 rounded">
                    {rem.kind}
                  </span>
                  <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-2">
                    {rem.title}
                  </h4>
                  {rem.body && <p className="text-xs text-slate-500 mt-0.5">{rem.body}</p>}
                </div>
                <button
                  onClick={() => deleteReminder.mutate(rem.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-vital-coral transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                <span className="font-mono text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {formatDate(rem.nextFireAt)} {formatTime(rem.nextFireAt)}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => snoozeReminder.mutate({ id: rem.id, minutes: 15 })}
                  className="text-xs text-amber-500 hover:bg-amber-500/10 py-1 px-2.5"
                >
                  Snooze 15m
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Reminder Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Health Reminder">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Reminder Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Drink 500mL Water"
            required
          />
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Category
            </label>
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl text-sm bg-white/70 dark:bg-slate-900/70 border border-slate-300/80 dark:border-slate-700/80 text-slate-900 dark:text-slate-100"
            >
              <option value="CUSTOM">General Vital</option>
              <option value="WATER">Water Intake</option>
              <option value="EXERCISE">Physical Activity / Walk</option>
              <option value="SLEEP">Sleep Hygiene</option>
            </select>
          </div>
          <Input
            label="Scheduled Recurrence Time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />

          <div className="flex justify-end space-x-3 pt-3">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={createReminder.isPending}>
              Schedule Alert
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
