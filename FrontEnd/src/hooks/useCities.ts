'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { City, Activity, Category } from '@/types';
import api from '@/lib/api';

export function useCities(search?: string) {
  return useQuery({
    queryKey: ['cities', search],
    queryFn: async (): Promise<City[]> => {
      const params = search ? { search } : {};
      const res = await api.get<{ cities: City[] }>('/api/cities', { params });
      return res.data.cities;
    },
  });
}

export function useCity(id: string | undefined) {
  return useQuery({
    queryKey: ['city', id],
    queryFn: async (): Promise<City> => {
      if (!id) throw new Error('City ID is required');
      const res = await api.get<{ city: City }>(`/api/cities/${id}`);
      return res.data.city;
    },
    enabled: !!id,
  });
}

export function useActivities(cityId?: string, category?: Category) {
  return useQuery({
    queryKey: ['activities', cityId, category],
    queryFn: async (): Promise<Activity[]> => {
      const params: Record<string, string> = {};
      if (cityId) params.cityId = cityId;
      if (category) params.category = category;
      const res = await api.get<{ activities: Activity[] }>('/api/activities', { params });
      return res.data.activities;
    },
  });
}

export function useCreateCity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; country: string; image?: string; popularity?: number }): Promise<City> => {
      const res = await api.post<{ city: City }>('/api/cities', data);
      return res.data.city;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cities'] });
    },
  });
}
