'use client';

import React from 'react';
import { MapPin, Calendar, DollarSign, Users, CheckCircle2, Sparkles, Layers, Share2 } from 'lucide-react';

export default function Features() {
  const featuresList = [
    {
      step: '01',
      icon: Layers,
      title: 'Multi-City Route Builder',
      description:
        'Chain multiple destinations into a single organized trip. Define sequential section dates, budgets, and location stops seamlessly.',
      badge: 'Core Engine',
    },
    {
      step: '02',
      icon: Calendar,
      title: 'Day-by-Day Activity Planner',
      description:
        'Schedule city food tours, cultural visits, and outdoor hikes down to specific days. Never miss a reservation or opening hour.',
      badge: 'Precision Scheduling',
    },
    {
      step: '03',
      icon: DollarSign,
      title: 'Real-Time Budget Estimator',
      description:
        'Track stop expenses and activity costs in real-time. Instantly monitor remaining budget across every city on your itinerary.',
      badge: 'Financial Control',
    },
    {
      step: '04',
      icon: Share2,
      title: 'Community Sharing & Public Tokens',
      description:
        'Publish your multi-city journeys to the GlobeTrotter feed or generate instant share links for travel buddies.',
      badge: 'Social & Collaborative',
    },
  ];

  return (
    <section className="py-16 lg:py-24 bg-[#FAF8F5]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#FF6433]/20 bg-[#FEF3EE] px-4 py-1.5 text-xs font-bold text-[#FF6433]">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Why Travelers Choose Us</span>
          </div>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-[#0F172A] sm:text-4xl lg:text-5xl">
            Built for multi-stop journeys, <br className="hidden sm:inline" />
            not simple one-way flights
          </h2>
          <p className="mt-4 text-base text-slate-600 leading-relaxed">
            Generic travel sites treat every booking as an isolated event. GlobeTrotter unifies your entire multi-city itinerary into one intelligent workspace.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {featuresList.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="group relative flex flex-col justify-between rounded-3xl border border-[#ECE6DE] bg-white p-7 shadow-xs transition duration-300 hover:-translate-y-1 hover:border-[#FF6433]/30 hover:shadow-xl hover:shadow-[#FF6433]/5"
              >
                <div>
                  {/* Top Step Badge & Icon */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FEF3EE] text-[#FF6433] transition duration-300 group-hover:bg-[#FF6433] group-hover:text-white">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-2xl font-black text-slate-200 group-hover:text-[#FF6433]/30 transition">
                      {item.step}
                    </span>
                  </div>

                  {/* Title & Badge */}
                  <span className="inline-block rounded-full bg-[#FAF8F5] px-2.5 py-0.5 text-[10px] font-bold text-slate-600 border border-[#ECE6DE] mb-3">
                    {item.badge}
                  </span>
                  <h3 className="text-xl font-bold text-[#0F172A]">{item.title}</h3>

                  {/* Description */}
                  <p className="mt-3 text-xs text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Bottom Highlight Check */}
                <div className="mt-6 border-t border-slate-100 pt-4 flex items-center gap-2 text-[11px] font-bold text-slate-500">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Fully integrated into your dashboard</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
