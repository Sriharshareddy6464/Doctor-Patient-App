import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string({ error: "Name is required" })
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters"),

  email: z
    .string({ error: "Email is required" })
    .email("Invalid email address"),

  password: z
    .string({ error: "Password is required" })
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),

  role: z.enum(["PATIENT", "DOCTOR"] as const, {
    error: "Role must be either PATIENT or DOCTOR",
  }),

  // Optional at registration — collected for both roles
  phone: z
    .string()
    .min(7, "Phone number must be at least 7 characters")
    .max(20, "Phone number is too long")
    .optional(),

  // Only relevant for DOCTOR — pre-fills specializations on the profile
  specialization: z
    .string()
    .min(2, "Specialization must be at least 2 characters")
    .max(100, "Specialization is too long")
    .optional(),
});

export const loginSchema = z.object({
  email: z
    .string({ error: "Email is required" })
    .email("Invalid email address"),

  password: z
    .string({ error: "Password is required" })
    .min(1, "Password is required"),
});

export const refreshTokenSchema = z.object({
  refreshToken: z
    .string({ error: "Refresh token is required" })
    .min(1, "Refresh token is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
