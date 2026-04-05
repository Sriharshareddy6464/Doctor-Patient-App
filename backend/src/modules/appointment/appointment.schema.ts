import { z } from "zod";

export const bookAppointmentSchema = z.object({
  timeSlotId: z.string().uuid("Invalid time slot ID"),
  notes: z.string().max(500).optional(),
});

export type BookAppointmentInput = z.infer<typeof bookAppointmentSchema>;
