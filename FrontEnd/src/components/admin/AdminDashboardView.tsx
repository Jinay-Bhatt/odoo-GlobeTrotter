'use client';

import React from 'react';
import { useAdminMetrics, useAdminUsers, useUpdateUserRole, useDeleteUser } from '@/hooks/useAdmin';
import { Role } from '@/types';
import { Users, MapPin, MessageSquare, DollarSign, ShieldAlert, Trash2, Loader2, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminDashboardView() {
  const { data: metrics, isLoading: loadingMetrics } = useAdminMetrics();
  const { data: users, isLoading: loadingUsers } = useAdminUsers();
  const updateRoleMutation = useUpdateUserRole();
  const deleteUserMutation = useDeleteUser();

  const handleRoleToggle = async (userId: string, currentRole: Role) => {
    const newRole: Role = currentRole === 'ADMIN' ? 'TRAVELER' : 'ADMIN';
    try {
      await updateRoleMutation.mutateAsync({ userId, role: newRole });
      toast.success(`User role changed to ${newRole}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    if (confirm(`Are you sure you want to delete user ${email}? All associated data will be removed.`)) {
      try {
        await deleteUserMutation.mutateAsync(userId);
        toast.success('User deleted successfully');
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Admin Title */}
      <div className="rounded-3xl border border-[#ECE6DE] bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-2 text-[#FF6433] text-xs font-bold uppercase tracking-wider">
          <ShieldAlert className="h-4 w-4" />
          System Administration
        </div>
        <h1 className="mt-1 text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          GlobeTrotter Admin Dashboard
        </h1>
        <p className="mt-1 text-xs sm:text-sm font-semibold text-slate-500">
          Monitor platform metrics, traveler statistics, system expenses, and user authorizations live.
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <div className="rounded-3xl border border-[#ECE6DE] bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Users</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-4 text-3xl font-black text-slate-900">
            {loadingMetrics ? <Loader2 className="h-6 w-6 animate-spin text-slate-400" /> : metrics?.totalUsers || 0}
          </p>
          <span className="mt-1 inline-block text-[11px] font-semibold text-slate-400">Registered Travelers</span>
        </div>

        {/* Total Trips */}
        <div className="rounded-3xl border border-[#ECE6DE] bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Trips</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FEF3EE] text-[#FF6433]">
              <MapPin className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-4 text-3xl font-black text-slate-900">
            {loadingMetrics ? <Loader2 className="h-6 w-6 animate-spin text-slate-400" /> : metrics?.totalTrips || 0}
          </p>
          <span className="mt-1 inline-block text-[11px] font-semibold text-slate-400">Active Itineraries</span>
        </div>

        {/* Community Posts */}
        <div className="rounded-3xl border border-[#ECE6DE] bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Community Posts</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
              <MessageSquare className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-4 text-3xl font-black text-slate-900">
            {loadingMetrics ? <Loader2 className="h-6 w-6 animate-spin text-slate-400" /> : metrics?.totalPosts || 0}
          </p>
          <span className="mt-1 inline-block text-[11px] font-semibold text-slate-400">Stories & Experiences</span>
        </div>

        {/* Total Expenditure */}
        <div className="rounded-3xl border border-[#ECE6DE] bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Platform Expenditure</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-4 text-3xl font-black text-slate-900">
            {loadingMetrics ? <Loader2 className="h-6 w-6 animate-spin text-slate-400" /> : `$${metrics?.totalExpenses?.toLocaleString() || 0}`}
          </p>
          <span className="mt-1 inline-block text-[11px] font-semibold text-slate-400">Total Planned Budgets</span>
        </div>
      </div>

      {/* User Management Table */}
      <div className="mt-8 rounded-3xl border border-[#ECE6DE] bg-white p-6 shadow-sm overflow-hidden">
        <h2 className="text-lg font-bold text-slate-900 mb-4">User Accounts Management</h2>

        {loadingUsers ? (
          <div className="flex items-center justify-center py-12 text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin text-[#FF6433]" />
          </div>
        ) : users && users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-medium text-slate-600">
              <thead className="border-b border-slate-100 bg-[#FAF8F5] text-slate-500 uppercase tracking-wider font-bold">
                <tr>
                  <th className="px-4 py-3 rounded-l-xl">User</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3 text-right rounded-r-xl">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-[#FAF8F5] transition">
                    <td className="px-4 py-3.5 flex items-center gap-3">
                      {u.photo ? (
                        <img src={u.photo} alt={u.firstName} className="h-8 w-8 rounded-full object-cover" />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FEF3EE] font-bold text-[#FF6433]">
                          {u.firstName.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-slate-900">{u.firstName} {u.lastName}</p>
                        <p className="text-[10px] text-slate-400">ID: {u.id.substring(0, 8)}...</p>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-slate-700">{u.email}</td>
                    <td className="px-4 py-3.5 font-medium text-slate-500">
                      {u.city && u.country ? `${u.city}, ${u.country}` : u.city || u.country || 'N/A'}
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => handleRoleToggle(u.id, u.role)}
                        disabled={updateRoleMutation.isPending}
                        className={`rounded-full px-3 py-1 text-[10px] font-bold transition ${
                          u.role === 'ADMIN'
                            ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {u.role}
                      </button>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => handleDeleteUser(u.id, u.email)}
                        disabled={deleteUserMutation.isPending}
                        className="rounded-full p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                        title="Delete User"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="py-8 text-center text-xs font-bold text-slate-400">No user accounts registered yet.</p>
        )}
      </div>
    </div>
  );
}
