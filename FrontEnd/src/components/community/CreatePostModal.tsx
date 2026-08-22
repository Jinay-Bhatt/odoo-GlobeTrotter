'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useCreatePost } from '@/hooks/useCommunity';
import { useTrips } from '@/hooks/useTrips';
import { useUploadFile } from '@/hooks/useProfile';
import { X, Image as ImageIcon, Link as LinkIcon, Loader2, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PostFormData {
  content: string;
  tripId?: string;
}

export default function CreatePostModal({ isOpen, onClose }: CreatePostModalProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<PostFormData>();
  const createPostMutation = useCreatePost();
  const uploadFileMutation = useUploadFile();
  const { data: trips } = useTrips();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: PostFormData) => {
    try {
      let imageUrl: string | undefined = undefined;
      if (imageFile) {
        imageUrl = await uploadFileMutation.mutateAsync(imageFile);
      }

      await createPostMutation.mutateAsync({
        content: data.content,
        tripId: data.tripId || undefined,
        image: imageUrl,
      });

      toast.success('Story posted successfully!');
      reset();
      setImageFile(null);
      setImagePreview(null);
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to publish post');
    }
  };

  const isSubmitting = createPostMutation.isPending || uploadFileMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl border border-[#ECE6DE] bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FEF3EE] text-[#FF6433]">
              <Sparkles className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Share Your Travel Experience</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              Your Story / Notes
            </label>
            <textarea
              {...register('content', { required: 'Please write some content for your post' })}
              rows={4}
              placeholder="What made this trip special? Share recommendations, hidden spots, or memories..."
              className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-[#FAF8F5] p-3 text-sm font-medium text-slate-800 placeholder-slate-400 focus:border-[#FF6433] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6433]/20"
            />
            {errors.content && (
              <p className="mt-1 text-xs font-semibold text-rose-500">{errors.content.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              Link to an Itinerary (Optional)
            </label>
            <div className="relative mt-1.5">
              <select
                {...register('tripId')}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-[#FAF8F5] px-3.5 py-2.5 text-xs font-semibold text-slate-700 focus:border-[#FF6433] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6433]/20"
              >
                <option value="">-- Select a Trip --</option>
                {trips?.map((trip) => (
                  <option key={trip.id} value={trip.id}>
                    {trip.name} ({new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()})
                  </option>
                ))}
              </select>
              <LinkIcon className="pointer-events-none absolute right-3.5 top-3 h-4 w-4 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              Upload Photo
            </label>
            <div className="mt-1.5 flex items-center gap-3">
              <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-[#FAF8F5] px-4 py-2.5 text-xs font-bold text-slate-700 hover:border-[#FF6433] hover:bg-white transition">
                <ImageIcon className="h-4 w-4 text-[#FF6433]" />
                Choose Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              {imageFile && (
                <span className="truncate text-xs font-medium text-slate-500 max-w-[200px]">
                  {imageFile.name}
                </span>
              )}
            </div>

            {imagePreview && (
              <div className="relative mt-3 h-32 w-full overflow-hidden rounded-2xl border border-slate-200">
                <img src={imagePreview} alt="Upload Preview" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                  className="absolute right-2 top-2 rounded-full bg-slate-900/70 p-1 text-white hover:bg-slate-900"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-full bg-[#FF6433] px-6 py-2 text-xs font-bold text-white shadow-md shadow-[#FF6433]/30 hover:bg-[#E85324] disabled:opacity-50 transition"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Publishing...
                </>
              ) : (
                'Post Story'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
