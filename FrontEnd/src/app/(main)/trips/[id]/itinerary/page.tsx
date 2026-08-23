'use client';

import React, { use } from 'react';
import { useTrip } from '@/hooks/useTrips';
import SectionBuilder from '@/components/trips/SectionBuilder';
import Link from 'next/link';
import { ArrowLeft, Compass } from 'lucide-react';

export default function ItineraryBuilderPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  // Support both synchronous & Promise params for Next.js App Router
  const resolvedParams = 'then' in params ? use(params) : params;
  const { data: trip, isLoading, error } = useTrip(resolvedParams.id);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
          <p className="text-xs font-medium text-slate-500">Loading itinerary sections...</p>
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
          The trip you are looking for does not exist or has been removed.
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
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-4">
        <Link
          href="/trips"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Trips
        </Link>
      </div>
      <SectionBuilder trip={trip} />
    </div>
  );
}
