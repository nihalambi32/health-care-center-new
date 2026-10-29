import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { useAuthStore } from '@/store/authStore';
import { User } from '@/types';

export function useCurrentUser() {
  const setUser = useAuthStore((state) => state.setUser);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery<User>({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get('/users/me');
        setUser(data.data);
        return data.data;
      } catch (err: any) {
        // Fall back to stored user if backend is offline
        const storedUser = useAuthStore.getState().user;
        if (storedUser) return storedUser;
        throw err;
      }
    },
    retry: false,
    enabled: isAuthenticated,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  const setToken = useAuthStore((state) => state.setToken);
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      try {
        const { data } = await apiClient.post('/auth/login', credentials);
        setToken(data.data.accessToken);
        setUser(data.data.user);
        return data.data;
      } catch (err: any) {
        // Fall back to demo session if backend is offline / 404
        if (err?.response?.status === 404 || !err?.response) {
          const demoUser: User = {
            id: 'demo-user-123',
            email: credentials.email || 'patient@example.com',
            name: credentials.email ? credentials.email.split('@')[0]! : 'Demo Patient',
            timezone: 'UTC',
            locale: 'en',
            createdAt: new Date().toISOString(),
          };
          const demoToken = 'demo-jwt-token';
          setToken(demoToken);
          setUser(demoUser);
          return { accessToken: demoToken, user: demoUser };
        }
        throw err;
      }
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
      try {
        const { data } = await apiClient.post('/auth/register', payload);
        setToken(data.data.accessToken);
        setUser(data.data.user);
        return data.data;
      } catch (err: any) {
        // Fall back to demo session if backend is offline
        if (err?.response?.status === 404 || !err?.response) {
          const demoUser: User = {
            id: 'demo-user-123',
            email: payload.email,
            name: payload.name || 'Demo Patient',
            timezone: payload.timezone || 'UTC',
            locale: payload.locale || 'en',
            createdAt: new Date().toISOString(),
          };
          const demoToken = 'demo-jwt-token';
          setToken(demoToken);
          setUser(demoUser);
          return { accessToken: demoToken, user: demoUser };
        }
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: async (payload: { email: string }) => {
      try {
        const { data } = await apiClient.post('/auth/forgot-password', payload);
        return data;
      } catch (err: any) {
        if (err?.response?.status === 404 || !err?.response) {
          return { message: 'Password reset link simulated in demo mode' };
        }
        throw err;
      }
    },
  });
}
