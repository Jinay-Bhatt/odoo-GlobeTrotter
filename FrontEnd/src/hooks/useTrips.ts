'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trip, CreateTripInput, UpdateTripInput, TripStatus } from '@/types';
import { mockTrips } from '@/lib/mockData';
import api from '@/lib/api';

const TRIPS_CACHE_KEY = 'gt_mock_trips';

function getStoredTrips(): Trip[] {
  if (typeof window === 'undefined') return mockTrips;
  const stored = localStorage.getItem(TRIPS_CACHE_KEY);
  if (!stored) {
    localStorage.setItem(TRIPS_CACHE_KEY, JSON.stringify(mockTrips));
    return mockTrips;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return mockTrips;
  }
}

function saveStoredTrips(trips: Trip[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TRIPS_CACHE_KEY, JSON.stringify(trips));
  }
}

function computeStatus(startDate: string, endDate: string): TripStatus {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  if (now < start) return 'UPCOMING';
  if (now >= start && now <= end) return 'ONGOING';
  return 'COMPLETED';
}

export function useTrips() {
  return useQuery({
    queryKey: ['trips'],
    queryFn: async (): Promise<Trip[]> => {
      try {
        const res = await api.get<{ trips: Trip[] }>('/api/trips');
        return res.data.trips;
      } catch {
        // Return stored mock trips
        return getStoredTrips();
      }
    },
  });
}

export function useTrip(id: string | undefined) {
  return useQuery({
    queryKey: ['trip', id],
    queryFn: async (): Promise<Trip> => {
      if (!id) throw new Error('Trip ID is required');
      try {
        const res = await api.get<{ trip: Trip }>(`/api/trips/${id}`);
        return res.data.trip;
      } catch {
        const trips = getStoredTrips();
        const found = trips.find((t) => t.id === id);
        if (!found) throw new Error(`Trip ${id} not found`);
        return found;
      }
    },
    enabled: !!id,
  });
}

export function useCreateTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateTripInput): Promise<Trip> => {
      try {
        const res = await api.post<{ trip: Trip }>('/api/trips', input);
        return res.data.trip;
      } catch {
        const trips = getStoredTrips();
        const newTrip: Trip = {
          id: `trip-${Date.now()}`,
          name: input.name,
          startDate: input.startDate,
          endDate: input.endDate,
          description: input.description || null,
          coverPhoto: input.coverPhoto || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&auto=format&fit=crop&q=80',
          status: computeStatus(input.startDate, input.endDate),
          isPublic: false,
          shareToken: null,
          totalBudget: 0,
          userId: 'user-001',
          sections: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        const updatedTrips = [newTrip, ...trips];
        saveStoredTrips(updatedTrips);
        return newTrip;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });
}

export function useUpdateTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateTripInput }): Promise<Trip> => {
      try {
        const res = await api.put<{ trip: Trip }>(`/api/trips/${id}`, data);
        return res.data.trip;
      } catch {
        const trips = getStoredTrips();
        const index = trips.findIndex((t) => t.id === id);
        if (index === -1) throw new Error(`Trip ${id} not found`);

        const current = trips[index];
        const startDate = data.startDate || current.startDate;
        const endDate = data.endDate || current.endDate;

        const updated: Trip = {
          ...current,
          ...data,
          startDate,
          endDate,
          status: computeStatus(startDate, endDate),
          updatedAt: new Date().toISOString(),
        };

        trips[index] = updated;
        saveStoredTrips(trips);
        return updated;
      }
    },
    onSuccess: (updatedTrip) => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['trip', updatedTrip.id] });
    },
  });
}

export function useDeleteTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<{ message: string }> => {
      try {
        const res = await api.delete<{ message: string }>(`/api/trips/${id}`);
        return res.data;
      } catch {
        const trips = getStoredTrips();
        const filtered = trips.filter((t) => t.id !== id);
        saveStoredTrips(filtered);
        return { message: 'Trip deleted successfully' };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });
}

export function useToggleShare() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<{ isPublic: boolean; shareToken: string | null }> => {
      try {
        const res = await api.post<{ isPublic: boolean; shareToken: string | null }>(`/api/trips/${id}/toggle-share`);
        return res.data;
      } catch {
        const trips = getStoredTrips();
        const index = trips.findIndex((t) => t.id === id);
        if (index === -1) throw new Error(`Trip ${id} not found`);

        const current = trips[index];
        const newIsPublic = !current.isPublic;
        const shareToken = newIsPublic ? `share-token-${id}` : null;

        trips[index] = {
          ...current,
          isPublic: newIsPublic,
          shareToken,
        };

        saveStoredTrips(trips);
        return { isPublic: newIsPublic, shareToken };
      }
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['trip', id] });
    },
  });
}

export function useCopyTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<Trip> => {
      try {
        const res = await api.post<{ trip: Trip }>(`/api/trips/${id}/copy`);
        return res.data.trip;
      } catch {
        const trips = getStoredTrips();
        const found = trips.find((t) => t.id === id);
        if (!found) throw new Error(`Source trip ${id} not found`);

        const copyId = `trip-${Date.now()}`;
        const copiedTrip: Trip = {
          ...found,
          id: copyId,
          name: `${found.name} (Copy)`,
          isPublic: false,
          shareToken: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          sections: found.sections?.map((sec, secIdx) => ({
            ...sec,
            id: `sec-${Date.now()}-${secIdx}`,
            tripId: copyId,
            activities: sec.activities?.map((act, actIdx) => ({
              ...act,
              id: `stop-${Date.now()}-${actIdx}`,
              sectionId: `sec-${Date.now()}-${secIdx}`,
            })),
          })),
        };

        const updatedTrips = [copiedTrip, ...trips];
        saveStoredTrips(updatedTrips);
        return copiedTrip;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });
}
