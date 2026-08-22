'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Trip, TripStatus } from '@/types';
import TripCard from '@/components/trips/TripCard';
import {
  Search,
  PlusCircle,
  Compass,
  Sparkles,
  MapPin,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface TripListingGroupProps {
  trips: Trip[];
  isLoading: boolean;
}

type TabFilter = 'ALL' | 'ONGOING' | 'UPCOMING' | 'COMPLETED';

export default function TripListingGroup({ trips, isLoading }: TripListingGroupProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabFilter>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const filteredTrips = useMemo(() => {
    return trips.filter((trip) => {
      const matchesSearch =
        trip.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip.description?.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (activeTab === 'ALL') return true;
      return trip.status === activeTab;
    });
  }, [trips, searchQuery, activeTab]);

  const totalPages = Math.ceil(filteredTrips.length / itemsPerPage) || 1;

  const paginatedTrips = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTrips.slice(start, start + itemsPerPage);
  }, [filteredTrips, currentPage, itemsPerPage]);

  const handleTabChange = (tab: TabFilter) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const counts = useMemo(() => {
    return {
      ALL: trips.length,
      ONGOING: trips.filter((t) => t.status === 'ONGOING').length,
      UPCOMING: trips.filter((t) => t.status === 'UPCOMING').length,
      COMPLETED: trips.filter((t) => t.status === 'COMPLETED').length,
    };
  }, [trips]);

  const totalGlobalBudget = useMemo(() => {
    return trips.reduce((acc, t) => acc + (t.totalBudget || 0), 0);
  }, [trips]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-44 w-full animate-pulse rounded-3xl bg-[#ECE6DE]/60" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-80 animate-pulse rounded-3xl bg-[#ECE6DE]/60" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Editorial Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-[#0F172A] p-8 sm:p-12 text-white shadow-xl shadow-[#0F172A]/10 border border-slate-800">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 h-80 w-80 rounded-full bg-[#FF6433]/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 -mb-16 h-64 w-64 rounded-full bg-[#FA5A2A]/15 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold backdrop-blur-md border border-white/10 text-[#FEF3EE]">
              <Sparkles className="h-3.5 w-3.5 text-[#FF6433]" />
              Around Traveler Hub
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              Curate Your Next <br />
              <span className="text-[#FF6433]">Grand Adventure.</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Design immersive itineraries, assign daily activities, track section expenses, and share your wanderlust.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Link
              href="/trips/new"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#FF6433] px-6 py-3 text-xs font-bold text-white shadow-lg shadow-[#FF6433]/30 hover:bg-[#E85324] transition"
            >
              <PlusCircle className="h-4 w-4" />
              Plan a New Journey
            </Link>
          </div>
        </div>

        {/* Stats Row */}
        <div className="relative z-10 mt-8 grid grid-cols-2 gap-4 border-t border-white/10 pt-6 sm:grid-cols-4">
          <div className="rounded-2xl bg-white/5 p-3.5 backdrop-blur-sm border border-white/5">
            <p className="text-[11px] text-slate-400 font-medium">All Journeys</p>
            <p className="text-2xl font-black text-white mt-0.5">{counts.ALL}</p>
          </div>
          <div className="rounded-2xl bg-white/5 p-3.5 backdrop-blur-sm border border-white/5">
            <p className="text-[11px] text-emerald-400 font-medium">Ongoing</p>
            <p className="text-2xl font-black text-white mt-0.5">{counts.ONGOING}</p>
          </div>
          <div className="rounded-2xl bg-white/5 p-3.5 backdrop-blur-sm border border-white/5">
            <p className="text-[11px] text-amber-400 font-medium">Upcoming</p>
            <p className="text-2xl font-black text-white mt-0.5">{counts.UPCOMING}</p>
          </div>
          <div className="rounded-2xl bg-white/5 p-3.5 backdrop-blur-sm border border-white/5">
            <p className="text-[11px] text-[#FF6433] font-medium">Planned Budget</p>
            <p className="text-2xl font-black text-white mt-0.5">${totalGlobalBudget.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Filter Bar: Pill Tabs & Search Capsule */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto rounded-full bg-white p-1.5 border border-[#ECE6DE] shadow-xs">
          {(
            [
              { id: 'ALL', label: 'All Trips' },
              { id: 'ONGOING', label: 'Ongoing' },
              { id: 'UPCOMING', label: 'Upcoming' },
              { id: 'COMPLETED', label: 'Completed' },
            ] as const
          ).map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition ${
                  isActive
                    ? 'bg-[#0F172A] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-[#FAF8F5]'
                }`}
              >
                {tab.label}
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                    isActive
                      ? 'bg-[#FF6433] text-white'
                      : 'bg-[#FAF8F5] text-slate-500 border border-[#ECE6DE]'
                  }`}
                >
                  {counts[tab.id]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Capsule */}
        <div className="relative min-w-[260px] sm:max-w-xs">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search trips by destination..."
            className="w-full rounded-full border border-[#ECE6DE] bg-white py-2.5 pl-10 pr-4 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#FF6433] focus:outline-none focus:ring-4 focus:ring-[#FF6433]/15 shadow-xs"
          />
        </div>
      </div>

      {/* Trips Grid & Pagination */}
      {paginatedTrips.length > 0 ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedTrips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>

          {/* Pagination Bar */}
          {totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#ECE6DE] bg-white px-6 py-4 shadow-xs">
              <span className="text-xs font-semibold text-slate-500">
                Showing Page <strong className="text-slate-900">{currentPage}</strong> of <strong className="text-slate-900">{totalPages}</strong> ({filteredTrips.length} Total Trips)
              </span>

              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  className="rounded-full border border-[#ECE6DE] bg-[#FAF8F5] px-4 py-1.5 text-xs font-bold text-slate-700 hover:bg-white disabled:opacity-40 transition cursor-pointer"
                >
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`h-8 w-8 rounded-full text-xs font-bold transition ${
                        currentPage === p
                          ? 'bg-[#FF6433] text-white shadow-xs'
                          : 'text-slate-600 hover:bg-[#FAF8F5]'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  className="rounded-full border border-[#ECE6DE] bg-[#FAF8F5] px-4 py-1.5 text-xs font-bold text-slate-700 hover:bg-white disabled:opacity-40 transition cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[#ECE6DE] bg-[#FAF8F5] p-14 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FEF3EE] text-[#FF6433] mb-4">
            <Compass className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-black text-[#0F172A]">
            {searchQuery ? 'No matching adventures found' : 'No trips in this category'}
          </h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm">
            {searchQuery
              ? `We couldn't find any trips matching "${searchQuery}". Try a different keyword.`
              : 'Create a new trip to start organizing sections, activities, and daily itineraries.'}
          </p>
          <div className="mt-6">
            <Link
              href="/trips/new"
              className="inline-flex items-center gap-2 rounded-full bg-[#FF6433] px-6 py-3 text-xs font-bold text-white shadow-md shadow-[#FF6433]/25 hover:bg-[#E85324] transition"
            >
              <PlusCircle className="h-4 w-4" />
              Plan a New Journey
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
