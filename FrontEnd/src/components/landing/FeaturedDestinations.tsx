'use client';

import React from 'react';
import Link from 'next/link';
import { useCities } from '@/hooks/useCities';
import { mockCities } from '@/lib/mockData';
import { City } from '@/types';
import { MapPin, ArrowRight, Flame, Compass, Sparkles } from 'lucide-react';

export default function FeaturedDestinations() {
  const { data: apiCities, isLoading } = useCities();

  // Use API cities if available and non-empty, otherwise fallback to mockCities
  const displayCities: City[] = (apiCities && apiCities.length > 0) ? apiCities.slice(0, 6) : mockCities;

  return (
    <section id="destinations" className="py-16 lg:py-24 bg-white/60 border-y border-[#ECE6DE]/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#FF6433]/20 bg-[#FEF3EE] px-3.5 py-1 text-xs font-bold text-[#FF6433]">
              <Compass className="h-3.5 w-3.5" />
              <span>Trending Destinations</span>
            </div>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-[#0F172A] sm:text-4xl">
              Top Cities for Multi-Stop Trips
            </h2>
            <p className="mt-2 text-sm text-slate-600 max-w-2xl">
              Curated locations with rich cultural landmarks, outdoor adventures, and easy transit connections.
            </p>
          </div>

          <Link
            href="/cities"
            className="mt-4 md:mt-0 inline-flex items-center gap-2 rounded-full border border-[#ECE6DE] bg-white px-5 py-2.5 text-xs font-extrabold text-slate-700 shadow-xs transition hover:border-[#FF6433] hover:text-[#FF6433]"
          >
            <span>View All Destinations</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Loading Skeletons */}
        {isLoading && (!displayCities || displayCities.length === 0) ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse rounded-3xl border border-[#ECE6DE] bg-slate-100 h-80" />
            ))}
          </div>
        ) : (
          /* Cards Grid */
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {displayCities.map((city) => (
              <div
                key={city.id}
                className="group relative flex flex-col overflow-hidden rounded-3xl border border-[#ECE6DE] bg-white shadow-xs transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/5"
              >
                {/* Image & Overlay */}
                <div className="relative h-64 w-full overflow-hidden bg-slate-100">
                  <img
                    src={city.image || 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&auto=format&fit=crop&q=80'}
                    alt={city.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

                  {/* Popularity Badge */}
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 rounded-full bg-white/90 backdrop-blur-md px-3 py-1 text-[11px] font-bold text-[#0F172A] shadow-xs">
                    <Flame className="h-3.5 w-3.5 text-[#FF6433]" />
                    <span>{city.popularity || 90}% Popularity</span>
                  </div>

                  {/* Country Badge */}
                  <div className="absolute top-4 left-4 flex items-center gap-1 rounded-full bg-black/40 backdrop-blur-md px-3 py-1 text-[11px] font-bold text-white border border-white/20">
                    <MapPin className="h-3.5 w-3.5 text-[#FF6433]" />
                    <span>{city.country}</span>
                  </div>

                  {/* City Details inside Overlay */}
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="text-2xl font-black tracking-tight">{city.name}</h3>
                    <p className="text-xs text-slate-200 mt-1 flex items-center gap-1 font-medium">
                      <Sparkles className="h-3 w-3 text-amber-400" />
                      <span>{city._count?.activities || (city.activities?.length ?? 12)}+ Recommended Activities</span>
                    </p>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="flex items-center justify-between p-4 bg-white">
                  <div className="text-xs font-bold text-slate-500">
                    Ideal for 3-5 Day Stops
                  </div>
                  <Link
                    href={`/cities?search=${encodeURIComponent(city.name)}`}
                    className="flex items-center gap-1.5 rounded-full bg-[#FEF3EE] px-4 py-2 text-xs font-extrabold text-[#FF6433] transition hover:bg-[#FF6433] hover:text-white"
                  >
                    <span>Explore</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
