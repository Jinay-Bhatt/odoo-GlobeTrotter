'use client';

import React from 'react';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import CommunityFeed from '@/components/community/CommunityFeed';

export default function CommunityPage() {
  return (
    <ProtectedRoute>
      <CommunityFeed />
    </ProtectedRoute>
  );
}
