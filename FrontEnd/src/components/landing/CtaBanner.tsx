'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Compass, ArrowRight, Sparkles, PlusCircle } from 'lucide-react';

export default function CtaBanner() {
  const { isAuthenticated } = useAuth();
  const ctaHref = isAuthenticated ? '/trips/new' : '/register';

  return (
    <section className="py-16 lg:py-20 bg-[#FAF8F5]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="relative overflow-hidden rounded-3xl bg-[#0F172A] p-8 sm:p-12 lg:p-16 text-white shadow-2xl">
          
          {/* Background Decorative Circles */}
          <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[#FF6433]/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="relative z-10 mx-auto max-w-3xl text-center">
            
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-4 py-1.5 text-xs font-bold text-[#FF6433]">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Start Planning in Minutes</span>
            </div>

            <h2 className="mt-6 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl leading-tight">
              Ready to map out your next <br className="hidden sm:inline" />
              multi-city adventure?
            </h2>

            <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl mx-auto">
              Whether you are hopping across European capitals or exploring Asia's cultural hubs, build your custom itinerary now.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href={ctaHref}
                className="flex items-center justify-center gap-2 rounded-full bg-[#FF6433] px-8 py-4 text-sm font-extrabold text-white shadow-lg shadow-[#FF6433]/40 transition hover:bg-[#E85324] hover:scale-[1.03] active:scale-[0.98] w-full sm:w-auto"
              >
                <PlusCircle className="h-4 w-4" />
                <span>{isAuthenticated ? 'Build New Itinerary' : 'Create Free Account'}</span>
              </Link>

              <Link
                href="/community"
                className="flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-7 py-4 text-sm font-extrabold text-white transition hover:bg-white/20 w-full sm:w-auto"
              >
                <Compass className="h-4 w-4 text-[#FF6433]" />
                <span>Explore Community Trips</span>
              </Link>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
