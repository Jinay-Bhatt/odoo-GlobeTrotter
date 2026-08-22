'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Search, Calendar, Compass, DollarSign, ArrowRight } from 'lucide-react';

export default function QuickSearch() {
  const router = useRouter();
  const [destination, setDestination] = useState('');
  const [category, setCategory] = useState('');
  const [budget, setBudget] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (destination.trim()) {
      router.push(`/cities?search=${encodeURIComponent(destination.trim())}`);
    } else {
      router.push('/cities');
    }
  };

  return (
    <section className="relative z-20 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-10 mb-16">
      <div className="rounded-3xl border border-[#ECE6DE] bg-white p-4 sm:p-6 shadow-xl shadow-slate-900/5 backdrop-blur-xl">
        
        <form onSubmit={handleSearch} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12 lg:items-center">
          
          {/* Destination Field */}
          <div className="flex items-center gap-3 rounded-2xl bg-[#FAF8F5] p-3 border border-[#ECE6DE]/80 lg:col-span-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#FF6433] shadow-xs">
              <MapPin className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <label htmlFor="landing-dest" className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Where to?
              </label>
              <input
                id="landing-dest"
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Tokyo, Kyoto, Interlaken..."
                className="w-full bg-transparent text-xs font-bold text-[#0F172A] placeholder-slate-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Travel Category Field */}
          <div className="flex items-center gap-3 rounded-2xl bg-[#FAF8F5] p-3 border border-[#ECE6DE]/80 lg:col-span-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#FF6433] shadow-xs">
              <Compass className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <label htmlFor="landing-cat" className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Experience Type
              </label>
              <select
                id="landing-cat"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-transparent text-xs font-bold text-[#0F172A] focus:outline-none cursor-pointer"
              >
                <option value="">All Categories</option>
                <option value="CULTURE">Culture & History</option>
                <option value="ADVENTURE">Adventure & Nature</option>
                <option value="FOOD">Food & Culinary</option>
                <option value="NATURE">Nature & Hiking</option>
              </select>
            </div>
          </div>

          {/* Budget Range Field */}
          <div className="flex items-center gap-3 rounded-2xl bg-[#FAF8F5] p-3 border border-[#ECE6DE]/80 lg:col-span-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-xs">
              <DollarSign className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <label htmlFor="landing-budget" className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Target Budget
              </label>
              <select
                id="landing-budget"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full bg-transparent text-xs font-bold text-[#0F172A] focus:outline-none cursor-pointer"
              >
                <option value="">Any Budget</option>
                <option value="budget">Economy (&lt; $800)</option>
                <option value="moderate">Moderate ($800 - $2,000)</option>
                <option value="luxury">Luxury (&gt; $2,000)</option>
              </select>
            </div>
          </div>

          {/* Search CTA Button */}
          <div className="lg:col-span-2">
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0F172A] py-4 text-xs font-extrabold text-white shadow-md transition hover:bg-[#2D1B16] hover:scale-[1.02] active:scale-[0.98]"
            >
              <Search className="h-4 w-4 text-[#FF6433]" />
              <span>Search</span>
            </button>
          </div>

        </form>

      </div>
    </section>
  );
}
