import React from 'react';
import Link from 'next/link';
import { Compass, Sparkles } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col justify-center bg-[#FAF8F5] py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FF6433] text-white shadow-md shadow-[#FF6433]/30 transition group-hover:scale-105">
            <Compass className="h-6 w-6" />
          </div>
          <span className="text-2xl font-black tracking-tight text-[#0F172A]">
            Around<span className="text-[#FF6433]">.</span>
          </span>
        </Link>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="rounded-3xl border border-[#ECE6DE] bg-white p-6 sm:p-10 shadow-xl shadow-[#2D1B16]/4">
          {children}
        </div>
      </div>
    </div>
  );
}
