'use client';

import React from 'react';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import ProfileForm from '@/components/profile/ProfileForm';

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileForm />
    </ProtectedRoute>
  );
}
