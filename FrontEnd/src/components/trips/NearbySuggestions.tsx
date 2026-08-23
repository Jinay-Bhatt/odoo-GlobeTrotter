'use client';

import React, { useState, useEffect } from 'react';
import { GooglePlaceSuggestion } from '@/types';
import { fetchNearbySuggestions } from '@/services/nearbyPlaces';
import {
  MapPin,
  Star,
  Plus,
  Check,
  Compass,
  ExternalLink,
  Sparkles,
  Loader2,
  Landmark,
  Utensils,
  Coffee,
  ShoppingBag,
  Building,
} from 'lucide-react';

interface NearbySuggestionsProps {
  destination: string;
  selectedPlaces: GooglePlaceSuggestion[];
  onTogglePlace: (place: GooglePlaceSuggestion) => void;
}

function formatPlaceType(type?: string): string {
  if (!type) return 'Attraction';
  return type
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function getCategoryIcon(type?: string) {
  const t = (type || '').toLowerCase();
  if (t.includes('restaurant') || t.includes('food')) return Utensils;
  if (t.includes('cafe') || t.includes('coffee')) return Coffee;
  if (t.includes('store') || t.includes('market') || t.includes('shopping')) return ShoppingBag;
  if (t.includes('worship') || t.includes('temple') || t.includes('church') || t.includes('shrine')) return Landmark;
  if (t.includes('museum') || t.includes('art')) return Building;
  return Compass;
}

export default function NearbySuggestions({
  destination,
  selectedPlaces,
  onTogglePlace,
}: NearbySuggestionsProps) {
  const [places, setPlaces] = useState<GooglePlaceSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!destination.trim()) {
      setPlaces([]);
      setError(null);
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    const timer = setTimeout(async () => {
      try {
        const response = await fetchNearbySuggestions(destination, controller.signal);

        if (response.error && (!response.places || response.places.length === 0)) {
          setError(response.error);
          setPlaces([]);
        } else {
          setPlaces(response.places || []);
          setError(null);
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          setError(err.message || 'An unexpected error occurred');
          setPlaces([]);
        }
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [destination]);

  if (!destination.trim()) {
    return null;
  }

  const isPlaceSelected = (id: string) => selectedPlaces.some((p) => p.id === id);

  return (
    <div className="space-y-5 rounded-3xl border border-[#ECE6DE] bg-white p-6 sm:p-8 shadow-sm">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FEF3EE] text-[#FF6433]">
              <Sparkles className="h-4 w-4" />
            </span>
            <h3 className="text-lg font-black text-[#0F172A]">
              Suggested Points of Interest in &ldquo;{destination}&rdquo;
            </h3>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Select real attractions, landmarks, and highlights to add directly into your journey plan.
          </p>
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto text-[11px] font-semibold text-slate-400">
          <span>Powered by</span>
          <span className="font-bold text-slate-700">Google Places</span>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-10">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-7 w-7 animate-spin text-[#FF6433]" />
            <p className="text-xs font-semibold text-slate-500">
              Finding real highlights for {destination}...
            </p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && places.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[#ECE6DE] bg-[#FAF8F5] p-8 text-center">
          <Compass className="h-8 w-8 text-slate-400 mx-auto mb-2" />
          <p className="text-xs font-bold text-slate-700">
            No specific attractions found for &ldquo;{destination}&rdquo;
          </p>
          <p className="mt-1 text-[11px] text-slate-400">
            Try entering a city name or country to surface local points of interest.
          </p>
        </div>
      )}

      {/* Suggestions Grid */}
      {!isLoading && places.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 pt-1">
          {places.map((place) => {
            const isAdded = isPlaceSelected(place.id);
            const Icon = getCategoryIcon(place.primaryType || place.types?.[0]);

            return (
              <div
                key={place.id}
                className={`group flex flex-col justify-between overflow-hidden rounded-2xl border transition duration-200 ${
                  isAdded
                    ? 'border-[#FF6433] bg-[#FEF3EE]/40 shadow-xs'
                    : 'border-[#ECE6DE] bg-[#FAF8F5] hover:border-slate-300 hover:bg-white hover:shadow-md'
                }`}
              >
                {/* Photo or Category Header */}
                <div className="relative h-32 w-full overflow-hidden bg-slate-200">
                  {place.photoUrl ? (
                    <img
                      src={place.photoUrl}
                      alt={place.displayName}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400">
                      <Icon className="h-8 w-8" />
                    </div>
                  )}

                  {/* Category Pill Tag */}
                  <div className="absolute top-2.5 left-2.5">
                    <span className="rounded-full bg-black/60 px-2.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-md">
                      {formatPlaceType(place.primaryType || place.types?.[0])}
                    </span>
                  </div>

                  {/* Google Maps Link if available */}
                  {place.googleMapsUri && (
                    <a
                      href={place.googleMapsUri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute top-2.5 right-2.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition hover:bg-black/80"
                      title="View on Google Maps"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>

                {/* Place Details */}
                <div className="flex flex-1 flex-col justify-between p-4 space-y-3">
                  <div className="space-y-1">
                    <h4 className="text-xs sm:text-sm font-extrabold text-[#0F172A] line-clamp-1">
                      {place.displayName}
                    </h4>

                    {/* Rating */}
                    {typeof place.rating === 'number' && (
                      <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600">
                        <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                        <span>{place.rating.toFixed(1)}</span>
                        {typeof place.userRatingCount === 'number' && (
                          <span className="text-[10px] text-slate-400 font-normal">
                            ({place.userRatingCount.toLocaleString()})
                          </span>
                        )}
                      </div>
                    )}

                    {/* Address */}
                    {place.formattedAddress && (
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed flex items-start gap-1">
                        <MapPin className="h-3 w-3 shrink-0 text-slate-400 mt-0.5" />
                        <span>{place.formattedAddress}</span>
                      </p>
                    )}
                  </div>

                  {/* Add to Trip Action Button */}
                  <button
                    type="button"
                    onClick={() => onTogglePlace(place)}
                    className={`flex w-full items-center justify-center gap-1.5 rounded-full py-2 text-xs font-bold transition ${
                      isAdded
                        ? 'bg-[#0F172A] text-white shadow-xs'
                        : 'bg-white border border-[#ECE6DE] text-[#0F172A] hover:bg-[#FF6433] hover:text-white hover:border-[#FF6433]'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        Added to Plan
                      </>
                    ) : (
                      <>
                        <Plus className="h-3.5 w-3.5" />
                        Add to Trip
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
