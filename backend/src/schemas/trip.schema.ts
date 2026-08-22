import { z } from 'zod';

export const createTripSchema = z.object({
  name: z.string().min(1, 'Trip name is required').max(100, 'Trip name max length is 100 characters'),
  startDate: z.string().datetime({ message: 'startDate must be a valid ISO date-time string' }),
  endDate: z.string().datetime({ message: 'endDate must be a valid ISO date-time string' }),
  description: z.string().optional(),
  coverPhoto: z.string().optional(),
}).refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
  message: 'End date must be after or equal to start date',
  path: ['endDate'],
});

export const updateTripSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  description: z.string().optional(),
  coverPhoto: z.string().optional(),
  isPublic: z.boolean().optional(),
});

export type CreateTripInput = z.infer<typeof createTripSchema>;
export type UpdateTripInput = z.infer<typeof updateTripSchema>;
