import { z } from 'zod';

const createEventZodValidationSchema = z.object({
  body: z.object({
    title: z.string({
      required_error: "Title is required!",
    }),
    description: z.string({
      required_error: "Description is required!",
    }),
    descriptionImage: z.string().optional(),
    createdBy: z.string({
      required_error: "CreatedBy (User ID) is required!",
    }).optional(),
    date: z.string({
      required_error: "Date is required!",
    }).refine((date) => !isNaN(Date.parse(date)), {
      message: "Invalid date format!",
    }),
    time: z.string({
      required_error: "Time is required!",
    }),
    location: z.string({
      required_error: "Location is required!",
    }),
    maxParticipants: z
      .number({
        required_error: "Max participants is required!",
      })
      .int("Max participants must be an integer")
      .min(1, "Max participants must be at least 1"),
    bannerImage: z.string().optional(),
    coHosts: z
      .array(
        z.object({
          name: z.string({
            required_error: "Co-host name is required!",
          }),
          image: z.string().optional(),
          title: z.string({
            required_error: "Co-host title is required!",
          }),
        })
      )
      .optional(),
    status: z.enum(["active", "cancelled", "completed"]).optional(),
  }),
});


const updateEventZodValidationSchema = z.object({
    body: z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      descriptionImage: z.string().optional(),
      createdBy: z.string().optional(),
      date: z
        .string()
        .optional()
        .refine((date) => !date || !isNaN(Date.parse(date)), {
          message: "Invalid date format!",
        }),
      time: z.string().optional(),
      location: z.string().optional(),
      maxParticipants: z
        .number()
        .int("Max participants must be an integer") // Validate as integer
        .min(1, "Max participants must be at least 1") // Validate minimum value
        .optional(), // Finally make it optional
      bannerImage: z.string().optional(),
      coHosts: z
        .array(
          z.object({
            name: z.string().optional(),
            image: z.string().optional(),
            title: z.string().optional(),
          })
        )
        .optional(),
      status: z.enum(["active", "cancelled", "completed"]).optional(),
    }),
  });
  

export const eventValidation = {
    createEventZodValidationSchema,
    updateEventZodValidationSchema
} 