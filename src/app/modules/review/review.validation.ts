import { z } from "zod";

const createReviewZodValidationSchema = z.object({
  body: z.object({
    review_id: z.string({
      required_error: "Event ID is required!",
    }),
    rating: z
      .number({
        required_error: "Rating is required!",
      })
      .int("Rating must be an integer!")
      .min(1, "Rating must be at least 1!")
      .max(5, "Rating cannot exceed 5!"),
    comment: z
      .string({
        required_error: "Comment is required!",
      })
      .min(1, "Comment cannot be empty!")
      .optional(),
  }),
});

const updateReviewZodValidationSchema = z.object({
  body: z.object({
    review_id: z.string().optional(),
    rating: z
      .number()
      .int("Rating must be an integer!")
      .min(1, "Rating must be at least 1!")
      .max(5, "Rating cannot exceed 5!")
      .optional(),
    comment: z.string().min(1, "Comment cannot be empty!").optional(),
  }),
});

export const reviewValidation = {
  createReviewZodValidationSchema,
  updateReviewZodValidationSchema,
};
