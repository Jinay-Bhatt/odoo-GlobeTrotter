'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CommunityPost } from '@/types';
import api from '@/lib/api';

export function useCommunityPosts() {
  return useQuery({
    queryKey: ['community-posts'],
    queryFn: async (): Promise<CommunityPost[]> => {
      const res = await api.get<{ posts: CommunityPost[] }>('/api/community');
      return res.data.posts;
    },
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { content: string; image?: string; tripId?: string }): Promise<CommunityPost> => {
      const res = await api.post<{ post: CommunityPost }>('/api/community', data);
      return res.data.post;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<{ message: string }> => {
      const res = await api.delete<{ message: string }>(`/api/community/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
    },
  });
}
