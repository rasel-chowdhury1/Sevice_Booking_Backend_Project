import { z } from "zod";

// Regular expression for hh:mm AM/PM format validation
const timeRegex = /^(0?[1-9]|1[0-2]):([0-5]\d)\s?(AM|PM)$/i;

// Function to convert 12-hour format to 24-hour format
export const convertTo24HourFormat = (time: string): string => {
  const match = time.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
  if (!match) return time; // If not valid, return as is

  let [_, hours, minutes, period] = match;
  let hourNum = parseInt(hours, 10);

  if (period.toUpperCase() === "PM" && hourNum !== 12) {
    hourNum += 12;
  } else if (period.toUpperCase() === "AM" && hourNum === 12) {
    hourNum = 0;
  }

  return `${hourNum.toString().padStart(2, '0')}:${minutes}`;
};



const createBookingZodValidationSchema = z.object({
  body: z.object({
    guide_id: z.string({
      required_error: "Guide ID is required!",
    }),
    booking_date: z
      .string({
        required_error: "Booking date is required!",
      })
      .refine((date) => !isNaN(Date.parse(date)), {
        message: "Invalid booking date format! Use YYYY-MM-DD.",
      }),
      booking_time: z
      .string({
        required_error: "Booking time is required!",
      })
      .regex(timeRegex, "Invalid booking time format! Use hh:mm AM/PM.")
      .transform(convertTo24HourFormat), // Convert to 24-hour format before saving,
    total_price: z
      .number({
        required_error: "Total price is required!",
      })
      .positive("Total price must be a positive number"),
    commission: z
      .number()
      .positive("Commission must be a positive number")
      .optional(),
  }),
});

const updateBookingZodValidationSchema = z.object({
  body: z.object({
    user_id: z.string().optional(),
    guide_id: z.string().optional(),
    event_id: z.string().optional(),
    booking_date: z
      .string()
      .optional()
      .refine((date) => !date || !isNaN(Date.parse(date)), {
        message: "Invalid booking date format!",
      }),
    status: z.enum(["pending", "confirmed", "inProgress", "done", "cancelled"]).optional(),
    total_price: z
      .number()
      .positive("Total price must be a positive number")
      .optional(),
    commission: z.number().positive("Commission must be a positive number").optional(),
  }),
});

export const bookingValidation = {
  createBookingZodValidationSchema,
  updateBookingZodValidationSchema,
};
