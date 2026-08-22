import { z } from 'zod';

export const createPostSchema = z.object({
  content: z.string().min(1, 'Post content cannot be empty'),
  image: z.string().optional(),
  tripId: z.string().uuid().optional(),
});

export const communityQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
