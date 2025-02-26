import { z } from 'zod';

const loginZodValidationSchema = z.object({
  body: z.object({
    email: z.string({
      required_error: 'Email is required!',
    }),
    password: z.string({
      required_error: 'Password is required!',
    }),
  }),
});

const refreshTokenValidationSchema = z.object({
  cookies: z.object({
    refreshToken: z.string({
      required_error: 'Refresh token is required!',
    }),
  }),
});


const forgetPasswordValidationSchemaByEmail = z.object({
  body: z.object({
    email: z.string({
      required_error: 'Email is required!',
    }),
  }),
});

const forgetPasswordValidationSchemaByNumber = z.object({
  body: z.object({
    phoneNumber: z.string({
      required_error: 'phoneNumber is required!',
    }),
  }),
});

const otpMatchValidationSchema = z.object({
  body: z.object({
    otp: z.string({
      required_error: 'Otp is required!',
    }),
  }),
});
const resetPasswordValidationSchema = z.object({
  body: z.object({
    newPassword: z.string({
      required_error: 'New Password is required!',
    }), 
    confirmPassword: z.string({
      required_error: 'New Password is required!',
    }),
  }),
});

export const authValidation = {
  loginZodValidationSchema,
  refreshTokenValidationSchema,
  forgetPasswordValidationSchemaByEmail,
  forgetPasswordValidationSchemaByNumber,
  otpMatchValidationSchema,
  resetPasswordValidationSchema,
};
