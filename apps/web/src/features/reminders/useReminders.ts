import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { Reminder, Appointment } from '@/types';

export function useReminders() {
  return useQuery<Reminder[]>({
    queryKey: ['reminders'],
    queryFn: async () => {
      const { data } = await apiClient.get('/reminders');
      return data.data;
    },
  });
}

export function useCreateReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      kind: string;
      title: string;
      body?: string;
      rrule: string;
      timezone?: string;
      channels: string[];
      medicineId?: string;
      appointmentId?: string;
    }) => {
      const { data } = await apiClient.post('/reminders', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    },
  });
}

export function useSnoozeReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, minutes = 15 }: { id: string; minutes?: number }) => {
      const { data } = await apiClient.post(`/reminders/${id}/snooze`, { minutes });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    },
  });
}

export function useDeleteReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/reminders/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    },
  });
}

// Appointments
export function useAppointments() {
  return useQuery<Appointment[]>({
    queryKey: ['appointments'],
    queryFn: async () => {
      const { data } = await apiClient.get('/appointments');
      return data.data;
    },
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      title: string;
      doctor?: string;
      location?: string;
      scheduledAt: string;
      notes?: string;
      reminderOffsetMinutes?: number;
    }) => {
      const { data } = await apiClient.post('/appointments', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    },
  });
}

export function useDeleteAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/appointments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}
