import { Request, Response } from "express";
import * as patientService from "./patient.service";
import * as doctorService from "../doctor/doctor.service";
import { updatePatientProfileSchema } from "./patient.schema";
import { z } from "zod";

/**
 * Helper: format Zod errors
 */
const formatZodErrors = (error: z.ZodError) => {
  const formatted: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "unknown";
    formatted[key] = issue.message;
  }
  return formatted;
};

/**
 * GET /patient/profile
 * Get the authenticated patient's profile
 */
export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const result = await patientService.getPatientProfile(userId);
    return res.status(200).json({
      success: true,
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
 * PUT /patient/profile
 * Update the authenticated patient's profile
 */
export const updateProfile = async (req: Request, res: Response) => {
  const parsed = updatePatientProfileSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: formatZodErrors(parsed.error),
    });
  }

  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const result = await patientService.updatePatientProfile(userId, parsed.data);
    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
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
 * GET /patient/doctors
 * Get a list of all existing doctors with their details
 */
export const getAllDoctors = async (req: Request, res: Response) => {
  try {
    const doctors = await doctorService.getAllDoctors();
    return res.status(200).json({
      success: true,
      data: doctors,
    });
  } catch (err: any) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
};
