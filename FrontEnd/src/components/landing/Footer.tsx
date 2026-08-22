'use client';

import React from 'react';
import Link from 'next/link';
import { Compass, Globe, MapPin, Calendar, MessageSquare, Shield, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-[#ECE6DE] bg-white pt-16 pb-12 text-slate-600">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12 mb-12">
          
          {/* Brand Col */}
          <div className="md:col-span-5 flex flex-col items-start">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0F172A] text-white shadow-xs transition group-hover:scale-105">
                <Compass className="h-5 w-5 text-[#FF6433]" />
              </div>
              <span className="text-xl font-black tracking-tight text-[#0F172A]">
                GlobeTrotter
              </span>
            </Link>
            <p className="mt-4 text-xs text-slate-500 leading-relaxed max-w-sm">
              The premier itinerary planning platform for multi-city journeys, custom day-by-day activity scheduling, and real-time expense tracking.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FEF3EE] px-3 py-1 text-[11px] font-bold text-[#FF6433]">
                <Globe className="h-3.5 w-3.5" />
                <span>Global Edition 2026</span>
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#0F172A] mb-4">
              Explore & Plan
            </h4>
            <ul className="space-y-2.5 text-xs font-semibold">
              <li>
                <Link href="/trips" className="hover:text-[#FF6433] transition flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  <span>My Itineraries</span>
                </Link>
              </li>
              <li>
                <Link href="/cities" className="hover:text-[#FF6433] transition flex items-center gap-2">
                  <Globe className="h-3.5 w-3.5 text-slate-400" />
                  <span>City Explorer</span>
                </Link>
              </li>
              <li>
                <Link href="/community" className="hover:text-[#FF6433] transition flex items-center gap-2">
                  <MessageSquare className="h-3.5 w-3.5 text-slate-400" />
                  <span>Community Feed</span>
                </Link>
              </li>
              <li>
                <Link href="/calendar" className="hover:text-[#FF6433] transition flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  <span>Trip Calendar</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Features & Security */}
          <div className="md:col-span-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#0F172A] mb-4">
              Platform Features
            </h4>
            <ul className="space-y-2.5 text-xs font-medium text-slate-500">
              <li>• Multi-City Sequential Route Builder</li>
              <li>• Day-by-Day Activity & Budget Manager</li>
              <li>• Interactive Calendar & Shareable Tokens</li>
              <li>• Admin Management & Content Moderation</li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#ECE6DE] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-500">
          <p>© {new Date().getFullYear()} GlobeTrotter Inc. All rights reserved.</p>
          <div className="flex items-center gap-1 text-[#0F172A]">
            <span>Crafted with</span>
            <Heart className="h-3.5 w-3.5 fill-[#FF6433] text-[#FF6433]" />
            <span>for travelers everywhere.</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
