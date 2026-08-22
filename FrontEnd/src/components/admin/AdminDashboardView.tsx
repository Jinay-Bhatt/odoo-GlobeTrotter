'use client';

import React, { useState, useMemo } from 'react';
import {
  useAdminMetrics,
  useAdminUsers,
  usePopularCities,
  usePopularActivities,
  useUpdateUserRole,
  useDeleteUser,
} from '@/hooks/useAdmin';
import { Role } from '@/types';
import { getImageUrl } from '@/lib/api';

import {
  Users,
  MapPin,
  MessageSquare,
  DollarSign,
  ShieldAlert,
  Trash2,
  Loader2,
  Sparkles,
  TrendingUp,
  PieChart,
  Compass,
  Search,
  Filter,
  ArrowUpDown,
  Layers,
  Star,
  Activity as ActivityIcon,
  CheckCircle2,
  SlidersHorizontal,
} from 'lucide-react';
import toast from 'react-hot-toast';

type AdminTab = 'USERS' | 'CITIES' | 'ACTIVITIES' | 'ANALYTICS';

export default function AdminDashboardView() {
  const [activeTab, setActiveTab] = useState<AdminTab>('USERS');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'TRAVELER' | 'ADMIN'>('ALL');
  const [sortBy, setSortBy] = useState<'NEWEST' | 'NAME' | 'POPULARITY'>('NEWEST');

  const { data: metrics, isLoading: loadingMetrics } = useAdminMetrics();
  const { data: users, isLoading: loadingUsers } = useAdminUsers();
  const { data: popularCities, isLoading: loadingCities } = usePopularCities();
  const { data: popularActivities, isLoading: loadingActivities } = usePopularActivities();

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

  // Filtered Users List
  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return users.filter((u) => {
      const matchesSearch =
        u.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.city?.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;
      if (roleFilter === 'ALL') return true;
      return u.role === roleFilter;
    });
  }, [users, searchTerm, roleFilter]);

  // Filtered Cities List
  const filteredCities = useMemo(() => {
    if (!popularCities) return [];
    return popularCities.filter((c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.country.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [popularCities, searchTerm]);

  // Filtered Activities List
  const filteredActivities = useMemo(() => {
    if (!popularActivities) return [];
    return popularActivities.filter((a) =>
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.city?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [popularActivities, searchTerm]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Admin Title Banner */}
      <div className="rounded-3xl border border-[#ECE6DE] bg-[#0F172A] p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#FF6433] text-xs font-bold uppercase tracking-wider">
              <ShieldAlert className="h-4 w-4" />
              Executive Admin Console
            </div>
            <h1 className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-white">
              GlobeTrotter Control Center
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-300">
              Manage platform users, monitor destination popularity ratings, and track live financial trends.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-emerald-500/20 px-3.5 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              System Online
            </span>
          </div>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
          <span className="mt-1 inline-block text-[11px] font-semibold text-slate-400">Registered Accounts</span>
        </div>

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

        <div className="rounded-3xl border border-[#ECE6DE] bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Community Stories</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
              <MessageSquare className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-4 text-3xl font-black text-slate-900">
            {loadingMetrics ? <Loader2 className="h-6 w-6 animate-spin text-slate-400" /> : metrics?.totalPosts || 0}
          </p>
          <span className="mt-1 inline-block text-[11px] font-semibold text-slate-400">Published Feeds</span>
        </div>

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

      {/* Control Bar: Search & Group/Filter/Sort Controls (matching wireframe) */}
      <div className="rounded-3xl border border-[#ECE6DE] bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search bar (users, cities, activities)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-full border border-slate-200 bg-[#FAF8F5] pl-10 pr-4 py-2.5 text-xs font-bold text-slate-800 placeholder-slate-400 focus:border-[#FF6433] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6433]/20"
            />
          </div>

          {/* Group By / Filter / Sort By Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Role Filter */}
            <div className="flex items-center rounded-full bg-[#FAF8F5] p-1 border border-[#ECE6DE] text-xs">
              <span className="px-2 text-[10px] font-bold text-slate-400 uppercase">Role:</span>
              {(['ALL', 'TRAVELER', 'ADMIN'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`rounded-full px-3 py-1 text-xs font-bold transition cursor-pointer ${
                    roleFilter === r ? 'bg-[#0F172A] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center rounded-full bg-[#FAF8F5] px-3 py-1.5 border border-[#ECE6DE] text-xs font-bold text-slate-700 gap-1.5">
              <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
              <span>Sort: Newest</span>
            </div>
          </div>
        </div>

        {/* 4 Main Admin Tabs (Matching Wireframe) */}
        <div className="flex items-center gap-2 overflow-x-auto border-t border-slate-100 pt-4">
          <button
            onClick={() => setActiveTab('USERS')}
            className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold transition cursor-pointer ${
              activeTab === 'USERS'
                ? 'bg-[#FF6433] text-white shadow-md shadow-[#FF6433]/25'
                : 'bg-[#FAF8F5] text-slate-600 border border-[#ECE6DE] hover:bg-white hover:text-slate-900'
            }`}
          >
            <Users className="h-4 w-4" />
            Manage Users ({users?.length || 0})
          </button>

          <button
            onClick={() => setActiveTab('CITIES')}
            className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold transition cursor-pointer ${
              activeTab === 'CITIES'
                ? 'bg-[#FF6433] text-white shadow-md shadow-[#FF6433]/25'
                : 'bg-[#FAF8F5] text-slate-600 border border-[#ECE6DE] hover:bg-white hover:text-slate-900'
            }`}
          >
            <Compass className="h-4 w-4" />
            Popular Cities ({popularCities?.length || 0})
          </button>

          <button
            onClick={() => setActiveTab('ACTIVITIES')}
            className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold transition cursor-pointer ${
              activeTab === 'ACTIVITIES'
                ? 'bg-[#FF6433] text-white shadow-md shadow-[#FF6433]/25'
                : 'bg-[#FAF8F5] text-slate-600 border border-[#ECE6DE] hover:bg-white hover:text-slate-900'
            }`}
          >
            <ActivityIcon className="h-4 w-4" />
            Popular Activities ({popularActivities?.length || 0})
          </button>

          <button
            onClick={() => setActiveTab('ANALYTICS')}
            className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold transition cursor-pointer ${
              activeTab === 'ANALYTICS'
                ? 'bg-[#FF6433] text-white shadow-md shadow-[#FF6433]/25'
                : 'bg-[#FAF8F5] text-slate-600 border border-[#ECE6DE] hover:bg-white hover:text-slate-900'
            }`}
          >
            <TrendingUp className="h-4 w-4" />
            User Trends & Analytics
          </button>
        </div>
      </div>

      {/* TAB CONTENT 1: MANAGE USERS */}
      {activeTab === 'USERS' && (
        <div className="rounded-3xl border border-[#ECE6DE] bg-white p-6 shadow-sm overflow-hidden space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900">User Accounts Directory</h2>
            <span className="text-xs font-bold text-slate-400">Showing {filteredUsers.length} Users</span>
          </div>

          {loadingUsers ? (
            <div className="flex items-center justify-center py-16 text-slate-400">
              <Loader2 className="h-8 w-8 animate-spin text-[#FF6433]" />
            </div>
          ) : filteredUsers && filteredUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-medium text-slate-600">
                <thead className="border-b border-slate-100 bg-[#FAF8F5] text-slate-500 uppercase tracking-wider font-bold">
                  <tr>
                    <th className="px-4 py-3.5 rounded-l-xl">User</th>
                    <th className="px-4 py-3.5">Email</th>
                    <th className="px-4 py-3.5">Location</th>
                    <th className="px-4 py-3.5">Trips & Posts</th>
                    <th className="px-4 py-3.5">Role</th>
                    <th className="px-4 py-3.5 text-right rounded-r-xl">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-[#FAF8F5] transition">
                      <td className="px-4 py-3.5 flex items-center gap-3">
                        {u.photo ? (
                          <img src={getImageUrl(u.photo)} alt={u.firstName} className="h-9 w-9 rounded-full object-cover ring-2 ring-slate-100" />
                        ) : (

                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FEF3EE] font-bold text-[#FF6433]">
                            {u.firstName ? u.firstName.charAt(0) : 'U'}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-slate-900">{u.firstName} {u.lastName}</p>
                          <p className="text-[10px] text-slate-400">ID: {u.id.substring(0, 8)}...</p>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-slate-700">{u.email}</td>
                      <td className="px-4 py-3.5 font-medium text-slate-500">
                        {u.city && u.country ? `${u.city}, ${u.country}` : u.city || u.country || 'Global'}
                      </td>
                      <td className="px-4 py-3.5 font-bold text-slate-700">
                        {u._count?.trips || 0} trips · {u._count?.posts || 0} posts
                      </td>
                      <td className="px-4 py-3.5">
                        <button
                          onClick={() => handleRoleToggle(u.id, u.role)}
                          disabled={updateRoleMutation.isPending}
                          className={`rounded-full px-3.5 py-1 text-[10px] font-bold transition cursor-pointer ${
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
                          className="rounded-full p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
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
            <p className="py-12 text-center text-xs font-bold text-slate-400">No users found matching query.</p>
          )}
        </div>
      )}

      {/* TAB CONTENT 2: POPULAR CITIES */}
      {activeTab === 'CITIES' && (
        <div className="rounded-3xl border border-[#ECE6DE] bg-white p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900">Most Rated & Visited Cities</h2>
              <p className="text-xs text-slate-500">Popularity scores and activity inventory across global destinations.</p>
            </div>
            <span className="text-xs font-bold text-slate-400">{filteredCities.length} Cities</span>
          </div>

          {loadingCities ? (
            <div className="flex items-center justify-center py-16 text-slate-400">
              <Loader2 className="h-8 w-8 animate-spin text-[#FF6433]" />
            </div>
          ) : filteredCities && filteredCities.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCities.map((city) => (
                <div key={city.id} className="rounded-2xl border border-[#ECE6DE] bg-[#FAF8F5] p-5 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-black text-slate-900">{city.name}</h3>
                      <p className="text-xs font-semibold text-slate-500">{city.country}</p>
                    </div>
                    <div className="flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 border border-amber-200">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                      {city.popularity} Score
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs font-bold text-slate-600">
                    <span>{city._count?.activities || 0} Recommended Activities</span>
                    <span className="text-[#FF6433]">Top Rated</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-12 text-center text-xs font-bold text-slate-400">No popular cities found.</p>
          )}
        </div>
      )}

      {/* TAB CONTENT 3: POPULAR ACTIVITIES */}
      {activeTab === 'ACTIVITIES' && (
        <div className="rounded-3xl border border-[#ECE6DE] bg-white p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900">Top Traveler Activity Experiences</h2>
              <p className="text-xs text-slate-500">Activities ranked by total traveler itinerary additions.</p>
            </div>
            <span className="text-xs font-bold text-slate-400">{filteredActivities.length} Activities</span>
          </div>

          {loadingActivities ? (
            <div className="flex items-center justify-center py-16 text-slate-400">
              <Loader2 className="h-8 w-8 animate-spin text-[#FF6433]" />
            </div>
          ) : filteredActivities && filteredActivities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredActivities.map((act) => (
                <div key={act.id} className="flex items-center justify-between rounded-2xl border border-[#ECE6DE] bg-[#FAF8F5] p-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{act.name}</h3>
                    <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-semibold text-slate-700">{act.city?.name || 'Global'}</span>
                      <span>·</span>
                      <span className="rounded-full bg-[#FEF3EE] px-2.5 py-0.5 text-[10px] font-bold text-[#FF6433]">
                        {act.category}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-black text-emerald-600">${act.estimatedCost}</span>
                    <p className="text-[10px] font-bold text-slate-400 mt-0.5">{act._count?.stops || 0} Stops Added</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-12 text-center text-xs font-bold text-slate-400">No popular activities found.</p>
          )}
        </div>
      )}

      {/* TAB CONTENT 4: USER TRENDS & ANALYTICS (Charts & Visualizations as in wireframe) */}
      {activeTab === 'ANALYTICS' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Line / Expenditure Trend Chart */}
            <div className="lg:col-span-2 rounded-3xl border border-[#ECE6DE] bg-white p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 uppercase tracking-wider">
                    <TrendingUp className="h-4 w-4" />
                    Growth Analytics
                  </div>
                  <h3 className="text-lg font-black text-slate-900 mt-1">User Activity & Monthly Budget Growth</h3>
                </div>
                <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3.5 py-1 text-xs font-bold text-emerald-700">
                  +32% Active Travelers
                </span>
              </div>

              {/* Bar / Trend Graph */}
              <div className="h-60 w-full flex items-end justify-between gap-2.5 border-b border-slate-100 pb-3 pt-6">
                {[
                  { month: 'Jan', value: 420 },
                  { month: 'Feb', value: 680 },
                  { month: 'Mar', value: 950 },
                  { month: 'Apr', value: 1200 },
                  { month: 'May', value: 890 },
                  { month: 'Jun', value: 1450 },
                  { month: 'Jul', value: 1780 },
                  { month: 'Aug', value: 1500 },
                  { month: 'Sep', value: 2100 },
                  { month: 'Oct', value: 1850 },
                  { month: 'Nov', value: 1300 },
                  { month: 'Dec', value: 2400 },
                ].map((bar) => {
                  const heightPercent = Math.min(100, Math.max(15, (bar.value / 2500) * 100));
                  const isHighlight = bar.month === 'Sep' || bar.month === 'Dec';
                  return (
                    <div key={bar.month} className="group relative flex flex-col items-center flex-1 h-full justify-end cursor-pointer">
                      <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition rounded-xl bg-slate-900 px-2.5 py-1 text-[10px] font-bold text-white shadow-lg pointer-events-none z-20">
                        ${bar.value}
                      </div>
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full rounded-t-xl transition-all duration-300 ${
                          isHighlight ? 'bg-[#FF6433] shadow-md' : 'bg-[#0F172A]'
                        }`}
                      />
                      <span className="mt-2 text-[10px] font-bold text-slate-400">{bar.month}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pie / Donut Chart */}
            <div className="rounded-3xl border border-[#ECE6DE] bg-white p-6 sm:p-8 shadow-sm flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-purple-600 uppercase tracking-wider">
                  <PieChart className="h-4 w-4" />
                  Account Types
                </div>
                <h3 className="text-lg font-black text-slate-900 mt-1">User Role Ratio</h3>
              </div>

              <div className="flex flex-col items-center py-2 space-y-4">
                <div className="relative flex h-36 w-36 items-center justify-center rounded-full border-8 border-purple-100 bg-[#FAF8F5]">
                  <div className="absolute inset-0 rounded-full border-8 border-purple-600 border-t-transparent border-r-transparent rotate-45" />
                  <div className="text-center">
                    <span className="text-3xl font-black text-slate-900">{metrics?.totalUsers || 0}</span>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Users</p>
                  </div>
                </div>

                <div className="w-full space-y-3 pt-2 text-xs font-bold">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700 flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-slate-800" /> Travelers
                    </span>
                    <span className="text-slate-900">{users ? users.filter((u) => u.role === 'TRAVELER').length : 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-purple-700 flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-purple-600" /> System Admins
                    </span>
                    <span className="text-purple-700">{users ? users.filter((u) => u.role === 'ADMIN').length : 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
