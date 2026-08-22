import { z } from 'zod';

export const createSectionSchema = z.object({
  tripId: z.string().uuid('Invalid tripId format'),
  name: z.string().min(1, 'Section name is required'),
  sectionStart: z.string().datetime({ message: 'sectionStart must be a valid ISO datetime' }),
  sectionEnd: z.string().datetime({ message: 'sectionEnd must be a valid ISO datetime' }),
  budget: z.number().min(0, 'Budget cannot be negative').default(0),
  sequence: z.number().int().default(0),
}).refine((data) => new Date(data.sectionEnd) >= new Date(data.sectionStart), {
  message: 'Section end date must be after or equal to section start date',
  path: ['sectionEnd'],
});

export const updateSectionSchema = z.object({
  name: z.string().min(1).optional(),
  sectionStart: z.string().datetime().optional(),
  sectionEnd: z.string().datetime().optional(),
  budget: z.number().min(0).optional(),
  sequence: z.number().int().optional(),
});

export const addStopActivitySchema = z.object({
  activityId: z.string().uuid('Invalid activityId format'),
  day: z.number().int().min(1, 'Day must be at least 1'),
  expense: z.number().min(0, 'Expense cannot be negative').default(0),
  notes: z.string().optional(),
});

export type CreateSectionInput = z.infer<typeof createSectionSchema>;
export type UpdateSectionInput = z.infer<typeof updateSectionSchema>;
export type AddStopActivityInput = z.infer<typeof addStopActivitySchema>;
