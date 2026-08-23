'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trip, StopActivity } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { useCopyTrip } from '@/hooks/useTrips';
import api from '@/lib/api';
import { mockTrips } from '@/lib/mockData';
import toast from 'react-hot-toast';
import {
  Compass,
  Calendar,
  Layers,
  DollarSign,
  Copy,
  User as UserIcon,
  Globe,
  ArrowRight,
  Clock,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { format, differenceInDays, addDays } from 'date-fns';

export default function PublicSharePage({
  params,
}: {
  params: Promise<{ token: string }> | { token: string };
}) {
  const resolvedParams = 'then' in params ? use(params) : params;
  const token = resolvedParams.token;

  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const copyTripMutation = useCopyTrip();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCopying, setIsCopying] = useState(false);

  useEffect(() => {
    async function loadSharedTrip() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await api.get<{ trip: Trip }>(`/api/share/${token}`);
        setTrip(res.data.trip);
      } catch {
        const storedTripsStr = typeof window !== 'undefined' ? localStorage.getItem('gt_mock_trips') : null;
        const allTrips: Trip[] = storedTripsStr ? JSON.parse(storedTripsStr) : mockTrips;
        const found = allTrips.find(
          (t) => t.shareToken === token || (t.isPublic && t.id === token) || t.id === 'trip-001'
        );

        if (found) {
          setTrip(found);
        } else {
          setError('The requested shared itinerary could not be found or has expired.');
        }
      } finally {
        setIsLoading(false);
      }
    }

    if (token) {
      loadSharedTrip();
    }
  }, [token]);

  const handleCopyTrip = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in or create an account to copy this itinerary.');
      router.push(`/login?redirect=${encodeURIComponent(`/share/${token}`)}`);
      return;
    }

    if (!trip) return;

    setIsCopying(true);
    try {
      const copied = await copyTripMutation.mutateAsync(trip.id);
      toast.success('Trip copied to your account!');
      router.push(`/trips/${copied.id}`);
    } catch {
      toast.error('Failed to copy trip');
    } finally {
      setIsCopying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF8F5]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#FF6433] border-t-transparent" />
          <p className="text-xs font-medium text-slate-500">Loading shared travel itinerary...</p>
        </div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#FAF8F5] px-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FEF3EE] text-[#FF6433] mb-3">
          <Globe className="h-7 w-7" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">Itinerary Not Found</h1>
        <p className="mt-1 text-xs text-slate-500 max-w-sm">
          {error || 'This travel plan is either private or the link has expired.'}
        </p>
        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-[#FF6433] px-6 py-3 text-xs font-bold text-white shadow-md shadow-[#FF6433]/25 hover:bg-[#E85324]"
          >
            Explore Around
          </Link>
        </div>
      </div>
    );
  }

  const startDateObj = new Date(trip.startDate);
  const endDateObj = new Date(trip.endDate);
  const totalDays = Math.max(1, differenceInDays(endDateObj, startDateObj) + 1);

  const allStopActivities: { stop: StopActivity; sectionName: string }[] = [];
  trip.sections?.forEach((sec) => {
    sec.activities?.forEach((stop) => {
      allStopActivities.push({ stop, sectionName: sec.name });
    });
  });

  const totalActualSpent = allStopActivities.reduce((acc, item) => acc + (item.stop.expense || 0), 0);
  const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Public Top Navbar */}
      <header className="sticky top-0 z-30 px-4 sm:px-6 lg:px-8 pt-3 pb-2 bg-[#FAF8F5]/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between rounded-full border border-[#ECE6DE] bg-white px-6 shadow-xs">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FF6433] text-white shadow-sm shadow-[#FF6433]/30">
              <Compass className="h-5 w-5" />
            </div>
            <span className="text-lg font-black tracking-tight text-[#0F172A]">
              Around<span className="text-[#FF6433]">.</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyTrip}
              disabled={isCopying}
              className="inline-flex items-center gap-2 rounded-full bg-[#FF6433] px-5 py-2 text-xs font-bold text-white shadow-md shadow-[#FF6433]/25 hover:bg-[#E85324] transition disabled:opacity-60"
            >
              {isCopying ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copy Trip to My Account
                </>
              )}
            </button>

            {!isAuthenticated && (
              <Link
                href={`/login?redirect=${encodeURIComponent(`/share/${token}`)}`}
                className="hidden sm:inline-block rounded-full border border-[#ECE6DE] bg-[#FAF8F5] px-4 py-2 text-xs font-bold text-slate-700 hover:bg-white"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Shared Itinerary Container */}
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Public Hero Card */}
        <div className="overflow-hidden rounded-3xl border border-[#ECE6DE] bg-white shadow-sm">
          <div className="relative h-72 sm:h-96 w-full overflow-hidden bg-slate-100">
            <img
              src={
                trip.coverPhoto ||
                'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&auto=format&fit=crop&q=80'
              }
              alt={trip.name}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F17]/90 via-[#0B0F17]/30 to-transparent" />

            <div className="absolute top-4 left-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FF6433] px-3.5 py-1 text-xs font-bold text-white shadow-xs">
                <Globe className="h-3.5 w-3.5" />
                Public Shared Itinerary
              </span>
            </div>

            <div className="absolute bottom-6 left-6 right-6 text-white space-y-1.5">
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight drop-shadow">
                {trip.name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-2 drop-shadow">
                <Calendar className="h-4 w-4 text-[#FF6433]" />
                {format(startDateObj, 'MMMM d, yyyy')} – {format(endDateObj, 'MMMM d, yyyy')} ({totalDays} Days)
              </p>
            </div>
          </div>

          <div className="p-6 sm:p-10">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-6">
              {/* Creator info */}
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FEF3EE] text-[#FF6433] font-bold text-sm">
                  {trip.user?.firstName ? trip.user.firstName.charAt(0) : 'T'}
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Curated by</p>
                  <p className="text-sm font-black text-[#0F172A]">
                    {trip.user?.firstName ? `${trip.user.firstName} ${trip.user.lastName || ''}` : 'Around Traveler'}
                  </p>
                </div>
              </div>

              {/* Stats Highlights */}
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-[#FAF8F5] px-4 py-2 text-xs border border-[#ECE6DE]">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Total Budget: </span>
                  <span className="font-extrabold text-[#0F172A]">${(trip.totalBudget || totalActualSpent).toLocaleString()}</span>
                </div>
                <div className="rounded-2xl bg-[#FEF3EE] px-4 py-2 text-xs border border-[#FF6433]/20">
                  <span className="text-[10px] text-[#FF6433] uppercase font-bold">Activities: </span>
                  <span className="font-extrabold text-[#FF6433]">{allStopActivities.length} stops</span>
                </div>
              </div>
            </div>

            {trip.description && (
              <p className="mt-5 text-sm text-slate-600 leading-relaxed max-w-3xl">
                {trip.description}
              </p>
            )}
          </div>
        </div>

        {/* Read-Only Timeline Flow */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-black text-[#0F172A] flex items-center gap-2">
              <Clock className="h-6 w-6 text-[#FF6433]" />
              Complete Day-by-Day Schedule
            </h2>
            <p className="text-xs text-slate-500">
              Browse through the daily destinations and stops planned for this journey.
            </p>
          </div>

          <div className="space-y-4">
            {daysArray.map((dayNum) => {
              const dayDate = addDays(startDateObj, dayNum - 1);
              const matchingStops = allStopActivities
                .filter((item) => item.stop.day === dayNum)
                .map((item) => item.stop);

              const sectionName = allStopActivities.find((item) => item.stop.day === dayNum)?.sectionName;

              return (
                <div
                  key={dayNum}
                  className="overflow-hidden rounded-3xl border border-[#ECE6DE] bg-white p-6 shadow-xs"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0F172A] text-xs font-black text-white">
                        D{dayNum}
                      </span>
                      <div>
                        <h3 className="text-sm font-black text-[#0F172A]">Day {dayNum}</h3>
                        <p className="text-xs text-slate-400">
                          {format(dayDate, 'EEEE, MMMM d, yyyy')}
                          {sectionName && ` · Chapter: ${sectionName}`}
                        </p>
                      </div>
                    </div>

                    <span className="text-xs font-black text-[#FF6433] bg-[#FEF3EE] px-3 py-1 rounded-full border border-[#FF6433]/20">
                      ${matchingStops.reduce((acc, s) => acc + (s.expense || 0), 0)} scheduled
                    </span>
                  </div>

                  <div className="mt-3.5 space-y-2">
                    {matchingStops.length > 0 ? (
                      matchingStops.map((stop) => (
                        <div
                          key={stop.id}
                          className="flex items-center justify-between rounded-2xl bg-[#FAF8F5] p-3.5 text-xs border border-[#ECE6DE]/80"
                        >
                          <div>
                            <p className="font-extrabold text-[#0F172A]">
                              {stop.activity?.name || 'Scheduled Activity'}
                            </p>
                            {stop.notes && (
                              <p className="text-[11px] text-slate-500 italic mt-0.5">
                                &ldquo;{stop.notes}&rdquo;
                              </p>
                            )}
                          </div>
                          <span className="font-black text-slate-900 bg-white px-2.5 py-1 rounded-full border border-[#ECE6DE]">
                            ${stop.expense}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 italic py-1">
                        Free exploration day or travel transition.
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-[#0F172A] p-10 text-center text-white shadow-xl border border-slate-800">
          <div className="absolute top-0 right-1/2 -mt-20 h-64 w-64 rounded-full bg-[#FF6433]/20 blur-3xl" />
          <Sparkles className="h-8 w-8 text-[#FF6433] mx-auto mb-3" />
          <h3 className="text-2xl font-black">Want to customize this trip?</h3>
          <p className="mt-1 text-xs text-slate-300 max-w-md mx-auto">
            Duplicate this itinerary directly to your Around account to personalize chapters, budget limits, and day activities.
          </p>
          <button
            onClick={handleCopyTrip}
            disabled={isCopying}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#FF6433] px-7 py-3 text-xs font-bold text-white shadow-lg shadow-[#FF6433]/30 hover:bg-[#E85324] transition disabled:opacity-60"
          >
            <Copy className="h-4 w-4" />
            Duplicate to My Itineraries
          </button>
        </div>
      </main>
    </div>
  );
}
