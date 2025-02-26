import { z } from 'zod';

const createChatValidation = z.object({
  body: z.object({
    participants: z
      .array(z.string())
      .length(1, 'must be add in the array receiver id'),
    status: z.enum(['accepted', 'blocked']).default('accepted'),
  }),
});

export const chatValidation = {
  createChatValidation,
};