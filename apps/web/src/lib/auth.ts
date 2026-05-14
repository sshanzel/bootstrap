import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { api, getApiUrl } from './api';
import type {
  AuthResponse,
  LoginDto,
  MeResponse,
  RegisterDto,
} from '@bootstrap/shared';

export const meQueryOptions = () =>
  queryOptions({
    queryKey: ['me'],
    queryFn: async () => {
      const { data } = await api.get<MeResponse>('/auth/me');
      return data;
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

export function useMe() {
  const query = useQuery(meQueryOptions());
  return {
    ...query,
    data: query.data?.user,
  };
}

export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: RegisterDto) => {
      const { data } = await api.post<AuthResponse>('/auth/register', dto);
      return data.user;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['me'] });
      window.location.href = '/app';
    },
  });
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: LoginDto) => {
      const { data } = await api.post<AuthResponse>('/auth/login', dto);
      return data.user;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['me'] });
      window.location.href = '/app';
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await api.post('/auth/logout');
    },
    onSuccess: async () => {
      await queryClient.removeQueries({ queryKey: ['me'] });
      window.location.href = '/login';
    },
  });
}

export function getGoogleLoginUrl(): string {
  return getApiUrl('/auth/google/start');
}
