import { z } from 'zod';

const createCalendarEntryValidation = z.object({
  body: z.object({
    event_id: z.string().nonempty('Event ID is required'), // Ensure event ID is provided
    isDeleted: z.boolean().default(false), // Optional, defaults to false
  }),
});

const updateCalendarEntryValidation = z.object({
  body: z.object({
    user_id: z.string().optional(),
    event_id: z.string().optional(),
    isDeleted: z.boolean().optional(),
  }),
});

export const calendarValidation = {
  createCalendarEntryValidation,
  updateCalendarEntryValidation,
};
