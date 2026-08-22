'use client';

import React from 'react';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import CityExplorer from '@/components/cities/CityExplorer';

export default function CitiesPage() {
  return (
    <ProtectedRoute>
      <CityExplorer />
    </ProtectedRoute>
  );
}
