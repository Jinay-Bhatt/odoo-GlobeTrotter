'use client';

import React from 'react';
import { useTrips } from '@/hooks/useTrips';
import TripListingGroup from '@/components/trips/TripListingGroup';

export default function TripsPage() {
  const { data: trips = [], isLoading } = useTrips();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <TripListingGroup trips={trips} isLoading={isLoading} />
    </div>
  );
}
