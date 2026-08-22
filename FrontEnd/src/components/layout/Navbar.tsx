'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
  Compass,
  MapPin,
  Calendar,
  PlusCircle,
  LogOut,
  ChevronDown,
  Menu,
  X,
  MessageSquare,
  Globe,
  User,
  Shield,
} from 'lucide-react';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navLinks = [
    { href: '/trips', label: 'My Trips', icon: MapPin },
    { href: '/cities', label: 'Explore', icon: Globe },
    { href: '/community', label: 'Community', icon: MessageSquare },
    { href: '/calendar', label: 'Calendar', icon: Calendar },
    { href: '/trips/new', label: 'Plan Trip', icon: PlusCircle },
  ];

  return (
    <header className="sticky top-0 z-40 px-4 sm:px-6 lg:px-8 pt-3 pb-2 bg-[#FAF8F5]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between rounded-full border border-[#ECE6DE] bg-white/90 px-5 shadow-xs">
        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <Link href="/trips" className="flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FF6433] text-white shadow-sm shadow-[#FF6433]/30 transition group-hover:scale-105">
              <Compass className="h-5 w-5" />
            </div>
            <span className="text-xl font-black tracking-tight text-[#0F172A]">
              Around<span className="text-[#FF6433]">.</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          {isAuthenticated && (
            <nav className="hidden md:flex md:items-center md:gap-1.5 rounded-full bg-[#FAF8F5] p-1 border border-[#ECE6DE]/60">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/trips' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold transition ${
                      isActive
                        ? 'bg-[#FF6433] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                    }`}
                  >
                    <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>

        {/* Right Section: User Dropdown or Login */}
        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 rounded-full border border-[#ECE6DE] bg-[#FAF8F5] p-1 pr-3 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white focus:outline-none"
              >
                {user.photo ? (
                  <img
                    src={user.photo}
                    alt={`${user.firstName} ${user.lastName}`}
                    className="h-8 w-8 rounded-full object-cover ring-2 ring-[#FF6433]/20"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FEF3EE] text-[#FF6433] font-bold">
                    {user.firstName ? user.firstName.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <span className="hidden sm:inline-block">
                  {user.firstName} {user.lastName}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>

              {dropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute right-0 z-20 mt-2 w-56 rounded-2xl border border-[#ECE6DE] bg-white py-2 shadow-xl">
                    <div className="border-b border-slate-100 px-4 py-3">
                      <p className="text-sm font-bold text-slate-900">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="truncate text-xs text-slate-400">{user.email}</p>
                      <span className="mt-1.5 inline-block rounded-full bg-[#FEF3EE] px-2.5 py-0.5 text-[10px] font-bold text-[#FF6433]">
                        {user.role}
                      </span>
                    </div>

                    <div className="py-1">
                      <Link
                        href="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex w-full items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-[#FAF8F5]"
                      >
                        <User className="h-4 w-4 text-slate-400" />
                        My Profile & Settings
                      </Link>
                      <Link
                        href="/trips"
                        onClick={() => setDropdownOpen(false)}
                        className="flex w-full items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-[#FAF8F5]"
                      >
                        <MapPin className="h-4 w-4 text-slate-400" />
                        My Itineraries
                      </Link>
                      {user.role === 'ADMIN' && (
                        <Link
                          href="/admin"
                          onClick={() => setDropdownOpen(false)}
                          className="flex w-full items-center gap-2 px-4 py-2 text-xs font-medium text-purple-700 hover:bg-purple-50"
                        >
                          <Shield className="h-4 w-4 text-purple-500" />
                          Admin Dashboard
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-slate-100 py-1">
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 px-4 py-2 text-left text-xs font-medium text-rose-600 hover:bg-rose-50"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                href="/login"
                className="rounded-full px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 transition"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-[#FF6433] px-5 py-2 text-xs font-bold text-white shadow-xs shadow-[#FF6433]/30 hover:bg-[#E85324] transition"
              >
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          {isAuthenticated && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-full p-2 text-slate-600 hover:bg-slate-100 md:hidden"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && isAuthenticated && (
        <div className="mt-2 rounded-2xl border border-[#ECE6DE] bg-white p-4 shadow-lg md:hidden">
          <div className="flex flex-col gap-1.5">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold ${
                    isActive
                      ? 'bg-[#FF6433] text-white'
                      : 'text-slate-600 hover:bg-[#FAF8F5]'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
            <Link
              href="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-600 hover:bg-[#FAF8F5]"
            >
              <User className="h-4 w-4" />
              My Profile
            </Link>
            {user?.role === 'ADMIN' && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold text-purple-700 hover:bg-purple-50"
              >
                <Shield className="h-4 w-4" />
                Admin Dashboard
              </Link>
            )}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-xs font-bold text-rose-600 hover:bg-rose-50"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
