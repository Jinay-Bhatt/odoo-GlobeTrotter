'use client';

import React from 'react';
import { useTrips } from '@/hooks/useTrips';
import TripCalendar from '@/components/calendar/TripCalendar';

export default function CalendarPage() {
  const { data: trips = [], isLoading } = useTrips();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
          <p className="text-xs font-medium text-slate-500">Loading travel calendar events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <TripCalendar trips={trips} />
    </div>
  );
}
