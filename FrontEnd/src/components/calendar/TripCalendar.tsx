'use client';

import React, { useMemo } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import { useRouter } from 'next/navigation';
import { Trip, TripStatus } from '@/types';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Calendar as CalendarIcon } from 'lucide-react';

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

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  status: TripStatus;
  allDay: boolean;
}

export default function TripCalendar({ trips }: TripCalendarProps) {
  const router = useRouter();

  const events: CalendarEvent[] = useMemo(() => {
    return trips.map((trip) => ({
      id: trip.id,
      title: `${trip.name} ($${trip.totalBudget || 0})`,
      start: new Date(trip.startDate),
      end: new Date(trip.endDate),
      status: trip.status,
      allDay: true,
    }));
  }, [trips]);

  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = '#0F172A'; // deep charcoal for upcoming
    if (event.status === 'ONGOING') backgroundColor = '#FF6433'; // terracotta coral
    if (event.status === 'COMPLETED') backgroundColor = '#64748B'; // slate

    return {
      style: {
        backgroundColor,
        borderRadius: '9999px',
        opacity: 0.95,
        color: 'white',
        border: 'none',
        display: 'block',
        fontSize: '11px',
        fontWeight: '700',
        padding: '2px 10px',
      },
    };
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    router.push(`/trips/${event.id}`);
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex flex-col gap-4 rounded-3xl border border-[#ECE6DE] bg-white p-6 sm:p-8 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#FF6433]">
            <CalendarIcon className="h-4 w-4" />
            <span>Master Travel Calendar</span>
          </div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-black text-[#0F172A]">Travel Schedule</h1>
          <p className="mt-1 text-xs text-slate-500">
            Visualize your travel timeline across months and seasons. Click any journey to view its itinerary.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 rounded-full bg-[#FAF8F5] px-3.5 py-1 text-xs border border-[#ECE6DE]">
            <div className="h-2.5 w-2.5 rounded-full bg-[#FF6433]" />
            <span className="font-bold text-slate-700">Ongoing</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-[#FAF8F5] px-3.5 py-1 text-xs border border-[#ECE6DE]">
            <div className="h-2.5 w-2.5 rounded-full bg-[#0F172A]" />
            <span className="font-bold text-slate-700">Upcoming</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-[#FAF8F5] px-3.5 py-1 text-xs border border-[#ECE6DE]">
            <div className="h-2.5 w-2.5 rounded-full bg-slate-500" />
            <span className="font-bold text-slate-700">Completed</span>
          </div>
        </div>
      </div>

      {/* Big Calendar Wrapper */}
      <div className="rounded-3xl border border-[#ECE6DE] bg-white p-6 sm:p-8 shadow-sm">
        <div className="h-[650px]">
          <BigCalendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            eventPropGetter={eventStyleGetter}
            onSelectEvent={handleSelectEvent}
            defaultView={Views.MONTH}
            views={[Views.MONTH, Views.WEEK, Views.AGENDA]}
            popup
          />
        </div>
      </div>
    </div>
  );
}
