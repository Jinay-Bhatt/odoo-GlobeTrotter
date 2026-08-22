'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Trip, StopActivity } from '@/types';
import DayBlock from '@/components/itinerary/DayBlock';
import { useToggleShare, useCopyTrip } from '@/hooks/useTrips';
import toast from 'react-hot-toast';
import {
  Calendar,
  Layers,
  DollarSign,
  Share2,
  Copy,
  Edit,
  Globe,
  Lock,
  ArrowLeft,
  Check,
  Sparkles,
  Info,
  Clock,
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

interface ItineraryViewProps {
  trip: Trip;
}

export default function ItineraryView({ trip }: ItineraryViewProps) {
  const toggleShareMutation = useToggleShare();
  const copyTripMutation = useCopyTrip();
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const startDateObj = new Date(trip.startDate);
  const endDateObj = new Date(trip.endDate);
  const totalDays = Math.max(1, differenceInDays(endDateObj, startDateObj) + 1);

  const plannedBudget = trip.sections?.reduce((acc, s) => acc + (s.budget || 0), 0) || trip.totalBudget || 0;

  const allStopActivities: { stop: StopActivity; sectionName: string }[] = useMemo(() => {
    const list: { stop: StopActivity; sectionName: string }[] = [];
    trip.sections?.forEach((sec) => {
      sec.activities?.forEach((stop) => {
        list.push({ stop, sectionName: sec.name });
      });
    });
    return list;
  }, [trip.sections]);

  const totalActualSpent = useMemo(() => {
    return allStopActivities.reduce((acc, item) => acc + (item.stop.expense || 0), 0);
  }, [allStopActivities]);

  const daysArray = useMemo(() => {
    return Array.from({ length: totalDays }, (_, i) => i + 1);
  }, [totalDays]);

  const handleToggleShare = async () => {
    try {
      const res = await toggleShareMutation.mutateAsync(trip.id);
      if (res.isPublic) {
        setShareModalOpen(true);
        toast.success('Public share link generated!');
      } else {
        toast.success('Trip is now private');
        setShareModalOpen(false);
      }
    } catch {
      toast.error('Failed to update share settings');
    }
  };

  const handleCopyLink = () => {
    if (trip.shareToken) {
      const shareUrl = `${window.location.origin}/share/${trip.shareToken}`;
      navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      toast.success('Share link copied to clipboard!');
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  const handleDuplicate = async () => {
    try {
      await copyTripMutation.mutateAsync(trip.id);
      toast.success('Trip copied successfully to your account!');
    } catch {
      toast.error('Failed to copy trip');
    }
  };

  return (
    <div className="space-y-10">
      {/* Back link */}
      <div>
        <Link
          href="/trips"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to All Journeys
        </Link>
      </div>

      {/* Hero Header Card */}
      <div className="relative overflow-hidden rounded-3xl border border-[#ECE6DE] bg-white shadow-sm">
        {/* Cover Photo */}
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

          {/* Badges */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="rounded-full bg-[#FF6433] px-3.5 py-1 text-xs font-bold text-white shadow-xs">
              {trip.status}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-bold text-white backdrop-blur-md ${
                trip.isPublic ? 'bg-emerald-600/80' : 'bg-black/50'
              }`}
            >
              {trip.isPublic ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
              {trip.isPublic ? 'Publicly Shared' : 'Private'}
            </span>
          </div>

          {/* Action buttons */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              onClick={handleToggleShare}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-4 py-2 text-xs font-bold text-slate-800 backdrop-blur-md hover:bg-white transition shadow-sm"
            >
              <Share2 className="h-3.5 w-3.5 text-[#FF6433]" />
              {trip.isPublic ? 'Share Link' : 'Make Public'}
            </button>
            <button
              onClick={handleDuplicate}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-4 py-2 text-xs font-bold text-slate-800 backdrop-blur-md hover:bg-white transition shadow-sm"
            >
              <Copy className="h-3.5 w-3.5 text-slate-700" />
              Duplicate
            </button>
            <Link
              href={`/trips/${trip.id}/itinerary`}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#FF6433] px-5 py-2 text-xs font-bold text-white shadow-md shadow-[#FF6433]/25 hover:bg-[#E85324] transition"
            >
              <Edit className="h-3.5 w-3.5" />
              Edit Chapters
            </Link>
          </div>

          {/* Title & Dates */}
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

        {/* Hero Body / Metadata */}
        <div className="p-6 sm:p-10">
          {trip.description && (
            <p className="text-sm text-slate-600 leading-relaxed max-w-3xl mb-8">
              {trip.description}
            </p>
          )}

          {/* Budget Rollup Matrix */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 border-t border-[#ECE6DE] pt-8">
            <div className="rounded-3xl bg-[#FAF8F5] p-5 border border-[#ECE6DE]">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Allocated Budget</p>
              <p className="text-3xl font-black text-[#0F172A] mt-1">
                ${plannedBudget.toLocaleString()}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Sum of all chapter limits</p>
            </div>

            <div className="rounded-3xl bg-[#FEF3EE] p-5 border border-[#FF6433]/20">
              <p className="text-xs font-bold text-[#FF6433] uppercase tracking-wider">Scheduled Expenses</p>
              <p className="text-3xl font-black text-[#FF6433] mt-1">
                ${totalActualSpent.toLocaleString()}
              </p>
              <p className="text-[11px] text-[#FF6433]/80 mt-1">Sum of activity stops</p>
            </div>

            <div className="rounded-3xl bg-slate-50 p-5 border border-[#ECE6DE]">
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Remaining</p>
              <p className={`text-3xl font-black mt-1 ${plannedBudget - totalActualSpent >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>
                ${(plannedBudget - totalActualSpent).toLocaleString()}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                {plannedBudget - totalActualSpent >= 0 ? 'Within budget plan' : 'Exceeds budget plan'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Day-by-Day Vertical Timeline */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-[#0F172A] flex items-center gap-2">
              <Clock className="h-6 w-6 text-[#FF6433]" />
              Day-by-Day Journey Flow
            </h2>
            <p className="text-xs text-slate-500">
              Complete chronological breakdown of activities across all chapters.
            </p>
          </div>

          <Link
            href={`/trips/${trip.id}/itinerary`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF6433] hover:underline"
          >
            <Edit className="h-3.5 w-3.5" />
            Add / Reorder Stops
          </Link>
        </div>

        {/* Days Loop */}
        <div className="pt-2">
          {daysArray.map((dayNum) => {
            const matchingStops = allStopActivities
              .filter((item) => item.stop.day === dayNum)
              .map((item) => item.stop);

            const sectionName = allStopActivities.find((item) => item.stop.day === dayNum)?.sectionName;

            return (
              <DayBlock
                key={dayNum}
                dayNumber={dayNum}
                tripStartDate={trip.startDate}
                activities={matchingStops}
                sectionName={sectionName}
              />
            );
          })}
        </div>
      </div>

      {/* Share Modal */}
      {shareModalOpen && trip.isPublic && trip.shareToken && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-[#ECE6DE] bg-white p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-base font-black text-[#0F172A] flex items-center gap-2">
                <Globe className="h-4 w-4 text-[#FF6433]" />
                Public Share Link
              </h3>
              <button
                onClick={() => setShareModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Anyone with this unique link can view this itinerary and duplicate it to their account. No private account credentials or database IDs are exposed.
              </p>

              <div className="flex items-center gap-2 rounded-2xl border border-[#ECE6DE] bg-[#FAF8F5] p-2 text-xs">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/share/${trip.shareToken}`}
                  className="flex-1 bg-transparent text-slate-700 outline-none text-[11px] pl-2"
                />
                <button
                  onClick={handleCopyLink}
                  className="inline-flex items-center gap-1 rounded-full bg-[#FF6433] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#E85324]"
                >
                  {copiedLink ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copiedLink ? 'Copied' : 'Copy'}
                </button>
              </div>

              <div className="flex justify-end pt-3">
                <button
                  onClick={() => setShareModalOpen(false)}
                  className="rounded-full border border-[#ECE6DE] bg-[#FAF8F5] px-5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
