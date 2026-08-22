'use client';

import React, { useMemo, useState } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addDays } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import { useRouter } from 'next/navigation';
import { Trip, TripStatus } from '@/types';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Calendar as CalendarIcon, MapPin, Layers, Plus, ChevronLeft, ChevronRight } from 'lucide-react';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface TripCalendarProps {
  trips: Trip[];
}

export interface CalendarEvent {
  id: string;
  tripId: string;
  title: string;
  start: Date;
  end: Date;
  type: 'TRIP' | 'SECTION';
  status: TripStatus;
  allDay: boolean;
  budget?: number;
}

export default function TripCalendar({ trips }: TripCalendarProps) {
  const router = useRouter();
  const [filterType, setFilterType] = useState<'ALL' | 'TRIPS' | 'SECTIONS'>('ALL');
  const [view, setView] = useState<any>(Views.MONTH);

  // Auto-set initial date to the earliest upcoming/ongoing trip's start date if available
  const initialDate = useMemo(() => {
    if (trips && trips.length > 0) {
      const sorted = [...trips].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
      return new Date(sorted[0].startDate);
    }
    return new Date();
  }, [trips]);

  const [date, setDate] = useState<Date>(initialDate);

  const events: CalendarEvent[] = useMemo(() => {
    const list: CalendarEvent[] = [];

    trips.forEach((trip) => {
      // 1. Trip Main Event
      if (filterType === 'ALL' || filterType === 'TRIPS') {
        const tripStart = new Date(trip.startDate);
        const tripEnd = new Date(trip.endDate);
        // Add 1 day to end date so react-big-calendar includes the full end day
        const adjustedEnd = addDays(tripEnd, 1);

        list.push({
          id: `trip-${trip.id}`,
          tripId: trip.id,
          title: `✈️ ${trip.name} ($${trip.totalBudget || 0})`,
          start: tripStart,
          end: adjustedEnd,
          type: 'TRIP',
          status: trip.status,
          allDay: true,
          budget: trip.totalBudget,
        });
      }

      // 2. Trip Sections (Legs / Destinations)
      if ((filterType === 'ALL' || filterType === 'SECTIONS') && trip.sections) {
        trip.sections.forEach((sec) => {
          const secStart = new Date(sec.sectionStart);
          const secEnd = new Date(sec.sectionEnd);
          const adjustedSecEnd = addDays(secEnd, 1);

          list.push({
            id: `sec-${sec.id}`,
            tripId: trip.id,
            title: `📍 ${sec.name} ($${sec.budget || 0})`,
            start: secStart,
            end: adjustedSecEnd,
            type: 'SECTION',
            status: trip.status,
            allDay: true,
            budget: sec.budget,
          });
        });
      }
    });

    return list;
  }, [trips, filterType]);

  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = '#0F172A'; // deep slate for upcoming
    let borderColor = 'transparent';

    if (event.type === 'TRIP') {
      if (event.status === 'ONGOING') backgroundColor = '#FF6433'; // coral
      if (event.status === 'COMPLETED') backgroundColor = '#64748B'; // muted slate
    } else {
      // SECTION style: indigo/violet badge
      backgroundColor = '#4F46E5';
    }

    return {
      style: {
        backgroundColor,
        borderColor,
        borderRadius: '8px',
        opacity: 0.95,
        color: '#FFFFFF',
        display: 'block',
        fontSize: '11px',
        fontWeight: '700',
        padding: '3px 8px',
        cursor: 'pointer',
        boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
      },
    };
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    router.push(`/trips/${event.tripId}`);
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex flex-col gap-4 rounded-3xl border border-[#ECE6DE] bg-white p-6 sm:p-8 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FF6433]">
            <CalendarIcon className="h-4 w-4" />
            <span>Interactive Travel Schedule</span>
          </div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
            Travel Calendar
          </h1>
          <p className="mt-1 text-xs sm:text-sm font-semibold text-slate-500">
            Visualize your travel dates, itinerary sections, and budgets on a single master calendar.
          </p>
        </div>

        {/* Action Controls & Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center rounded-2xl bg-[#FAF8F5] p-1 border border-[#ECE6DE]">
            <button
              onClick={() => setFilterType('ALL')}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                filterType === 'ALL' ? 'bg-[#FF6433] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Events
            </button>
            <button
              onClick={() => setFilterType('TRIPS')}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                filterType === 'TRIPS' ? 'bg-[#FF6433] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Trips Only
            </button>
            <button
              onClick={() => setFilterType('SECTIONS')}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                filterType === 'SECTIONS' ? 'bg-[#FF6433] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Itinerary Legs
            </button>
          </div>

          <button
            onClick={() => router.push('/trips/new')}
            className="flex items-center gap-1.5 rounded-full bg-[#FF6433] px-4 py-2 text-xs font-bold text-white shadow-md shadow-[#FF6433]/25 hover:bg-[#E85324] transition"
          >
            <Plus className="h-4 w-4" />
            New Trip
          </button>
        </div>
      </div>

      {/* Legend Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#ECE6DE] bg-white px-6 py-3.5 shadow-2xs text-xs">
        <span className="font-bold text-slate-500 uppercase tracking-wider text-[11px]">Event Types:</span>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#FF6433]" />
            <span className="font-semibold text-slate-700">Ongoing Trip</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#0F172A]" />
            <span className="font-semibold text-slate-700">Upcoming Trip</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#4F46E5]" />
            <span className="font-semibold text-slate-700">Itinerary Leg (Section)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#64748B]" />
            <span className="font-semibold text-slate-700">Completed Trip</span>
          </div>
        </div>
      </div>

      {/* Big Calendar Wrapper */}
      <div className="rounded-3xl border border-[#ECE6DE] bg-white p-6 sm:p-8 shadow-sm">
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FEF3EE] text-[#FF6433] mb-4">
              <CalendarIcon className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No Scheduled Trips Found</h3>
            <p className="mt-1 text-xs text-slate-500 max-w-sm">
              Create a trip to start mapping your travel dates, sections, and activities on the calendar.
            </p>
            <button
              onClick={() => router.push('/trips/new')}
              className="mt-4 rounded-full bg-[#FF6433] px-6 py-2 text-xs font-bold text-white shadow-md shadow-[#FF6433]/30 hover:bg-[#E85324] transition"
            >
              + Create Your First Trip
            </button>
          </div>
        ) : (
          <div className="h-[680px]">
            <BigCalendar
              localizer={localizer}
              events={events}
              date={date}
              onNavigate={(newDate) => setDate(newDate)}
              view={view}
              onView={(newView) => setView(newView)}
              startAccessor="start"
              endAccessor="end"
              eventPropGetter={eventStyleGetter}
              onSelectEvent={handleSelectEvent}
              views={[Views.MONTH, Views.WEEK, Views.AGENDA]}
              popup
            />
          </div>
        )}
      </div>
    </div>
  );
}


