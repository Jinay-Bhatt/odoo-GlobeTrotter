'use client';

import React, { useState, useMemo } from 'react';
import { useCities, useActivities } from '@/hooks/useCities';
import { Category, City, Activity } from '@/types';
import { Compass, Search, MapPin, Star, DollarSign, Filter, X, Loader2, Sparkles } from 'lucide-react';

const CATEGORIES: { label: string; value: Category | 'ALL' }[] = [
  { label: 'All Categories', value: 'ALL' },
  { label: 'Adventure', value: 'ADVENTURE' },
  { label: 'Culture', value: 'CULTURE' },
  { label: 'Food & Dining', value: 'FOOD' },
  { label: 'Nature', value: 'NATURE' },
  { label: 'Other', value: 'OTHER' },
];

export default function CityExplorer() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'ALL'>('ALL');
  const [selectedCity, setSelectedCity] = useState<City | null>(null);

  const { data: cities, isLoading: loadingCities } = useCities(searchTerm);
  const { data: allActivities, isLoading: loadingAllActivities } = useActivities(
    undefined,
    selectedCategory === 'ALL' ? undefined : selectedCategory
  );
  const { data: cityActivities, isLoading: loadingCityActivities } = useActivities(
    selectedCity?.id,
    selectedCategory === 'ALL' ? undefined : selectedCategory
  );

  // Filter cities by search term and selected category
  const filteredCities = useMemo(() => {
    if (!cities) return [];
    let list = cities;

    if (selectedCategory !== 'ALL' && allActivities) {
      const cityIdsWithCategory = new Set(allActivities.map((a) => a.cityId));
      list = list.filter((c) => cityIdsWithCategory.has(c.id));
    }

    return list;
  }, [cities, selectedCategory, allActivities]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header & Search Bar */}
      <div className="rounded-3xl border border-[#ECE6DE] bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-[#FF6433] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="h-4 w-4" />
              Destinations & Activities Catalog
            </div>
            <h1 className="mt-1 text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Explore Top Travel Cities
            </h1>
            <p className="mt-1 text-xs sm:text-sm font-semibold text-slate-500">
              Browse popular destinations, recommended stop activities, and estimated costs worldwide.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by city or country..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-full border border-slate-200 bg-[#FAF8F5] pl-10 pr-4 py-2.5 text-xs font-bold text-slate-800 placeholder-slate-400 focus:border-[#FF6433] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6433]/20"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Category Badges */}
        <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1 mr-2">
            <Filter className="h-3.5 w-3.5" />
            Categories:
          </span>
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                  isActive
                    ? 'bg-[#FF6433] text-white shadow-xs'
                    : 'bg-[#FAF8F5] text-slate-600 border border-[#ECE6DE] hover:bg-white hover:text-slate-900'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Cities Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-slate-900">
            {selectedCategory === 'ALL' ? 'Popular Destinations' : `${selectedCategory} Destinations`}
          </h2>
          <span className="text-xs font-bold text-slate-400">
            Showing {filteredCities.length} Cities
          </span>
        </div>

        {loadingCities || loadingAllActivities ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin text-[#FF6433]" />
            <p className="mt-2 text-xs font-bold">Discovering destinations...</p>
          </div>
        ) : filteredCities && filteredCities.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCities.map((city: City) => (

              <div
                key={city.id}
                onClick={() => setSelectedCity(city)}
                className="group cursor-pointer overflow-hidden rounded-3xl border border-[#ECE6DE] bg-white shadow-xs transition hover:-translate-y-1 hover:shadow-xl"
              >
                {/* City Cover Image */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                  <img
                    src={
                      city.image ||
                      'https://images.unsplash.com/photo-1477959858617-67f30ac4ce78?w=800&auto=format&fit=crop&q=80'
                    }
                    alt={city.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/20 to-transparent" />
                  
                  <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold text-amber-600 backdrop-blur-xs shadow-xs">
                    <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                    Popularity {city.popularity}
                  </div>

                  <div className="absolute bottom-3 left-4 right-4">
                    <h3 className="text-xl font-black text-white">{city.name}</h3>
                    <p className="text-xs font-semibold text-slate-200 flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-[#FF6433]" />
                      {city.country}
                    </p>
                  </div>
                </div>

                {/* City Card Footer */}
                <div className="flex items-center justify-between p-4 bg-white">
                  <span className="text-xs font-bold text-slate-500">
                    {city._count?.activities || city.activities?.length || 0} Listed Activities
                  </span>
                  <span className="text-xs font-bold text-[#FF6433] group-hover:underline">
                    View Activities &rarr;
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-[#FAF8F5] py-16 text-center">
            <Compass className="mx-auto h-10 w-10 text-slate-300" />
            <h3 className="mt-3 text-base font-bold text-slate-700">No destinations found</h3>
            <p className="mt-1 text-xs font-medium text-slate-400">
              Try adjusting your search criteria or category filter.
            </p>
          </div>
        )}
      </div>

      {/* Filtered Activities Direct View */}
      {selectedCategory !== 'ALL' && allActivities && allActivities.length > 0 && (
        <div className="rounded-3xl border border-[#ECE6DE] bg-white p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-900">
              {selectedCategory} Activities Across Destinations
            </h3>
            <span className="text-xs font-bold text-slate-400">
              {allActivities.length} Activities Found
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allActivities.map((act) => (
              <div
                key={act.id}
                className="flex items-center justify-between rounded-2xl border border-[#ECE6DE] bg-[#FAF8F5] p-4 transition hover:bg-white hover:shadow-xs"
              >
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{act.name}</h4>
                  <p className="text-xs font-medium text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3 text-[#FF6433]" />
                    {act.city?.name || 'Destination'}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-sm font-black text-slate-900 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl border border-emerald-200">
                  <DollarSign className="h-4 w-4 text-emerald-600" />
                  {act.estimatedCost}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected City Detail Modal */}
      {selectedCity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-[#ECE6DE] bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="relative h-44 w-full bg-slate-900">
              <img
                src={
                  selectedCity.image ||
                  'https://images.unsplash.com/photo-1477959858617-67f30ac4ce78?w=800&auto=format&fit=crop&q=80'
                }
                alt={selectedCity.name}
                className="h-full w-full object-cover opacity-60"
              />
              <button
                onClick={() => setSelectedCity(null)}
                className="absolute right-4 top-4 rounded-full bg-slate-900/70 p-2 text-white hover:bg-slate-900 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="absolute bottom-4 left-6">
                <h2 className="text-2xl font-black text-white">{selectedCity.name}</h2>
                <p className="text-xs font-bold text-slate-200 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-[#FF6433]" />
                  {selectedCity.country}
                </p>
              </div>
            </div>

            {/* Activities Body */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">
                Recommended Activities & Experiences
              </h3>

              {loadingCityActivities ? (
                <div className="flex items-center justify-center py-10 text-slate-400">
                  <Loader2 className="h-6 w-6 animate-spin text-[#FF6433]" />
                </div>
              ) : cityActivities && cityActivities.length > 0 ? (
                <div className="space-y-3">
                  {cityActivities.map((act) => (
                    <div
                      key={act.id}
                      className="flex items-center justify-between rounded-2xl border border-[#ECE6DE] bg-[#FAF8F5] p-4 transition hover:bg-white hover:border-slate-300"
                    >
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{act.name}</h4>
                        <span className="mt-1 inline-block rounded-full bg-[#FEF3EE] px-2.5 py-0.5 text-[10px] font-bold text-[#FF6433]">
                          {act.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-sm font-black text-slate-900">
                        <DollarSign className="h-4 w-4 text-emerald-500" />
                        {act.estimatedCost}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-8 text-center text-xs font-bold text-slate-400">
                  No activities listed for this category yet.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

