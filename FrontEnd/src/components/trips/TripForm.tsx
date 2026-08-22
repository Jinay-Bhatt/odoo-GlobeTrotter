'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useCreateTrip } from '@/hooks/useTrips';
import { mockCities, mockActivities } from '@/lib/mockData';
import toast from 'react-hot-toast';
import {
  Calendar,
  Image as ImageIcon,
  Compass,
  Sparkles,
  MapPin,
  ArrowRight,
  Tag,
  DollarSign,
  Info,
} from 'lucide-react';

const tripSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Trip name is required')
      .max(100, 'Trip name cannot exceed 100 characters'),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    description: z.string().optional(),
    coverPhoto: z.string().optional(),
  })
  .refine(
    (data) => {
      if (!data.startDate || !data.endDate) return true;
      return new Date(data.endDate) >= new Date(data.startDate);
    },
    {
      message: 'End date must be on or after the start date',
      path: ['endDate'],
    }
  );

type TripFormData = z.infer<typeof tripSchema>;

const PRESET_COVERS = [
  {
    label: 'Alpine Mountains',
    url: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=1200&auto=format&fit=crop&q=80',
  },
  {
    label: 'Tokyo City Lights',
    url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1200&auto=format&fit=crop&q=80',
  },
  {
    label: 'Santorini Coast',
    url: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1200&auto=format&fit=crop&q=80',
  },
  {
    label: 'Tropical Beach',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80',
  },
];

export default function TripForm() {
  const router = useRouter();
  const createTripMutation = useCreateTrip();
  const [selectedCover, setSelectedCover] = useState(PRESET_COVERS[0].url);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TripFormData>({
    resolver: zodResolver(tripSchema),
    defaultValues: {
      name: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      description: '',
      coverPhoto: PRESET_COVERS[0].url,
    },
  });

  const currentCover = watch('coverPhoto') || selectedCover;

  const handleSelectPresetCover = (url: string) => {
    setSelectedCover(url);
    setValue('coverPhoto', url);
  };

  const handleApplyCitySuggestion = (cityName: string, country: string, imageUrl?: string | null) => {
    const currentName = watch('name');
    if (!currentName) {
      setValue('name', `Trip to ${cityName}, ${country}`);
    }
    const currentDesc = watch('description');
    if (!currentDesc) {
      setValue('description', `Exploring the sights, culture, and highlights of ${cityName}, ${country}.`);
    }
    if (imageUrl) {
      handleSelectPresetCover(imageUrl);
    }
    toast.success(`Applied ${cityName} details to your trip!`);
  };

  const onSubmit = async (data: TripFormData) => {
    try {
      const startIso = new Date(data.startDate).toISOString();
      const endIso = new Date(data.endDate).toISOString();

      const newTrip = await createTripMutation.mutateAsync({
        name: data.name,
        startDate: startIso,
        endDate: endIso,
        description: data.description || undefined,
        coverPhoto: data.coverPhoto || selectedCover,
      });

      toast.success(`Trip "${newTrip.name}" created!`);
      router.push(`/trips/${newTrip.id}/itinerary`);
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to create trip';
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-10">
      <div className="rounded-3xl border border-[#ECE6DE] bg-white p-6 sm:p-10 shadow-sm">
        <div className="border-b border-slate-100 pb-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#FEF3EE] px-3.5 py-1 text-xs font-bold text-[#FF6433] mb-3">
            <Compass className="h-3.5 w-3.5" />
            Step 1 of 2: Overview & Destination
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0F172A]">
            Plan a New Journey
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Set up the destination, dates, and cover image. Next, you will build sections and day-by-day activities.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          {/* Trip Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
              Trip Title *
            </label>
            <div className="relative rounded-2xl shadow-xs">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <Compass className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                {...register('name')}
                placeholder="e.g. Summer in Tokyo & Kyoto, Swiss Alpine Hike"
                className={`block w-full rounded-2xl border py-3 pl-11 pr-4 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 ${
                  errors.name
                    ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100'
                    : 'border-[#ECE6DE] bg-[#FAF8F5] focus:bg-white focus:border-[#FF6433] focus:ring-[#FF6433]/15'
                }`}
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-xs text-rose-600 font-medium">{errors.name.message}</p>
            )}
          </div>

          {/* Dates (Start & End) */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                Start Date *
              </label>
              <div className="relative rounded-2xl shadow-xs">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Calendar className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="date"
                  {...register('startDate')}
                  className={`block w-full rounded-2xl border py-3 pl-11 pr-4 text-xs text-slate-900 focus:outline-none focus:ring-4 ${
                    errors.startDate
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100'
                      : 'border-[#ECE6DE] bg-[#FAF8F5] focus:bg-white focus:border-[#FF6433] focus:ring-[#FF6433]/15'
                  }`}
                />
              </div>
              {errors.startDate && (
                <p className="mt-1 text-xs text-rose-600 font-medium">{errors.startDate.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                End Date *
              </label>
              <div className="relative rounded-2xl shadow-xs">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Calendar className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="date"
                  {...register('endDate')}
                  className={`block w-full rounded-2xl border py-3 pl-11 pr-4 text-xs text-slate-900 focus:outline-none focus:ring-4 ${
                    errors.endDate
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100'
                      : 'border-[#ECE6DE] bg-[#FAF8F5] focus:bg-white focus:border-[#FF6433] focus:ring-[#FF6433]/15'
                  }`}
                />
              </div>
              {errors.endDate && (
                <p className="mt-1 text-xs text-rose-600 font-medium">{errors.endDate.message}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
              Trip Description & Notes
            </label>
            <textarea
              {...register('description')}
              rows={3}
              placeholder="What are the goals, packing lists, travel companions, or theme for this adventure?"
              className="block w-full rounded-2xl border border-[#ECE6DE] bg-[#FAF8F5] p-4 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#FF6433] focus:outline-none focus:ring-4 focus:ring-[#FF6433]/15"
            />
          </div>

          {/* Cover Photo Selection */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Cover Image Preset or URL
            </label>

            {/* Custom URL Input */}
            <div className="relative rounded-2xl shadow-xs">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <ImageIcon className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="url"
                {...register('coverPhoto')}
                placeholder="Paste custom image URL or select from presets..."
                className="block w-full rounded-2xl border border-[#ECE6DE] bg-[#FAF8F5] py-3 pl-11 pr-4 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#FF6433] focus:outline-none focus:ring-4 focus:ring-[#FF6433]/15"
              />
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4 pt-1">
              {PRESET_COVERS.map((preset) => {
                const isSelected = currentCover === preset.url;
                return (
                  <button
                    key={preset.url}
                    type="button"
                    onClick={() => handleSelectPresetCover(preset.url)}
                    className={`group relative h-24 overflow-hidden rounded-2xl border-2 transition ${
                      isSelected
                        ? 'border-[#FF6433] ring-4 ring-[#FF6433]/20 shadow-md'
                        : 'border-transparent hover:opacity-90'
                    }`}
                  >
                    <img
                      src={preset.url}
                      alt={preset.label}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-end p-2">
                      <span className="text-[10px] font-bold text-white drop-shadow">
                        {preset.label}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Submit Action */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-[#ECE6DE]">
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-full border border-[#ECE6DE] bg-[#FAF8F5] px-6 py-2.5 text-xs font-bold text-slate-700 hover:bg-white hover:border-slate-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-full bg-[#FF6433] px-7 py-3 text-xs font-bold text-white shadow-md shadow-[#FF6433]/25 hover:bg-[#E85324] focus:outline-none focus:ring-4 focus:ring-[#FF6433]/20 transition disabled:opacity-60"
            >
              {isSubmitting ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  Continue to Sections
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Suggestions for Places & Activities */}
      <div className="space-y-5">
        <div>
          <h3 className="text-xl font-black text-[#0F172A] flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#FF6433]" />
            Trending Destinations
          </h3>
          <p className="text-xs text-slate-500">
            Click any destination tile to auto-populate your trip title and description.
          </p>
        </div>

        {/* City Cards Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {mockCities.map((city) => (
            <div
              key={city.id}
              onClick={() => handleApplyCitySuggestion(city.name, city.country, city.image)}
              className="group relative cursor-pointer overflow-hidden rounded-3xl border border-[#ECE6DE] bg-white shadow-sm transition hover:shadow-xl hover:shadow-[#2D1B16]/5 hover:border-[#FF6433] duration-300"
            >
              <div className="relative h-40 w-full overflow-hidden bg-slate-100">
                {city.image && (
                  <img
                    src={city.image}
                    alt={city.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F17]/80 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <p className="text-lg font-black drop-shadow">{city.name}</p>
                  <p className="text-xs text-slate-300">{city.country}</p>
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#FF6433] bg-[#FEF3EE] px-2.5 py-0.5 rounded-full border border-[#FF6433]/20">
                    {city.popularity}% Popular
                  </span>
                  <span className="font-bold text-slate-700 group-hover:text-[#FF6433] flex items-center gap-1">
                    Select <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
