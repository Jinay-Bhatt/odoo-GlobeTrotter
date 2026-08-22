'use client';

import React, { use } from 'react';
import { useTrip } from '@/hooks/useTrips';
import ItineraryView from '@/components/itinerary/ItineraryView';
import Link from 'next/link';
import { ArrowLeft, Compass } from 'lucide-react';

export default function TripDetailsPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const resolvedParams = 'then' in params ? use(params) : params;
  const { data: trip, isLoading, error } = useTrip(resolvedParams.id);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
          <p className="text-xs font-medium text-slate-500">Loading trip itinerary & timeline...</p>
        </div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 mx-auto mb-3">
          <Compass className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Trip not found</h2>
        <p className="mt-1 text-xs text-slate-500">
          The requested trip could not be loaded or is private.
        </p>
        <div className="mt-5">
          <Link
            href="/trips"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to My Trips
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <ItineraryView trip={trip} />
    </div>
  );
}
