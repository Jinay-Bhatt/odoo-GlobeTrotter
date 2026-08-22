'use client';

import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Hero from '@/components/landing/Hero';
import QuickSearch from '@/components/landing/QuickSearch';
import FeaturedDestinations from '@/components/landing/FeaturedDestinations';
import Features from '@/components/landing/Features';
import Testimonials from '@/components/landing/Testimonials';
import CtaBanner from '@/components/landing/CtaBanner';
import Footer from '@/components/landing/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-slate-900 selection:bg-[#FF6433] selection:text-white">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Content Sections */}
      <main className="flex-1">
        <Hero />
        <QuickSearch />
        <FeaturedDestinations />
        <Features />
        <Testimonials />
        <CtaBanner />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
