'use client';

import React, { useEffect } from 'react';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import AdminDashboardView from '@/components/admin/AdminDashboardView';
import { useAuth } from '@/hooks/useAuth';
import { ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      router.replace('/trips');
    }
  }, [user, router]);

  if (user && user.role !== 'ADMIN') {
    return (
      <ProtectedRoute>
        <div className="mx-auto max-w-lg py-20 px-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-600">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h1 className="mt-4 text-2xl font-black text-slate-900">Access Restricted</h1>
          <p className="mt-2 text-xs font-semibold text-slate-500">
            You do not have Administrator permissions to access this control panel. Redirecting to My Trips...
          </p>
          <Link
            href="/trips"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#FF6433] px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#E85324] transition"
          >
            Back to My Trips
          </Link>
        </div>
      </ProtectedRoute>
    );
  }


  return (
    <ProtectedRoute>
      <AdminDashboardView />
    </ProtectedRoute>
  );
}
