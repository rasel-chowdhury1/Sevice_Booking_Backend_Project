import { z } from 'zod';

 

const sendMessageValidation = z.object({
 
  body: z.object({
    chat: z.string({ required_error: 'chat id is required' }).optional(),
    text: z
      .string({ required_error: 'text is required' })
      .default('')
      .optional(), 
    receiver: z.string({ required_error: 'receiver id is required' }),
    seen: z.boolean().default(false),
  }),
});

const updateMessageValidation = z.object({
 
  body: z.object({
    chat: z.string({ required_error: 'chat id is required' }),
    text: z
      .string({ required_error: 'text is required' })
      .default('')
      .optional(), 
    receiver: z.string({ required_error: 'receiver id is required' }),
    seen: z.boolean().default(false),
  }),
});

export const messagesValidation = {
  sendMessageValidation,
  updateMessageValidation,
};