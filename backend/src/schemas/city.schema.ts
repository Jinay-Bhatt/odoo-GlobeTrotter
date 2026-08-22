import { z } from 'zod';

export const cityQuerySchema = z.object({
  search: z.string().optional(),
  popular: z.enum(['true', 'false']).optional(),
});

export const activityQuerySchema = z.object({
  cityId: z.string().uuid().optional(),
  category: z.enum(['ADVENTURE', 'CULTURE', 'FOOD', 'NATURE', 'OTHER']).optional(),
  search: z.string().optional(),
});
