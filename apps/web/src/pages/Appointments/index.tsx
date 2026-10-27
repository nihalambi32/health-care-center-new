import React, { useState } from 'react';
import { Calendar, Plus, Trash2, Video, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { useAppointments, useCreateAppointment, useDeleteAppointment } from '@/features/reminders/useReminders';
import { useToastStore } from '@/components/ui/Toast';
import { formatDate, formatTime } from '@/utils';

export const AppointmentsPage: React.FC = () => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [doctor, setDoctor] = useState('');
  const [location, setLocation] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [notes, setNotes] = useState('');

  const { data: appointments = [], isLoading } = useAppointments();
  const createAppointment = useCreateAppointment();
  const deleteAppointment = useDeleteAppointment();
  const addToast = useToastStore((state) => state.addToast);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAppointment.mutateAsync({
        title,
        doctor: doctor || undefined,
        location: location || undefined,
        scheduledAt: new Date(scheduledAt).toISOString(),
        notes: notes || undefined,
        reminderOffsetMinutes: 60, // 1 hour prior alert
      });
      addToast('Doctor appointment scheduled!', 'success');
      setIsModalOpen(false);
      setTitle('');
      setDoctor('');
      setLocation('');
      setNotes('');
    } catch {
      addToast('Failed to schedule appointment.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">
            {t('appointments.title')}
          </h1>
          <p className="text-xs text-slate-500">{t('appointments.subtitle')}</p>
        </div>

        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsModalOpen(true)}
        >
          {t('appointments.newAppointment')}
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-xs font-mono text-slate-400">
          LOADING APPOINTMENTS...
        </div>
      ) : appointments.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-sm text-slate-400">{t('appointments.noAppointments')}</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {appointments.map((app) => (
            <Card key={app.id} className="relative group p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {app.title}
                  </h4>
                  <p className="text-xs font-semibold text-primary-500 mt-0.5">
                    {app.doctor || 'General Consultation'}
                  </p>
                </div>
                <button
                  onClick={() => deleteAppointment.mutate(app.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-vital-coral transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {app.location && (
                <div className="flex items-center space-x-2 text-xs text-slate-500">
                  {app.location.startsWith('http') ? (
                    <Video className="w-3.5 h-3.5 text-vital-emerald" />
                  ) : (
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  )}
                  <span className="truncate">{app.location}</span>
                </div>
              )}

              {app.notes && (
                <p className="text-xs text-slate-400 italic border-t border-slate-100 dark:border-slate-800/80 pt-2">
                  Prep: {app.notes}
                </p>
              )}

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-mono text-primary-400">
                <span>{formatDate(app.scheduledAt)}</span>
                <span>{formatTime(app.scheduledAt)}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Appointment Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Schedule Doctor Appointment">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Appointment Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Annual Cardiology Checkup"
            required
          />
          <Input
            label={t('appointments.doctor')}
            value={doctor}
            onChange={(e) => setDoctor(e.target.value)}
            placeholder="Dr. Sarah Jenkins"
          />
          <Input
            label={t('appointments.location')}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. City General Clinic or Zoom URL"
          />
          <Input
            label={t('appointments.date')}
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            required
          />
          <Input
            label={t('appointments.notes')}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Fasting 8 hours prior"
          />

          <div className="flex justify-end space-x-3 pt-3">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={createAppointment.isPending}>
              Confirm Booking
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
