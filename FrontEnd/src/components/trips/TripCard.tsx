'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Trip } from '@/types';
import { useDeleteTrip, useCopyTrip, useToggleShare } from '@/hooks/useTrips';
import toast from 'react-hot-toast';
import {
  Calendar,
  DollarSign,
  Share2,
  Copy,
  Trash2,
  Layers,
  ArrowRight,
  MoreVertical,
  Globe,
  Lock,
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

interface TripCardProps {
  trip: Trip;
}

const statusConfig = {
  ONGOING: {
    label: 'Ongoing',
    badgeClass: 'bg-[#FF6433] text-white shadow-xs shadow-[#FF6433]/30',
  },
  UPCOMING: {
    label: 'Upcoming',
    badgeClass: 'bg-[#0F172A] text-white shadow-xs',
  },
  COMPLETED: {
    label: 'Completed',
    badgeClass: 'bg-slate-500 text-white shadow-xs',
  },
  DRAFT: {
    label: 'Draft',
    badgeClass: 'bg-amber-500 text-white shadow-xs',
  },
};

export default function TripCard({ trip }: TripCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const deleteTripMutation = useDeleteTrip();
  const copyTripMutation = useCopyTrip();
  const toggleShareMutation = useToggleShare();

  const startDateObj = new Date(trip.startDate);
  const endDateObj = new Date(trip.endDate);
  const isValidDate = !isNaN(startDateObj.getTime()) && !isNaN(endDateObj.getTime());

  const dateRangeText = isValidDate
    ? `${format(startDateObj, 'MMM d')} – ${format(endDateObj, 'MMM d, yyyy')}`
    : 'Flexible Dates';

  const dayCount = isValidDate
    ? Math.max(1, differenceInDays(endDateObj, startDateObj) + 1)
    : 1;

  const totalSections = trip.sections?.length || 0;
  const totalStops = trip.sections?.reduce((acc, s) => acc + (s.activities?.length || 0), 0) || 0;

  const status = statusConfig[trip.status] || statusConfig.UPCOMING;

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete "${trip.name}"?`)) {
      try {
        await deleteTripMutation.mutateAsync(trip.id);
        toast.success('Trip deleted successfully');
      } catch {
        toast.error('Failed to delete trip');
      }
    }
  };

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await copyTripMutation.mutateAsync(trip.id);
      toast.success('Trip duplicated successfully!');
      setMenuOpen(false);
    } catch {
      toast.error('Failed to duplicate trip');
    }
  };

  const handleToggleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await toggleShareMutation.mutateAsync(trip.id);
      if (res.isPublic && res.shareToken) {
        const shareUrl = `${window.location.origin}/share/${res.shareToken}`;
        navigator.clipboard.writeText(shareUrl);
        toast.success('Public link copied to clipboard!');
      } else {
        toast.success('Trip made private');
      }
      setMenuOpen(false);
    } catch {
      toast.error('Failed to update sharing settings');
    }
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-3xl border border-[#ECE6DE] bg-white shadow-sm transition hover:shadow-xl hover:shadow-[#2D1B16]/5 hover:-translate-y-1 duration-300">
      {/* Cover Image Header */}
      <div className="relative h-56 w-full overflow-hidden bg-slate-100">
        <img
          src={
            trip.coverPhoto ||
            'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&auto=format&fit=crop&q=80'
          }
          alt={trip.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F17]/80 via-[#0B0F17]/20 to-transparent" />

        {/* Status Pill Badge */}
        <div className="absolute top-3.5 left-3.5">
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold ${status.badgeClass}`}>
            {status.label}
          </span>
        </div>

        {/* Visibility & Menu */}
        <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5">
          <span
            className={`flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md text-white text-xs ${
              trip.isPublic ? 'bg-[#FF6433]/80' : 'bg-black/40'
            }`}
            title={trip.isPublic ? 'Publicly shared' : 'Private'}
          >
            {trip.isPublic ? <Globe className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
          </span>

          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition hover:bg-black/60"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 z-20 mt-1 w-44 rounded-2xl border border-[#ECE6DE] bg-white py-1.5 shadow-xl">
                  <button
                    onClick={handleToggleShare}
                    className="flex w-full items-center gap-2 px-3.5 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-[#FAF8F5]"
                  >
                    <Share2 className="h-3.5 w-3.5 text-slate-400" />
                    {trip.isPublic ? 'Make Private' : 'Share / Copy Link'}
                  </button>
                  <button
                    onClick={handleCopy}
                    className="flex w-full items-center gap-2 px-3.5 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-[#FAF8F5]"
                  >
                    <Copy className="h-3.5 w-3.5 text-slate-400" />
                    Duplicate Trip
                  </button>
                  <div className="border-t border-slate-100 my-1" />
                  <button
                    onClick={handleDelete}
                    className="flex w-full items-center gap-2 px-3.5 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete Trip
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <h3 className="text-xl font-black line-clamp-1 drop-shadow">{trip.name}</h3>
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-1 flex-col justify-between p-5">
        <div className="space-y-3">
          {/* Dates & Duration */}
          <div className="flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-1.5 font-bold text-slate-700">
              <Calendar className="h-3.5 w-3.5 text-[#FF6433]" />
              <span>{dateRangeText}</span>
            </div>
            <span className="rounded-full bg-[#FEF3EE] px-2.5 py-0.5 text-[11px] font-extrabold text-[#FF6433] border border-[#FF6433]/20">
              {dayCount} {dayCount === 1 ? 'day' : 'days'}
            </span>
          </div>

          {/* Description */}
          {trip.description && (
            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
              {trip.description}
            </p>
          )}

          {/* Metrics Row: Budget & Plan */}
          <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-[#ECE6DE]/80">
            <div className="flex items-center gap-2 rounded-2xl bg-[#FAF8F5] p-2.5 text-xs border border-[#ECE6DE]">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FEF3EE] text-[#FF6433]">
                <DollarSign className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Budget</p>
                <p className="font-extrabold text-slate-900">${trip.totalBudget?.toLocaleString() || 0}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-2xl bg-[#FAF8F5] p-2.5 text-xs border border-[#ECE6DE]">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-slate-700">
                <Layers className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Plan</p>
                <p className="font-extrabold text-slate-900">
                  {totalSections}s · {totalStops} stops
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="mt-5 flex items-center gap-2 pt-3 border-t border-[#ECE6DE]/80">
          <Link
            href={`/trips/${trip.id}`}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#FF6433] px-4 py-2.5 text-xs font-bold text-white shadow-xs shadow-[#FF6433]/30 hover:bg-[#E85324] transition"
          >
            View Itinerary
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            href={`/trips/${trip.id}/itinerary`}
            className="rounded-full border border-[#ECE6DE] bg-[#FAF8F5] px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-white hover:border-slate-300 transition"
          >
            Edit
          </Link>
        </div>
      </div>
    </div>
  );
}
