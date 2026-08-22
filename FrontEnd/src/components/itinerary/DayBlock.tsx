'use client';

import React from 'react';
import { StopActivity, Category } from '@/types';
import {
  Calendar,
  DollarSign,
  MapPin,
  Clock,
  Compass,
  Utensils,
  Landmark,
  TreePine,
  Sparkles,
} from 'lucide-react';
import { format, addDays } from 'date-fns';

interface DayBlockProps {
  dayNumber: number;
  tripStartDate: string;
  activities: StopActivity[];
  sectionName?: string;
}

const categoryIcons: Record<Category, React.ElementType> = {
  ADVENTURE: Compass,
  FOOD: Utensils,
  CULTURE: Landmark,
  NATURE: TreePine,
  OTHER: Sparkles,
};

const categoryColors: Record<Category, { bg: string; text: string; border: string }> = {
  ADVENTURE: { bg: 'bg-[#FEF3EE]', text: 'text-[#FF6433]', border: 'border-[#FF6433]/20' },
  FOOD: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
  CULTURE: { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200' },
  NATURE: { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' },
  OTHER: { bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-200' },
};

export default function DayBlock({
  dayNumber,
  tripStartDate,
  activities,
  sectionName,
}: DayBlockProps) {
  const dayDate = addDays(new Date(tripStartDate), dayNumber - 1);
  const formattedDayDate = format(dayDate, 'EEEE, MMM d');
  const dayTotalExpense = activities.reduce((acc, a) => acc + (a.expense || 0), 0);

  return (
    <div className="relative flex gap-4 sm:gap-6">
      {/* Vertical Timeline Pin */}
      <div className="flex flex-col items-center">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#0F172A] font-black text-white shadow-md shadow-[#0F172A]/10 text-xs">
          D{dayNumber}
        </div>
        <div className="h-full w-0.5 bg-[#ECE6DE] my-2" />
      </div>

      {/* Day Content Card */}
      <div className="flex-1 pb-8">
        <div className="overflow-hidden rounded-3xl border border-[#ECE6DE] bg-white p-6 shadow-xs transition hover:shadow-md hover:border-slate-300">
          {/* Day Header */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-[#0F172A]">Day {dayNumber}</h3>
                <span className="text-xs text-slate-400 font-medium">· {formattedDayDate}</span>
              </div>
              {sectionName && (
                <p className="text-[11px] font-bold text-[#FF6433] mt-0.5">
                  Chapter: {sectionName}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#FEF3EE] px-3 py-1 text-xs font-extrabold text-[#FF6433] border border-[#FF6433]/20">
                <DollarSign className="h-3.5 w-3.5" />
                ${dayTotalExpense.toLocaleString()} spent
              </span>
            </div>
          </div>

          {/* Activities List */}
          <div className="mt-4 space-y-3">
            {activities.length > 0 ? (
              activities.map((stop) => {
                const category: Category = stop.activity?.category || 'OTHER';
                const Icon = categoryIcons[category] || Sparkles;
                const colors = categoryColors[category] || categoryColors.OTHER;

                return (
                  <div
                    key={stop.id}
                    className="flex flex-col gap-3 rounded-2xl border border-[#ECE6DE] bg-[#FAF8F5] p-4 sm:flex-row sm:items-center sm:justify-between hover:bg-white transition"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border ${colors.bg} ${colors.text} ${colors.border}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-extrabold text-[#0F172A]">
                            {stop.activity?.name || 'Custom Activity'}
                          </h4>
                          <span className={`rounded-full px-2 py-0.2 text-[10px] font-bold border ${colors.bg} ${colors.text} ${colors.border}`}>
                            {category}
                          </span>
                        </div>

                        {stop.activity?.city && (
                          <p className="text-[11px] text-slate-500 flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-slate-400" />
                            {stop.activity.city.name}, {stop.activity.city.country}
                          </p>
                        )}

                        {stop.notes && (
                          <p className="text-xs text-slate-600 italic mt-1 bg-white rounded-xl p-2 border border-[#ECE6DE]/80">
                            &ldquo;{stop.notes}&rdquo;
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-end sm:flex-col sm:items-end">
                      <span className="text-xs font-black text-slate-900 bg-white px-2.5 py-1 rounded-full border border-[#ECE6DE]">
                        ${stop.expense}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 italic py-2">
                No activities scheduled for Day {dayNumber}. Free exploration day!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
