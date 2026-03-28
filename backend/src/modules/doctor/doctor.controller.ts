import { Request, Response } from "express";
import * as doctorService from "./doctor.service";
import { updateDoctorProfileSchema, createTimeSlotsSchema } from "./doctor.schema";
import { z } from "zod";

const formatZodErrors = (error: z.ZodError) => {
  const formatted: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "unknown";
    formatted[key] = issue.message;
  }
  return formatted;
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const result = await doctorService.getDoctorProfile(userId);
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

export const updateProfile = async (req: Request, res: Response) => {
  const parsed = updateDoctorProfileSchema.safeParse(req.body);

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

    const result = await doctorService.updateDoctorProfile(userId, parsed.data);
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

export const createTimeSlots = async (req: Request, res: Response) => {
  const parsed = createTimeSlotsSchema.safeParse(req.body);

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

    const result = await doctorService.createDailyTimeSlots(userId, parsed.data);
    return res.status(200).json({
      success: true,
      message: "Time slots configured successfully",
      data: result,
    });
  } catch (err: any) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
};
