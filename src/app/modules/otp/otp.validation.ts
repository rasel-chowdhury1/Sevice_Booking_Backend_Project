import { z } from 'zod';

const verifyOtpZodSchema = z.object({
  body: z.object({
    otp: z
      .string({ required_error: 'otp is required' })
      .length(6, { message: 'otp must be exactly 6 characters long' }),
  }),
});

export const resentOtpValidations = {
  // resentOtpZodSchema,
  verifyOtpZodSchema,
};
