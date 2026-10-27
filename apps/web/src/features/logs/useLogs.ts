import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { HealthLog } from '@/types';
import { useVitalsSceneStore } from '@/store/vitalsSceneStore';

export function useLogs(params?: { type?: string; from?: string; to?: string; limit?: number }) {
  return useQuery<HealthLog[]>({
    queryKey: ['logs', params],
    queryFn: async () => {
      const { data } = await apiClient.get('/logs', { params });
      return data.data;
    },
  });
}

export function useCreateLog() {
  const queryClient = useQueryClient();
  const setHeartRate = useVitalsSceneStore((state) => state.setHeartRate);
  const setBloodPressure = useVitalsSceneStore((state) => state.setBloodPressure);

  return useMutation({
    mutationFn: async (payload: {
      type: string;
      value: Record<string, any>;
      unit?: string;
      loggedAt?: string;
      note?: string;
    }) => {
      const { data } = await apiClient.post('/logs', payload);

      // Instant 3D Scene feedback synchronization
      if (payload.type === 'BLOOD_PRESSURE') {
        const bp = payload.value;
        if (bp.systolic && bp.diastolic) {
          setBloodPressure(bp.systolic, bp.diastolic);
        }
        if (bp.pulse) {
          setHeartRate(bp.pulse);
        }
      }

      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['logs'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

export function useDeleteLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/logs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['logs'] });
    },
  });
}
