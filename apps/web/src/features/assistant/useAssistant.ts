import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { AssistantMessage } from '@/types';
import { useVitalsSceneStore } from '@/store/vitalsSceneStore';

export function useAssistantHistory() {
  return useQuery<AssistantMessage[]>({
    queryKey: ['assistant', 'history'],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get('/assistant/history');
        if (Array.isArray(data.data)) return data.data;
        if (Array.isArray(data)) return data;
        return [];
      } catch {
        return [
          {
            id: 'msg_welcome',
            role: 'assistant',
            content: 'Hello! I am your AI Bio-Wellness Companion powered by Gemini. Ask me anything about hydration, sleep habits, daily nutrition, or health goals.',
            createdAt: new Date().toISOString(),
          },
        ];
      }
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
    onSuccess: (data, variables) => {
      const replyText = data.reply || data.data?.content || data.data?.reply || 'Vitals telemetry analyzed.';
      queryClient.setQueryData<AssistantMessage[]>(['assistant', 'history'], (old = []) => [
        ...old,
        {
          id: 'user_' + Date.now(),
          role: 'user',
          content: variables.message,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'gemini_' + (Date.now() + 1),
          role: 'assistant',
          content: replyText,
          createdAt: new Date().toISOString(),
        },
      ]);
    },
  });
}

export function useClearAssistantHistory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      try {
        await apiClient.delete('/assistant/history');
      } catch {
        // Continue even if offline
      }
    },
    onSuccess: () => {
      queryClient.setQueryData<AssistantMessage[]>(['assistant', 'history'], []);
    },
  });
}
