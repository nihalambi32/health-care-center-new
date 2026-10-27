import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { Medicine, AdherenceStats } from '@/types';

export function useMedicines() {
  return useQuery<Medicine[]>({
    queryKey: ['medicines'],
    queryFn: async () => {
      const { data } = await apiClient.get('/medicines');
      return data.data;
    },
  });
}

export function useAdherence(params?: { from?: string; to?: string }) {
  return useQuery<AdherenceStats>({
    queryKey: ['medicines', 'adherence', params],
    queryFn: async () => {
      const { data } = await apiClient.get('/medicines/adherence', { params });
      return data.data;
    },
  });
}

export function useCreateMedicine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      name: string;
      dose: string;
      form?: string;
      schedule: { times: string[]; daysOfWeek?: number[] };
      startDate?: string;
      endDate?: string | null;
      notes?: string;
    }) => {
      const { data } = await apiClient.post('/medicines', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    },
  });
}

export function useRecordMedicineEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      medicineId,
      status,
      scheduledAt,
    }: {
      medicineId: string;
      status: 'TAKEN' | 'SKIPPED' | 'SNOOZED';
      scheduledAt: string;
    }) => {
      const { data } = await apiClient.post(`/medicines/${medicineId}/events`, {
        status,
        scheduledAt,
      });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

export function useDeleteMedicine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/medicines/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    },
  });
}
