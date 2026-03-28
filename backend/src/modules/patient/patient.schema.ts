import { z } from "zod";

export const updatePatientProfileSchema = z.object({
  dateOfBirth: z
    .string()
    .datetime({ message: "Date of birth must be a valid ISO date string" })
    .optional()
    .nullable(),

  gender: z
    .enum(["MALE", "FEMALE", "OTHER"] as const, {
      error: "Gender must be MALE, FEMALE, or OTHER",
    })
    .optional()
    .nullable(),

  bloodGroup: z
    .string()
    .max(10, "Blood group must be at most 10 characters")
    .optional()
    .nullable(),

  phone: z
    .string()
    .min(7, "Phone must be at least 7 characters")
    .max(20, "Phone must be at most 20 characters")
    .optional()
    .nullable(),

  address: z
    .string()
    .max(500, "Address must be at most 500 characters")
    .optional()
    .nullable(),

  allergies: z
    .array(z.string().min(1, "Allergy cannot be empty"))
    .optional(),

  medicalHistory: z
    .string()
    .max(5000, "Medical history must be at most 5000 characters")
    .optional()
    .nullable(),
});

export type UpdatePatientProfileInput = z.infer<typeof updatePatientProfileSchema>;
