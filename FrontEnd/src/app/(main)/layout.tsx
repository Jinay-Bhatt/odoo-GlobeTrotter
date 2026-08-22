import React from 'react';
import Navbar from '@/components/layout/Navbar';
import ProtectedRoute from '@/components/shared/ProtectedRoute';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <main className="flex-1 pb-16">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
