'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCommunityPosts, useDeletePost } from '@/hooks/useCommunity';
import { useAuth } from '@/hooks/useAuth';
import CreatePostModal from './CreatePostModal';
import { MessageSquare, PlusCircle, Trash2, MapPin, Calendar, Loader2, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CommunityFeed() {
  const { data: posts, isLoading, isError } = useCommunityPosts();
  const deletePostMutation = useDeletePost();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this story post?')) {
      try {
        await deletePostMutation.mutateAsync(id);
        toast.success('Post deleted');
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Failed to delete post');
      }
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-3xl border border-[#ECE6DE] bg-white p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-[#FF6433]" />
            Traveler Community Feed
          </h1>
          <p className="mt-1 text-xs font-semibold text-slate-500">
            Real stories, trip recommendations, and experiences shared live by fellow travelers.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-full bg-[#FF6433] px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-[#FF6433]/30 hover:bg-[#E85324] transition shrink-0"
        >
          <PlusCircle className="h-4 w-4" />
          Share Experience
        </button>
      </div>

      {/* Posts List */}
      <div className="mt-8 space-y-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin text-[#FF6433]" />
            <p className="mt-2 text-xs font-bold">Loading community posts...</p>
          </div>
        ) : isError ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-700">
            <p className="text-sm font-bold">Unable to fetch posts right now.</p>
          </div>
        ) : posts && posts.length > 0 ? (
          posts.map((post) => {
            const isOwner = user?.id === post.userId || user?.role === 'ADMIN';
            return (
              <div
                key={post.id}
                className="overflow-hidden rounded-3xl border border-[#ECE6DE] bg-white shadow-sm transition hover:shadow-md"
              >
                {/* Author Info Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    {post.user?.photo ? (
                      <img
                        src={post.user.photo}
                        alt={`${post.user.firstName} ${post.user.lastName}`}
                        className="h-10 w-10 rounded-full object-cover ring-2 ring-[#FF6433]/20"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FEF3EE] text-[#FF6433] font-bold text-sm">
                        {post.user?.firstName ? post.user.firstName.charAt(0).toUpperCase() : 'T'}
                      </div>
                    )}
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {post.user ? `${post.user.firstName} ${post.user.lastName}` : 'Traveler'}
                      </h3>
                      <p className="text-[11px] font-medium text-slate-400">
                        {new Date(post.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>

                  {isOwner && (
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="rounded-full p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                      title="Delete post"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  <p className="whitespace-pre-line text-sm font-medium leading-relaxed text-slate-700">
                    {post.content}
                  </p>

                  {/* Optional Post Image */}
                  {post.image && (
                    <div className="mt-4 overflow-hidden rounded-2xl border border-slate-100 max-h-[400px]">
                      <img src={post.image} alt="Post Attachment" className="w-full object-cover" />
                    </div>
                  )}

                  {/* Linked Trip Badge */}
                  {post.trip && (
                    <div className="mt-4 flex items-center justify-between rounded-2xl border border-[#ECE6DE] bg-[#FAF8F5] p-3">
                      <div className="flex items-center gap-2.5">
                        <MapPin className="h-4 w-4 text-[#FF6433]" />
                        <div>
                          <p className="text-xs font-bold text-slate-900">{post.trip.name}</p>
                          <p className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(post.trip.startDate).toLocaleDateString()} - {new Date(post.trip.endDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {post.trip.shareToken && (
                        <Link
                          href={`/share/${post.trip.shareToken}`}
                          className="flex items-center gap-1 text-[11px] font-bold text-[#FF6433] hover:underline"
                        >
                          <Share2 className="h-3.5 w-3.5" />
                          View Shared Trip
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-[#FAF8F5] py-16 text-center">
            <MessageSquare className="mx-auto h-10 w-10 text-slate-300" />
            <h3 className="mt-3 text-base font-bold text-slate-700">No community stories yet</h3>
            <p className="mt-1 text-xs font-medium text-slate-400">
              Be the first to share your travel experience with the community!
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#FF6433] px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#E85324] transition"
            >
              <PlusCircle className="h-4 w-4" />
              Create First Post
            </button>
          </div>
        )}
      </div>

      <CreatePostModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
