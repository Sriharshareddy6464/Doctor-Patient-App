import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { getProfile, updateProfile, getAllDoctors, getDoctorById } from "./patient.controller";
import { authorize } from "../../middleware/auth.middleware";

const router = Router();

router.get("/profile", authorize("PATIENT"), asyncHandler(getProfile));
router.put("/profile", authorize("PATIENT"), asyncHandler(updateProfile));
router.get("/all-doctors", authorize("PATIENT"), asyncHandler(getAllDoctors));
router.get("/doctors/:id", authorize("PATIENT"), asyncHandler(getDoctorById));

export default router;
