'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Compass, ArrowRight, MapPin, Calendar, DollarSign, Sparkles, Star } from 'lucide-react';

export default function Hero() {
  const { isAuthenticated } = useAuth();
  const ctaHref = isAuthenticated ? '/trips/new' : '/register';

  return (
    <section className="relative overflow-hidden pt-8 pb-16 lg:pt-12 lg:pb-24">
      {/* Background Decorative Gradients */}
      <div className="pointer-events-none absolute -top-24 right-0 -z-10 h-[500px] w-[500px] rounded-full bg-[#FF6433]/10 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 -left-24 -z-10 h-[400px] w-[400px] rounded-full bg-[#FEF3EE] blur-2xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
          
          {/* Left Column: Text & CTA */}
          <div className="flex flex-col items-start lg:col-span-6">
            
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#FF6433]/20 bg-[#FEF3EE] px-4 py-1.5 text-xs font-bold text-[#FF6433] shadow-xs">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Next-Gen Multi-City Itinerary Planner</span>
            </div>

            {/* Title */}
            <h1 className="mt-6 text-4xl font-black tracking-tight text-[#0F172A] sm:text-5xl lg:text-6xl lg:leading-[1.15]">
              Master your multi-city journeys <br className="hidden sm:inline" />
              <span className="text-[#FF6433]">without the chaos</span>
            </h1>

            {/* Description */}
            <p className="mt-5 text-base text-slate-600 sm:text-lg leading-relaxed max-w-xl">
              Connect multiple destinations into one seamless route. Organize day-by-day activities, track real-time budgets, and share your adventures with a global community.
            </p>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-4 w-full sm:w-auto">
              <Link
                href={ctaHref}
                className="flex items-center justify-center gap-2 rounded-full bg-[#FF6433] px-7 py-3.5 text-sm font-extrabold text-white shadow-md shadow-[#FF6433]/30 transition hover:bg-[#E85324] hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto"
              >
                <span>{isAuthenticated ? 'Create New Trip' : 'Start Planning Free'}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <a
                href="#destinations"
                className="flex items-center justify-center gap-2 rounded-full border border-[#ECE6DE] bg-white px-7 py-3.5 text-sm font-extrabold text-slate-700 shadow-xs transition hover:border-slate-300 hover:bg-[#FAF8F5] hover:text-slate-900 w-full sm:w-auto"
              >
                <Compass className="h-4 w-4 text-[#FF6433]" />
                <span>Explore Cities</span>
              </a>
            </div>

            {/* Trust Indicators */}
            <div className="mt-10 flex items-center gap-6 border-t border-[#ECE6DE]/80 pt-6">
              <div className="flex -space-x-2 overflow-hidden">
                <img
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                  alt="Traveler 1"
                />
                <img
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                  alt="Traveler 2"
                />
                <img
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80"
                  alt="Traveler 3"
                />
              </div>
              <div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="ml-1 text-xs font-bold text-[#0F172A]">4.9 / 5.0</span>
                </div>
                <p className="text-xs text-slate-500 font-medium">Joined by 10,000+ active travelers</p>
              </div>
            </div>

          </div>

          {/* Right Column: Hero Visual Graphic / Card Showcase */}
          <div className="relative flex justify-center lg:col-span-6">
            <div className="relative w-full max-w-lg">
              
              {/* Main Card Graphic */}
              <div className="overflow-hidden rounded-3xl border border-[#ECE6DE] bg-white p-3 shadow-xl shadow-slate-900/5">
                <div className="relative h-72 w-full overflow-hidden rounded-2xl sm:h-80">
                  <img
                    src="https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1000&auto=format&fit=crop&q=80"
                    alt="Multi-City Expedition"
                    className="h-full w-full object-cover transition duration-500 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  
                  {/* Badge on main image */}
                  <div className="absolute top-4 left-4 flex items-center gap-2 rounded-full bg-white/90 backdrop-blur-md px-3 py-1.5 text-xs font-bold text-[#0F172A]">
                    <MapPin className="h-3.5 w-3.5 text-[#FF6433]" />
                    <span>3 Stops Expedition</span>
                  </div>

                  {/* Text inside image */}
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#FF6433]">Featured Itinerary</p>
                    <h3 className="text-xl font-black">Grand Japan & Alpine Circuit</h3>
                    <p className="text-xs text-slate-200 mt-1 flex items-center gap-2">
                      <span>Tokyo</span> • <span>Kyoto</span> • <span>Interlaken</span>
                    </p>
                  </div>
                </div>

                {/* Card Details Footer */}
                <div className="mt-3 flex items-center justify-between px-3 py-2 text-xs font-bold text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-[#FF6433]" />
                    <span>14 Days Total</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="h-4 w-4 text-emerald-600" />
                    <span>$2,200 Budget</span>
                  </div>
                  <div className="rounded-full bg-[#FEF3EE] px-2.5 py-1 text-[11px] font-extrabold text-[#FF6433]">
                    Multi-City
                  </div>
                </div>
              </div>

              {/* Floating Info Badge 1: Top Right */}
              <div className="absolute -top-6 -right-4 sm:-right-6 rounded-2xl border border-[#ECE6DE] bg-white/95 backdrop-blur-md p-3.5 shadow-lg flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FEF3EE] text-[#FF6433]">
                  <Compass className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#0F172A]">Route Builder</p>
                  <p className="text-[11px] text-slate-500">Auto-sequenced stops</p>
                </div>
              </div>

              {/* Floating Info Badge 2: Bottom Left */}
              <div className="absolute -bottom-6 -left-4 sm:-left-6 rounded-2xl border border-[#ECE6DE] bg-white/95 backdrop-blur-md p-3.5 shadow-lg flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#0F172A]">Real-Time Budget</p>
                  <p className="text-[11px] text-slate-500">Tracked per activity</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
