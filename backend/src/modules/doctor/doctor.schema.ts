import { z } from "zod";

export const updateDoctorProfileSchema = z.object({
  specializations: z
    .array(z.string().min(1, "Specialization cannot be empty"))
    .optional(),

  experience: z
    .number({ error: "Experience must be a number" })
    .int("Experience must be a whole number")
    .min(0, "Experience cannot be negative")
    .optional(),

  qualifications: z
    .array(z.string().min(1, "Qualification cannot be empty"))
    .optional(),

  bio: z
    .string()
    .max(1000, "Bio must be at most 1000 characters")
    .optional()
    .nullable(),

  consultationFee: z
    .number({ error: "Consultation fee must be a number" })
    .min(0, "Consultation fee cannot be negative")
    .optional()
    .nullable(),

  availableFrom: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Must be in HH:mm format")
    .optional()
    .nullable(),

  availableTo: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Must be in HH:mm format")
    .optional()
    .nullable(),

  // Phase 2 — professional license / registration number
  licenseNumber: z
    .string()
    .min(2, "License number must be at least 2 characters")
    .max(100, "License number is too long")
    .optional()
    .nullable(),
});

export type UpdateDoctorProfileInput = z.infer<typeof updateDoctorProfileSchema>;

export const createTimeSlotsSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .refine((d) => d >= new Date().toISOString().substring(0, 10), {
      message: "Cannot create slots for a past date",
    }),

  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be in YYYY-MM-DD format")
    .optional()
    .nullable(),

  startTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Must be in HH:mm format"),

  endTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Must be in HH:mm format"),
}).refine(data => data.startTime < data.endTime, {
  message: "Start time must be before end time",
  path: ["endTime"],
}).refine(data => !data.endDate || data.endDate >= data.date, {
  message: "End date must be on or after start date",
  path: ["endDate"],
});

export type CreateTimeSlotsInput = z.infer<typeof createTimeSlotsSchema>;
