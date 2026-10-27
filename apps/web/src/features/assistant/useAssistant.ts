import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { AssistantMessage } from '@/types';
import { useVitalsSceneStore } from '@/store/vitalsSceneStore';

export function useAssistantHistory() {
  return useQuery<AssistantMessage[]>({
    queryKey: ['assistant', 'history'],
    queryFn: async () => {
      const { data } = await apiClient.get('/assistant/history');
      return data.data;
    },
  });
}

export function useSendAssistantMessage() {
  const queryClient = useQueryClient();
  const setAiStreaming = useVitalsSceneStore((state) => state.setAiStreaming);

  return useMutation({
    mutationFn: async ({ message, locale = 'en' }: { message: string; locale?: string }) => {
      setAiStreaming(true);
      try {
        const { data } = await apiClient.post('/assistant/chat', { message, locale });
        return data;
      } finally {
        setAiStreaming(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assistant', 'history'] });
    },
  });
}

export function useClearAssistantHistory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await apiClient.delete('/assistant/history');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assistant', 'history'] });
    },
  });
}
