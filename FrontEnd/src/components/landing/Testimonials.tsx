'use client';

import React from 'react';
import { Star, Quote, MessageSquare, ShieldCheck, MapPin } from 'lucide-react';

export default function Testimonials() {
  const stats = [
    { label: 'Explore Cities', value: '50+' },
    { label: 'Multi-City Trips Planned', value: '10,000+' },
    { label: 'Travel Expenses Tracked', value: '$1.5M+' },
    { label: 'Community Rating', value: '4.9 / 5.0' },
  ];

  const reviews = [
    {
      name: 'Elena Rostova',
      role: 'Solo Backpacker',
      trip: 'Tokyo → Kyoto → Osaka (14 Days)',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      comment:
        'GlobeTrotter made my 3-city trip to Japan completely stress-free. Splitting my itinerary into distinct city sections with daily budget caps kept me on track!',
      rating: 5,
    },
    {
      name: 'Marcus Vance',
      role: 'Adventure Photographer',
      trip: 'Swiss Alpine Circuit (10 Days)',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      comment:
        'The day-by-day activity block visualizer is incredible. I planned paragliding in Interlaken and glacier walks in Grindelwald without missing a single train.',
      rating: 5,
    },
    {
      name: 'Sophia Chen',
      role: 'Digital Nomad',
      trip: 'Athens & Cyclades Islands (12 Days)',
      photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
      comment:
        'I cloned a featured trip from the GlobeTrotter community feed and customized it in 5 minutes. Sharing the live itinerary token with my friends was so convenient.',
      rating: 5,
    },
  ];

  return (
    <section className="py-16 lg:py-24 bg-white border-t border-[#ECE6DE]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Stats Strip */}
        <div className="rounded-3xl border border-[#ECE6DE] bg-[#FAF8F5] p-8 mb-20 shadow-xs">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, idx) => (
              <div key={idx} className="flex flex-col items-center text-center">
                <span className="text-3xl font-black text-[#0F172A] sm:text-4xl lg:text-5xl">
                  {stat.value}
                </span>
                <span className="mt-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#FF6433]/20 bg-[#FEF3EE] px-3.5 py-1 text-xs font-bold text-[#FF6433]">
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Community Stories</span>
          </div>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-[#0F172A] sm:text-4xl">
            Loved by travelers around the world
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            See how fellow globetrotters plan, organize, and execute multi-stop adventures.
          </p>
        </div>

        {/* Reviews Cards Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {reviews.map((rev, index) => (
            <div
              key={index}
              className="flex flex-col justify-between rounded-3xl border border-[#ECE6DE] bg-white p-7 shadow-xs transition duration-300 hover:shadow-lg hover:border-slate-300"
            >
              <div>
                {/* Rating stars */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                {/* Comment */}
                <p className="text-xs text-slate-700 leading-relaxed italic">
                  "{rev.comment}"
                </p>
              </div>

              {/* User Info */}
              <div className="mt-6 border-t border-slate-100 pt-4 flex items-center gap-3">
                <img
                  src={rev.photo}
                  alt={rev.name}
                  className="h-10 w-10 rounded-full object-cover ring-2 ring-[#FF6433]/20"
                />
                <div>
                  <h4 className="text-xs font-extrabold text-[#0F172A]">{rev.name}</h4>
                  <p className="text-[11px] text-slate-500">{rev.role}</p>
                  <p className="text-[10px] font-bold text-[#FF6433] flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3" />
                    <span>{rev.trip}</span>
                  </p>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
