import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { getProfile, updateProfile, createTimeSlots } from "./doctor.controller";
import {
  getDoctorAppointments,
  doctorJoinCall,
  endCall,
} from "../appointment/appointment.controller";
import { authorize } from "../../middleware/auth.middleware";

const router = Router();

// Profile
router.get("/profile", authorize("DOCTOR"), asyncHandler(getProfile));
router.put("/profile", authorize("DOCTOR"), asyncHandler(updateProfile));

// Time slots
router.post("/time-slots", authorize("DOCTOR"), asyncHandler(createTimeSlots));

// Appointments
router.get("/appointments", authorize("DOCTOR"), asyncHandler(getDoctorAppointments));
router.get("/appointments/:id/join", authorize("DOCTOR"), asyncHandler(doctorJoinCall));
router.patch("/appointments/:id/end", authorize("DOCTOR"), asyncHandler(endCall));

export default router;