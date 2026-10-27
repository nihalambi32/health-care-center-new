import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { useAuthStore } from '@/store/authStore';
import { User } from '@/types';

export function useCurrentUser() {
  const setUser = useAuthStore((state) => state.setUser);

  return useQuery<User>({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const { data } = await apiClient.get('/users/me');
      setUser(data.data);
      return data.data;
    },
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  const setToken = useAuthStore((state) => state.setToken);
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const { data } = await apiClient.post('/auth/login', credentials);
      setToken(data.data.accessToken);
      setUser(data.data.user);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  const setToken = useAuthStore((state) => state.setToken);
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: async (payload: {
      email: string;
      password: string;
      name: string;
      timezone?: string;
      locale?: string;
    }) => {
      const { data } = await apiClient.post('/auth/register', payload);
      setToken(data.data.accessToken);
      setUser(data.data.user);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: async (payload: { email: string }) => {
      const { data } = await apiClient.post('/auth/forgot-password', payload);
      return data;
    },
  });
}
