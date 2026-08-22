'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Section, StopActivity, CreateSectionInput, UpdateSectionInput, AddStopActivityInput, Trip } from '@/types';
import { mockActivities } from '@/lib/mockData';
import api from '@/lib/api';

const TRIPS_CACHE_KEY = 'gt_mock_trips';

function getStoredTrips(): Trip[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(TRIPS_CACHE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

function saveStoredTrips(trips: Trip[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TRIPS_CACHE_KEY, JSON.stringify(trips));
  }
}

export function useCreateSection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateSectionInput): Promise<Section> => {
      try {
        const res = await api.post<{ section: Section }>('/api/sections', input);
        return res.data.section;
      } catch {
        const trips = getStoredTrips();
        const tripIndex = trips.findIndex((t) => t.id === input.tripId);
        if (tripIndex === -1) throw new Error(`Parent trip ${input.tripId} not found`);

        const newSection: Section = {
          id: `sec-${Date.now()}`,
          name: input.name,
          sectionStart: input.sectionStart,
          sectionEnd: input.sectionEnd,
          budget: input.budget || 0,
          sequence: input.sequence ?? (trips[tripIndex].sections?.length || 0) + 1,
          tripId: input.tripId,
          activities: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const existingSections = trips[tripIndex].sections || [];
        trips[tripIndex].sections = [...existingSections, newSection];
        trips[tripIndex].totalBudget = trips[tripIndex].sections.reduce((acc, s) => acc + s.budget, 0);

        saveStoredTrips(trips);
        return newSection;
      }
    },
    onSuccess: (newSection) => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['trip', newSection.tripId] });
    },
  });
}

export function useUpdateSection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateSectionInput }): Promise<Section> => {
      try {
        const res = await api.put<{ section: Section }>(`/api/sections/${id}`, data);
        return res.data.section;
      } catch {
        const trips = getStoredTrips();
        let targetTripId: string | null = null;
        let updatedSection: Section | null = null;

        for (const trip of trips) {
          const secIndex = trip.sections?.findIndex((s) => s.id === id) ?? -1;
          if (secIndex !== -1 && trip.sections) {
            targetTripId = trip.id;
            const current = trip.sections[secIndex];
            updatedSection = {
              ...current,
              ...data,
              updatedAt: new Date().toISOString(),
            };
            trip.sections[secIndex] = updatedSection;
            trip.totalBudget = trip.sections.reduce((acc, s) => acc + s.budget, 0);
            break;
          }
        }

        if (!updatedSection || !targetTripId) {
          throw new Error(`Section ${id} not found`);
        }

        saveStoredTrips(trips);
        return updatedSection;
      }
    },
    onSuccess: (updatedSection) => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['trip', updatedSection.tripId] });
    },
  });
}

export function useDeleteSection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sectionId, tripId }: { sectionId: string; tripId: string }): Promise<{ message: string }> => {
      try {
        const res = await api.delete<{ message: string }>(`/api/sections/${sectionId}`);
        return res.data;
      } catch {
        const trips = getStoredTrips();
        const tripIndex = trips.findIndex((t) => t.id === tripId);
        if (tripIndex !== -1 && trips[tripIndex].sections) {
          trips[tripIndex].sections = trips[tripIndex].sections?.filter((s) => s.id !== sectionId);
          trips[tripIndex].totalBudget = trips[tripIndex].sections.reduce((acc, s) => acc + s.budget, 0);
          saveStoredTrips(trips);
        }
        return { message: 'Section deleted successfully' };
      }
    },
    onSuccess: (_, { tripId }) => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
    },
  });
}

export function useAddStopActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sectionId, data }: { sectionId: string; data: AddStopActivityInput }): Promise<StopActivity> => {
      try {
        const res = await api.post<{ stopActivity: StopActivity }>(`/api/sections/${sectionId}/activities`, data);
        return res.data.stopActivity;
      } catch {
        const trips = getStoredTrips();
        let targetTripId: string | null = null;
        let createdStop: StopActivity | null = null;

        const matchingActivity = mockActivities.find((a) => a.id === data.activityId) || {
          id: data.activityId,
          name: 'Custom Activity',
          category: 'ADVENTURE',
          estimatedCost: data.expense || 0,
          cityId: 'city-001',
        };

        for (const trip of trips) {
          const sec = trip.sections?.find((s) => s.id === sectionId);
          if (sec) {
            targetTripId = trip.id;
            createdStop = {
              id: `stop-${Date.now()}`,
              sectionId,
              activityId: data.activityId,
              day: data.day,
              expense: data.expense ?? matchingActivity.estimatedCost,
              notes: data.notes || null,
              activity: matchingActivity,
            };
            sec.activities = [...(sec.activities || []), createdStop];
            break;
          }
        }

        if (!createdStop || !targetTripId) {
          throw new Error(`Section ${sectionId} not found`);
        }

        saveStoredTrips(trips);
        return createdStop;
      }
    },
    onSuccess: (newStop) => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['trip'] });
    },
  });
}

export function useRemoveStopActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sectionId, stopId }: { sectionId: string; stopId: string }): Promise<{ message: string }> => {
      try {
        const res = await api.delete<{ message: string }>(`/api/sections/${sectionId}/activities/${stopId}`);
        return res.data;
      } catch {
        const trips = getStoredTrips();
        for (const trip of trips) {
          const sec = trip.sections?.find((s) => s.id === sectionId);
          if (sec && sec.activities) {
            sec.activities = sec.activities.filter((a) => a.id !== stopId);
            break;
          }
        }
        saveStoredTrips(trips);
        return { message: 'Activity stop removed successfully' };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['trip'] });
    },
  });
}
