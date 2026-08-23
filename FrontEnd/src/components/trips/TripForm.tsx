'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useCreateTrip } from '@/hooks/useTrips';
import { mockCities } from '@/lib/mockData';
import { GooglePlaceSuggestion } from '@/types';
import NearbySuggestions from '@/components/trips/NearbySuggestions';
import toast from 'react-hot-toast';
import {
  Calendar,
  Image as ImageIcon,
  Compass,
  Sparkles,
  MapPin,
  ArrowRight,
  Check,
  Building2,
  Search,
} from 'lucide-react';

const tripSchema = z
  .object({
    destination: z.string().min(1, 'Destination is required'),
    name: z
      .string()
      .min(1, 'Trip title is required')
      .max(100, 'Trip title cannot exceed 100 characters'),
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

const POPULAR_DESTINATION_PILLS = [
  { name: 'Kyoto, Japan', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&auto=format&fit=crop&q=80' },
  { name: 'Tokyo, Japan', image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&auto=format&fit=crop&q=80' },
  { name: 'Interlaken, Switzerland', image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=800&auto=format&fit=crop&q=80' },
  { name: 'Santorini, Greece', image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&auto=format&fit=crop&q=80' },
  { name: 'Paris, France', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&auto=format&fit=crop&q=80' },
  { name: 'Rome, Italy', image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&auto=format&fit=crop&q=80' },
];

export default function TripForm() {
  const router = useRouter();
  const createTripMutation = useCreateTrip();
  const [selectedCover, setSelectedCover] = useState(PRESET_COVERS[0].url);
  const [selectedPlaces, setSelectedPlaces] = useState<GooglePlaceSuggestion[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TripFormData>({
    resolver: zodResolver(tripSchema),
    defaultValues: {
      destination: '',
      name: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      description: '',
      coverPhoto: PRESET_COVERS[0].url,
    },
  });

  const destinationValue = watch('destination');
  const currentCover = watch('coverPhoto') || selectedCover;

  const handleSelectPresetCover = (url: string) => {
    setSelectedCover(url);
    setValue('coverPhoto', url);
  };

  const handleSelectDestination = (destName: string, imageUrl?: string | null) => {
    setValue('destination', destName, { shouldValidate: true });
    setValue('name', `Trip to ${destName}`, { shouldValidate: true });
    if (!watch('description')) {
      setValue('description', `Exploring the sights, culture, and highlights of ${destName}.`);
    }
    if (imageUrl) {
      handleSelectPresetCover(imageUrl);
    }
    toast.success(`Selected ${destName}!`);
  };

  const handleTogglePlace = (place: GooglePlaceSuggestion) => {
    setSelectedPlaces((prev) => {
      const exists = prev.some((p) => p.id === place.id);
      if (exists) {
        toast('Removed from places to visit', { icon: '🗑️' });
        return prev.filter((p) => p.id !== place.id);
      } else {
        toast.success(`Added "${place.displayName}" to your plan!`);
        return [...prev, place];
      }
    });
  };

  const onSubmit = async (data: TripFormData) => {
    try {
      const startIso = new Date(data.startDate).toISOString();
      const endIso = new Date(data.endDate).toISOString();

      let finalDescription = data.description || '';
      if (selectedPlaces.length > 0) {
        const placesText =
          `\n\nPlanned Points of Interest (${selectedPlaces.length}):\n` +
          selectedPlaces
            .map((p) => `• ${p.displayName} (${p.formattedAddress || p.primaryType || 'Attraction'})`)
            .join('\n');
        finalDescription += placesText;
      }

      const newTrip = await createTripMutation.mutateAsync({
        name: data.name,
        startDate: startIso,
        endDate: endIso,
        description: finalDescription || undefined,
        coverPhoto: data.coverPhoto || selectedCover,
      });

      toast.success(`Journey "${newTrip.name}" created!`);
      router.push(`/trips/${newTrip.id}/itinerary`);
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to create trip';
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-10">
      {/* Trip Form Card */}
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
            Enter your destination to automatically surface local attractions, landmarks, and highlights.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          {/* Dynamic Destination Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
              Where are you traveling to? *
            </label>
            <div className="relative rounded-2xl shadow-xs">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <MapPin className="h-4 w-4 text-[#FF6433]" />
              </div>
              <input
                type="text"
                {...register('destination')}
                onChange={(e) => {
                  const val = e.target.value;
                  setValue('destination', val, { shouldValidate: true });
                  if (!watch('name') || watch('name').startsWith('Trip to ')) {
                    setValue('name', val ? `Trip to ${val}` : '');
                  }
                }}
                placeholder="e.g. Kyoto, Japan · Interlaken, Switzerland · Paris · Rome"
                className={`block w-full rounded-2xl border py-3 pl-11 pr-4 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 ${
                  errors.destination
                    ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100'
                    : 'border-[#ECE6DE] bg-[#FAF8F5] focus:bg-white focus:border-[#FF6433] focus:ring-[#FF6433]/15'
                }`}
              />
            </div>
            {errors.destination && (
              <p className="mt-1 text-xs text-rose-600 font-medium">{errors.destination.message}</p>
            )}

            {/* Quick-Pick Popular Destination Pills */}
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-400 mr-1">Popular:</span>
              {POPULAR_DESTINATION_PILLS.map((pill) => (
                <button
                  key={pill.name}
                  type="button"
                  onClick={() => handleSelectDestination(pill.name, pill.image)}
                  className={`rounded-full px-3 py-1 text-[11px] font-bold transition ${
                    destinationValue === pill.name
                      ? 'bg-[#FF6433] text-white shadow-xs'
                      : 'bg-[#FAF8F5] text-slate-600 border border-[#ECE6DE] hover:border-slate-300 hover:bg-white'
                  }`}
                >
                  {pill.name}
                </button>
              ))}
            </div>
          </div>

          {/* Trip Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
              Journey Title *
            </label>
            <div className="relative rounded-2xl shadow-xs">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <Compass className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                {...register('name')}
                placeholder="e.g. Summer Alpine Hike, Autumn Cultural Odyssey"
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
              Notes & Trip Goals
            </label>
            <textarea
              {...register('description')}
              rows={3}
              placeholder="What are your goals, travel companions, packing essentials, or highlights for this adventure?"
              className="block w-full rounded-2xl border border-[#ECE6DE] bg-[#FAF8F5] p-4 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#FF6433] focus:outline-none focus:ring-4 focus:ring-[#FF6433]/15"
            />
          </div>

          {/* Selected Places of Interest Summary */}
          {selectedPlaces.length > 0 && (
            <div className="rounded-2xl border border-[#FF6433]/30 bg-[#FEF3EE] p-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-[#FF6433] flex items-center gap-1.5">
                  <Building2 className="h-4 w-4" />
                  Selected Points of Interest ({selectedPlaces.length})
                </p>
                <button
                  type="button"
                  onClick={() => setSelectedPlaces([])}
                  className="text-[11px] font-semibold text-[#FF6433] hover:underline"
                >
                  Clear All
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selectedPlaces.map((p) => (
                  <span
                    key={p.id}
                    className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[11px] font-bold text-slate-800 border border-[#ECE6DE] shadow-xs"
                  >
                    <Check className="h-3 w-3 text-emerald-600" />
                    {p.displayName}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Cover Photo Selection */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Cover Image Preset or Custom URL
            </label>

            <div className="relative rounded-2xl shadow-xs">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <ImageIcon className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="url"
                {...register('coverPhoto')}
                placeholder="Paste custom image URL or select from presets below..."
                className="block w-full rounded-2xl border border-[#ECE6DE] bg-[#FAF8F5] py-3 pl-11 pr-4 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#FF6433] focus:outline-none focus:ring-4 focus:ring-[#FF6433]/15"
              />
            </div>

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
                  Continue to Itinerary Sections
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Dynamic Nearby Places of Interest Section */}
      {destinationValue && destinationValue.trim().length > 1 && (
        <NearbySuggestions
          destination={destinationValue}
          selectedPlaces={selectedPlaces}
          onTogglePlace={handleTogglePlace}
        />
      )}

      {/* Top Regional Selections */}
      <div className="space-y-5">
        <div>
          <h3 className="text-xl font-black text-[#0F172A] flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#FF6433]" />
            Trending Destinations
          </h3>
          <p className="text-xs text-slate-500">
            Click any destination tile to auto-fill your trip and trigger live points of interest.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {mockCities.map((city) => (
            <div
              key={city.id}
              onClick={() => handleSelectDestination(`${city.name}, ${city.country}`, city.image)}
              className={`group relative cursor-pointer overflow-hidden rounded-3xl border transition duration-300 ${
                destinationValue && destinationValue.includes(city.name)
                  ? 'border-[#FF6433] shadow-lg shadow-[#FF6433]/15'
                  : 'border-[#ECE6DE] bg-white shadow-sm hover:shadow-xl hover:shadow-[#2D1B16]/5 hover:border-[#FF6433]'
              }`}
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
                    {destinationValue && destinationValue.includes(city.name) ? 'Selected' : 'Select'} <ArrowRight className="h-3.5 w-3.5" />
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
