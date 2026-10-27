import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';

export function useAnalyticsSummary() {
  return useQuery({
    queryKey: ['analytics', 'summary'],
    queryFn: async () => {
      const { data } = await apiClient.get('/analytics/summary');
      return data.data;
    },
  });
}

export function useAnalyticsTrends(params: { type?: string; range?: string }) {
  return useQuery({
    queryKey: ['analytics', 'trends', params],
    queryFn: async () => {
      const { data } = await apiClient.get('/analytics/trends', { params });
      return data.data;
    },
  });
}

export function useAnalyticsStreaks() {
  return useQuery({
    queryKey: ['analytics', 'streaks'],
    queryFn: async () => {
      const { data } = await apiClient.get('/analytics/streaks');
      return data.data;
    },
  });
}
