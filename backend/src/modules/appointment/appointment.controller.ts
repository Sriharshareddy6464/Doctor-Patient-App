import { Request, Response } from "express";
import { z } from "zod";
import * as appointmentService from "./appointment.service";
import { bookAppointmentSchema } from "./appointment.schema";

const formatZodErrors = (error: z.ZodError) => {
  const formatted: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "unknown";
    formatted[key] = issue.message;
  }
  return formatted;
};

/**
 * GET /patient/doctors/:id/slots?date=YYYY-MM-DD
 */
export const getDoctorSlots = async (req: Request, res: Response) => {
  try {
    const rawId = req.params.id;
    const doctorId = typeof rawId === "string" ? rawId : undefined;
    const rawDate = req.query.date;
    const date = typeof rawDate === "string" ? rawDate : undefined;

    if (!doctorId || !date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        success: false,
        message: "Doctor ID and a valid date (YYYY-MM-DD) are required",
      });
    }

    const result = await appointmentService.getDoctorAvailableSlots(doctorId, date);
    return res.status(200).json({ success: true, data: result });
  } catch (err: any) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
};

/**
 * POST /patient/appointments
 * Book a slot + mock payment → creates appointment
 */
export const bookAppointment = async (req: Request, res: Response) => {
  const parsed = bookAppointmentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: formatZodErrors(parsed.error),
    });
  }

  try {
    const patientId = req.user!.userId;
    const result = await appointmentService.bookAppointment(patientId, parsed.data);
    return res.status(201).json({
      success: true,
      message: "Appointment booked and payment successful",
      data: result,
    });
  } catch (err: any) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
};

/**
 * GET /patient/appointments
 */
export const getPatientAppointments = async (req: Request, res: Response) => {
  try {
    const patientId = req.user!.userId;
    const appointments = await appointmentService.getPatientAppointments(patientId);
    return res.status(200).json({ success: true, data: appointments });
  } catch (err: any) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
};

/**
 * GET /patient/appointments/:id/join
 */
export const patientJoinCall = async (req: Request, res: Response) => {
  try {
    const patientId = req.user!.userId;
    const rawId = req.params.id;
    const appointmentId = typeof rawId === "string" ? rawId : undefined;
    if (!appointmentId) {
      return res.status(400).json({ success: false, message: "Appointment ID is required" });
    }
    const result = await appointmentService.getPatientCallToken(appointmentId, patientId);
    return res.status(200).json({ success: true, data: result });
  } catch (err: any) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
};

/**
 * GET /doctor/appointments
 */
export const getDoctorAppointments = async (req: Request, res: Response) => {
  try {
    const doctorId = req.user!.userId;
    const appointments = await appointmentService.getDoctorAppointments(doctorId);
    return res.status(200).json({ success: true, data: appointments });
  } catch (err: any) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
};

/**
 * GET /doctor/appointments/:id/join
 */
export const doctorJoinCall = async (req: Request, res: Response) => {
  try {
    const doctorId = req.user!.userId;
    const rawId = req.params.id;
    const appointmentId = typeof rawId === "string" ? rawId : undefined;
    if (!appointmentId) {
      return res.status(400).json({ success: false, message: "Appointment ID is required" });
    }
    const result = await appointmentService.getDoctorCallToken(appointmentId, doctorId);
    return res.status(200).json({ success: true, data: result });
  } catch (err: any) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
};

/**
 * PATCH /doctor/appointments/:id/end  (or patient)
 */
export const endCall = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const rawId = req.params.id;
    const appointmentId = typeof rawId === "string" ? rawId : undefined;
    if (!appointmentId) {
      return res.status(400).json({
        success: false,
        message: "Appointment ID is required",
      });
    }
    const result = await appointmentService.endCall(appointmentId, userId);
    return res.status(200).json({
      success: true,
      message: "Call ended and appointment marked as completed",
      data: result,
    });
  } catch (err: any) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
};
