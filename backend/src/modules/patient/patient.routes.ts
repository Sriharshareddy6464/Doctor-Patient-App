import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { getProfile, updateProfile, getAllDoctors, getDoctorById } from "./patient.controller";
import {
  getDoctorSlots,
  bookAppointment,
  getPatientAppointments,
  patientJoinCall,
  endCall,
} from "../appointment/appointment.controller";
import { authorize } from "../../middleware/auth.middleware";

const router = Router();

// Profile
router.get("/profile", authorize("PATIENT"), asyncHandler(getProfile));
router.put("/profile", authorize("PATIENT"), asyncHandler(updateProfile));

// Doctor discovery
router.get("/all-doctors", authorize("PATIENT"), asyncHandler(getAllDoctors));
router.get("/doctors/:id", authorize("PATIENT"), asyncHandler(getDoctorById));
router.get("/doctors/:id/slots", authorize("PATIENT"), asyncHandler(getDoctorSlots));

// Appointments
router.post("/appointments", authorize("PATIENT"), asyncHandler(bookAppointment));
router.get("/appointments", authorize("PATIENT"), asyncHandler(getPatientAppointments));
router.get("/appointments/:id/join", authorize("PATIENT"), asyncHandler(patientJoinCall));
router.patch("/appointments/:id/end", authorize("PATIENT"), asyncHandler(endCall));

export default router;
