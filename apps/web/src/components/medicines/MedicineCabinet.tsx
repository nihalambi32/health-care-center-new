import React, { useState } from 'react';
import { Plus, Check, X, Clock, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import {
  useMedicines,
  useCreateMedicine,
  useRecordMedicineEvent,
  useDeleteMedicine,
} from '@/features/medicines/useMedicines';
import { useToastStore } from '@/components/ui/Toast';

export const MedicineCabinet: React.FC = () => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [dose, setDose] = useState('');
  const [form, setForm] = useState('tablet');
  const [time, setTime] = useState('08:00');
  const [notes, setNotes] = useState('');

  const { data: medicines = [], isLoading } = useMedicines();
  const createMed = useCreateMedicine();
  const recordEvent = useRecordMedicineEvent();
  const deleteMed = useDeleteMedicine();
  const addToast = useToastStore((state) => state.addToast);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMed.mutateAsync({
        name,
        dose,
        form,
        schedule: { times: [time] },
        notes: notes || undefined,
      });
      addToast('Medication added and reminder scheduled!', 'success');
      setIsModalOpen(false);
      setName('');
      setDose('');
      setNotes('');
    } catch {
      addToast('Failed to add prescription.', 'error');
    }
  };

  const handleEvent = async (medicineId: string, status: 'TAKEN' | 'SKIPPED' | 'SNOOZED') => {
    try {
      await recordEvent.mutateAsync({
        medicineId,
        status,
        scheduledAt: new Date().toISOString(),
      });
      addToast(`Dose marked as ${status.toLowerCase()}!`, 'success');
    } catch {
      addToast('Failed to record dose action.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
          {t('medicines.title')}
        </h3>
        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsModalOpen(true)}
        >
          {t('medicines.addMedicine')}
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-xs font-mono text-slate-400">
          LOADING PRESCRIPTIONS...
        </div>
      ) : medicines.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-sm text-slate-400">No active medications in your cabinet.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {medicines.map((med) => (
            <Card key={med.id} className="relative group">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-vital-emerald" />
                    <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {med.name}
                    </h4>
                  </div>
                  <p className="text-xs font-mono text-primary-500 font-semibold mt-0.5">
                    {med.dose} • {med.form}
                  </p>
                </div>
                <button
                  onClick={() => deleteMed.mutate(med.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-vital-coral transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {med.schedule?.times && (
                <div className="mt-3 flex items-center space-x-1.5 text-xs text-slate-500">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Times: {med.schedule.times.join(', ')}</span>
                </div>
              )}

              {/* Action Buttons for Dose intake */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="primary"
                  leftIcon={<Check className="w-3.5 h-3.5" />}
                  onClick={() => handleEvent(med.id, 'TAKEN')}
                  className="flex-1 bg-vital-emerald hover:bg-emerald-600 text-xs py-1.5"
                >
                  {t('medicines.markTaken')}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  leftIcon={<Clock className="w-3.5 h-3.5" />}
                  onClick={() => handleEvent(med.id, 'SNOOZED')}
                  className="text-xs py-1.5 text-amber-500 hover:bg-amber-500/10"
                >
                  {t('medicines.markSnoozed')}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  leftIcon={<X className="w-3.5 h-3.5" />}
                  onClick={() => handleEvent(med.id, 'SKIPPED')}
                  className="text-xs py-1.5 text-slate-400 hover:text-vital-coral"
                >
                  {t('medicines.markSkipped')}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Medication Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Medication">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label={t('medicines.name')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Atorvastatin"
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label={t('medicines.dose')}
              value={dose}
              onChange={(e) => setDose(e.target.value)}
              placeholder="e.g. 20mg"
              required
            />
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {t('medicines.form')}
              </label>
              <select
                value={form}
                onChange={(e) => setForm(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-white/70 dark:bg-slate-900/70 border border-slate-300/80 dark:border-slate-700/80 text-slate-900 dark:text-slate-100"
              >
                <option value="tablet">Tablet</option>
                <option value="capsule">Capsule</option>
                <option value="syrup">Syrup</option>
                <option value="injection">Injection</option>
              </select>
            </div>
          </div>
          <Input
            label="Daily Scheduled Time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />
          <Input
            label="Prescription Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Take with dinner"
          />

          <div className="flex justify-end space-x-3 pt-3">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={createMed.isPending}>
              Save Medication
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
