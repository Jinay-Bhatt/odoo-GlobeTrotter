'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/trips';

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    try {
      const res = await login(data.email, data.password);
      toast.success(`Welcome back, ${res.user.firstName}!`);
      router.push(redirectUrl);
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Invalid email or password';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillDemo = () => {
    setValue('email', 'alex.traveler@example.com');
    setValue('password', 'password123');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black tracking-tight text-[#0F172A]">Welcome Back</h2>
        <p className="mt-1.5 text-xs text-slate-500">
          Sign in to access your curated trips, custom itineraries, and shared travel plans.
        </p>
      </div>

      {/* Demo Credentials Quick-Fill */}
      <button
        type="button"
        onClick={handleFillDemo}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#FF6433]/30 bg-[#FEF3EE] px-3.5 py-2.5 text-xs font-bold text-[#FF6433] hover:bg-[#FDE7DE] transition"
      >
        <Sparkles className="h-4 w-4" />
        Fill Demo Traveler Credentials (alex.traveler@example.com)
      </button>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
            Email Address
          </label>
          <div className="relative rounded-2xl shadow-xs">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
              <Mail className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="email"
              {...register('email')}
              placeholder="you@example.com"
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
            Password
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
              Sign In to Account
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      <div className="text-center text-xs text-slate-500">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="font-bold text-[#FF6433] hover:underline">
          Create an account
        </Link>
      </div>
    </div>
  );
}
