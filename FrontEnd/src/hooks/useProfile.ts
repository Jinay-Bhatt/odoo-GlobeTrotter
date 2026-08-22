'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { User } from '@/types';
import api from '@/lib/api';

export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
  city?: string;
  country?: string;
  photo?: string;
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateProfileInput): Promise<User> => {
      const res = await api.put<{ user: User }>('/api/auth/profile', data);
      return res.data.user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }): Promise<{ message: string }> => {
      const res = await api.post<{ message: string }>('/api/auth/change-password', data);
      return res.data;
    },
  });
}

export function useUploadFile() {
  return useMutation({
    mutationFn: async (file: File): Promise<string> => {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post<{ url: string }>('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return res.data.url;
    },
  });
}
