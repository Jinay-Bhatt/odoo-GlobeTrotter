'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/hooks/useAuth';
import { useUpdateProfile, useChangePassword, useUploadFile } from '@/hooks/useProfile';
import { getImageUrl } from '@/lib/api';


import { User, Shield, Camera, KeyRound, Loader2, CheckCircle2, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProfileFields {
  firstName: string;
  lastName: string;
  phone?: string;
  city?: string;
  country?: string;
  photo?: string;
}

interface PasswordFields {
  currentPassword: string;
  newPassword: string;
}

export default function ProfileForm() {
  const { user, updateUser } = useAuth();
  const updateProfileMutation = useUpdateProfile();
  const changePasswordMutation = useChangePassword();
  const uploadFileMutation = useUploadFile();

  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');

  // Form setup
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    setValue: setProfileValue,
    formState: { errors: profileErrors },
  } = useForm<ProfileFields>({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
      city: user?.city || '',
      country: user?.country || '',
      photo: user?.photo || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFields>();

  // Avatar Upload Handler
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const photoUrl = await uploadFileMutation.mutateAsync(file);
        setProfileValue('photo', photoUrl);
        const updated = await updateProfileMutation.mutateAsync({ photo: photoUrl });
        updateUser(updated);
        toast.success('Profile photo updated successfully!');
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Failed to upload photo');
      }
    }
  };


  const onProfileSubmit = async (data: ProfileFields) => {
    try {
      const updated = await updateProfileMutation.mutateAsync(data);
      updateUser(updated);
      toast.success('Profile updated successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const onPasswordSubmit = async (data: PasswordFields) => {
    try {
      await changePasswordMutation.mutateAsync(data);
      toast.success('Password changed successfully!');
      resetPasswordForm();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    }
  };

  if (!user) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Profile Overview Card */}
      <div className="overflow-hidden rounded-3xl border border-[#ECE6DE] bg-white shadow-sm">
        <div className="h-32 bg-gradient-to-r from-[#FF6433] to-[#FF8C66] p-6 flex items-end">
          <span className="rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-xs font-bold text-white uppercase tracking-wider">
            {user.role} Account
          </span>
        </div>

        <div className="relative px-6 pb-6 pt-0">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12">
            <div className="relative h-24 w-24 rounded-full border-4 border-white bg-[#FEF3EE] shadow-md overflow-hidden group">
              {user.photo ? (
                <img src={getImageUrl(user.photo)} alt={user.firstName} className="h-full w-full object-cover" />
              ) : (

                <div className="flex h-full w-full items-center justify-center text-2xl font-black text-[#FF6433]">
                  {user.firstName ? user.firstName.charAt(0).toUpperCase() : 'U'}
                </div>
              )}

              {/* Photo Upload Overlay */}
              <label className="absolute inset-0 flex cursor-pointer items-center justify-center bg-slate-900/50 text-white opacity-0 group-hover:opacity-100 transition">
                <Camera className="h-6 w-6" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('profile')}
                className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                  activeTab === 'profile'
                    ? 'bg-[#FF6433] text-white shadow-xs'
                    : 'bg-[#FAF8F5] text-slate-600 border border-[#ECE6DE] hover:bg-white'
                }`}
              >
                <UserCheck className="inline h-3.5 w-3.5 mr-1.5" />
                Profile Info
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                  activeTab === 'security'
                    ? 'bg-[#FF6433] text-white shadow-xs'
                    : 'bg-[#FAF8F5] text-slate-600 border border-[#ECE6DE] hover:bg-white'
                }`}
              >
                <Shield className="inline h-3.5 w-3.5 mr-1.5" />
                Security & Password
              </button>
            </div>
          </div>

          <div className="mt-4">
            <h1 className="text-2xl font-black text-slate-900">
              {user.firstName} {user.lastName}
            </h1>
            <p className="text-xs font-semibold text-slate-400">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="mt-8 rounded-3xl border border-[#ECE6DE] bg-white p-6 sm:p-8 shadow-sm">
        {activeTab === 'profile' ? (
          <form onSubmit={handleSubmitProfile(onProfileSubmit)} className="space-y-6">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
              Personal Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  First Name
                </label>
                <input
                  type="text"
                  {...registerProfile('firstName', { required: 'First name is required' })}
                  className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-[#FAF8F5] px-4 py-2.5 text-xs font-bold text-slate-800 focus:border-[#FF6433] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6433]/20"
                />
                {profileErrors.firstName && (
                  <p className="mt-1 text-xs text-rose-500 font-semibold">{profileErrors.firstName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Last Name
                </label>
                <input
                  type="text"
                  {...registerProfile('lastName', { required: 'Last name is required' })}
                  className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-[#FAF8F5] px-4 py-2.5 text-xs font-bold text-slate-800 focus:border-[#FF6433] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6433]/20"
                />
                {profileErrors.lastName && (
                  <p className="mt-1 text-xs text-rose-500 font-semibold">{profileErrors.lastName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Phone Number
                </label>
                <input
                  type="text"
                  placeholder="+1 (555) 000-0000"
                  {...registerProfile('phone')}
                  className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-[#FAF8F5] px-4 py-2.5 text-xs font-bold text-slate-800 focus:border-[#FF6433] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6433]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  City
                </label>
                <input
                  type="text"
                  placeholder="San Francisco"
                  {...registerProfile('city')}
                  className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-[#FAF8F5] px-4 py-2.5 text-xs font-bold text-slate-800 focus:border-[#FF6433] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6433]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Country
                </label>
                <input
                  type="text"
                  placeholder="United States"
                  {...registerProfile('country')}
                  className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-[#FAF8F5] px-4 py-2.5 text-xs font-bold text-slate-800 focus:border-[#FF6433] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6433]/20"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Profile Photo URL
                </label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/photo-..."
                  {...registerProfile('photo')}
                  className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-[#FAF8F5] px-4 py-2.5 text-xs font-bold text-slate-800 focus:border-[#FF6433] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6433]/20"
                />
                <p className="mt-1 text-[11px] font-medium text-slate-400">
                  Paste an image URL directly or click the camera overlay on your avatar photo above to upload an image file.
                </p>
              </div>
            </div>


            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="flex items-center gap-2 rounded-full bg-[#FF6433] px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-[#FF6433]/30 hover:bg-[#E85324] transition disabled:opacity-50"
              >
                {updateProfileMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmitPassword(onPasswordSubmit)} className="space-y-6">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
              Change Security Password
            </h2>

            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Current Password
                </label>
                <input
                  type="password"
                  {...registerPassword('currentPassword', { required: 'Current password is required' })}
                  className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-[#FAF8F5] px-4 py-2.5 text-xs font-bold text-slate-800 focus:border-[#FF6433] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6433]/20"
                />
                {passwordErrors.currentPassword && (
                  <p className="mt-1 text-xs text-rose-500 font-semibold">{passwordErrors.currentPassword.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  New Password
                </label>
                <input
                  type="password"
                  {...registerPassword('newPassword', {
                    required: 'New password is required',
                    minLength: { value: 8, message: 'Password must be at least 8 characters' },
                  })}
                  className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-[#FAF8F5] px-4 py-2.5 text-xs font-bold text-slate-800 focus:border-[#FF6433] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6433]/20"
                />
                {passwordErrors.newPassword && (
                  <p className="mt-1 text-xs text-rose-500 font-semibold">{passwordErrors.newPassword.message}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={changePasswordMutation.isPending}
                className="flex items-center gap-2 rounded-full bg-[#FF6433] px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-[#FF6433]/30 hover:bg-[#E85324] transition disabled:opacity-50"
              >
                {changePasswordMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Updating Password...
                  </>
                ) : (
                  <>
                    <KeyRound className="h-4 w-4" />
                    Update Password
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
