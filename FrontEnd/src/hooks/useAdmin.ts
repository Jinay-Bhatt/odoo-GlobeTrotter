'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, Role } from '@/types';
import api from '@/lib/api';

export interface AdminMetrics {
  totalUsers: number;
  totalTrips: number;
  totalPosts: number;
  totalExpenses: number;
}

export function useAdminMetrics() {
  return useQuery({
    queryKey: ['admin-metrics'],
    queryFn: async (): Promise<AdminMetrics> => {
      const res = await api.get<{ metrics: AdminMetrics }>('/api/admin/metrics');
      return res.data.metrics;
    },
  });
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ['admin-users'],
    queryFn: async (): Promise<User[]> => {
      const res = await api.get<{ users: User[] }>('/api/admin/users');
      return res.data.users;
    },
  });
}

export function usePopularCities() {
  return useQuery({
    queryKey: ['popular-cities'],
    queryFn: async (): Promise<any[]> => {
      const res = await api.get<{ cities: any[] }>('/api/admin/popular-cities');
      return res.data.cities;
    },
  });
}

export function usePopularActivities() {
  return useQuery({
    queryKey: ['popular-activities'],
    queryFn: async (): Promise<any[]> => {
      const res = await api.get<{ activities: any[] }>('/api/admin/popular-activities');
      return res.data.activities;
    },
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: Role }): Promise<User> => {
      const res = await api.put<{ user: User }>(`/api/admin/users/${userId}/role`, { role });
      return res.data.user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-metrics'] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string): Promise<{ message: string }> => {
      const res = await api.delete<{ message: string }>(`/api/admin/users/${userId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-metrics'] });
    },
  });
}

