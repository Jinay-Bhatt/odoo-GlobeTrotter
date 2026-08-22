import React from 'react';
import TripForm from '@/components/trips/TripForm';

export const metadata = {
  title: 'Create Trip — GlobeTrotter',
  description: 'Plan your next adventure by creating a new travel itinerary.',
};

export default function NewTripPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <TripForm />
    </div>
  );
}
