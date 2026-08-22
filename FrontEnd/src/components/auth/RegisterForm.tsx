'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Lock, Mail, User as UserIcon, Phone, MapPin, Globe, ArrowRight, Image } from 'lucide-react';

const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  photo: z.string().optional(),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register: authRegister } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phone: '',
      city: '',
      country: '',
      photo: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    try {
      const res = await authRegister({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || undefined,
        city: data.city || undefined,
        country: data.country || undefined,
        photo: data.photo || undefined,
      });
      toast.success(`Welcome to Around, ${res.user.firstName}!`);
      router.push('/trips');
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black tracking-tight text-[#0F172A]">Join Around</h2>
        <p className="mt-1.5 text-xs text-slate-500">
          Start crafting detailed itineraries, tracking expenses, and planning trips.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name Fields (First + Last) */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              First Name *
            </label>
            <div className="relative rounded-2xl shadow-xs">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                <UserIcon className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                {...register('firstName')}
                placeholder="Alex"
                className={`block w-full rounded-2xl border py-3 pl-10 pr-3.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 ${
                  errors.firstName
                    ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100'
                    : 'border-[#ECE6DE] bg-[#FAF8F5] focus:bg-white focus:border-[#FF6433] focus:ring-[#FF6433]/15'
                }`}
              />
            </div>
            {errors.firstName && (
              <p className="mt-1 text-xs text-rose-600 font-medium">{errors.firstName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Last Name *
            </label>
            <div className="relative rounded-2xl shadow-xs">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                <UserIcon className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                {...register('lastName')}
                placeholder="Morgan"
                className={`block w-full rounded-2xl border py-3 pl-10 pr-3.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 ${
                  errors.lastName
                    ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100'
                    : 'border-[#ECE6DE] bg-[#FAF8F5] focus:bg-white focus:border-[#FF6433] focus:ring-[#FF6433]/15'
                }`}
              />
            </div>
            {errors.lastName && (
              <p className="mt-1 text-xs text-rose-600 font-medium">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
            Email Address *
          </label>
          <div className="relative rounded-2xl shadow-xs">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
              <Mail className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="email"
              {...register('email')}
              placeholder="alex@example.com"
              className={`block w-full rounded-2xl border py-3 pl-10 pr-3.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 ${
                errors.email
                  ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100'
                  : 'border-[#ECE6DE] bg-[#FAF8F5] focus:bg-white focus:border-[#FF6433] focus:ring-[#FF6433]/15'
              }`}
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-xs text-rose-600 font-medium">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
            Password (Min 8 characters) *
          </label>
          <div className="relative rounded-2xl shadow-xs">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
              <Lock className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              {...register('password')}
              placeholder="••••••••"
              className={`block w-full rounded-2xl border py-3 pl-10 pr-10 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 ${
                errors.password
                  ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100'
                  : 'border-[#ECE6DE] bg-[#FAF8F5] focus:bg-white focus:border-[#FF6433] focus:ring-[#FF6433]/15'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-rose-600 font-medium">{errors.password.message}</p>
          )}
        </div>

        {/* Location (City & Country) */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              City (Optional)
            </label>
            <div className="relative rounded-2xl shadow-xs">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                <MapPin className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                {...register('city')}
                placeholder="San Francisco"
                className="block w-full rounded-2xl border border-[#ECE6DE] bg-[#FAF8F5] py-3 pl-10 pr-3.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#FF6433] focus:outline-none focus:ring-4 focus:ring-[#FF6433]/15"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Country (Optional)
            </label>
            <div className="relative rounded-2xl shadow-xs">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                <Globe className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                {...register('country')}
                placeholder="United States"
                className="block w-full rounded-2xl border border-[#ECE6DE] bg-[#FAF8F5] py-3 pl-10 pr-3.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#FF6433] focus:outline-none focus:ring-4 focus:ring-[#FF6433]/15"
              />
            </div>
          </div>
        </div>

        {/* Phone & Photo URL */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Phone (Optional)
            </label>
            <div className="relative rounded-2xl shadow-xs">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                <Phone className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="tel"
                {...register('phone')}
                placeholder="+1 555 0199"
                className="block w-full rounded-2xl border border-[#ECE6DE] bg-[#FAF8F5] py-3 pl-10 pr-3.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#FF6433] focus:outline-none focus:ring-4 focus:ring-[#FF6433]/15"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Avatar URL (Optional)
            </label>
            <div className="relative rounded-2xl shadow-xs">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                <Image className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="url"
                {...register('photo')}
                placeholder="https://..."
                className="block w-full rounded-2xl border border-[#ECE6DE] bg-[#FAF8F5] py-3 pl-10 pr-3.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#FF6433] focus:outline-none focus:ring-4 focus:ring-[#FF6433]/15"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-[#FF6433] py-3 text-xs font-bold text-white shadow-md shadow-[#FF6433]/25 hover:bg-[#E85324] focus:outline-none focus:ring-4 focus:ring-[#FF6433]/20 transition disabled:opacity-60"
        >
          {isSubmitting ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <>
              Create Your Account
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      <div className="text-center text-xs text-slate-500">
        Already have an account?{' '}
        <Link href="/login" className="font-bold text-[#FF6433] hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  );
}
