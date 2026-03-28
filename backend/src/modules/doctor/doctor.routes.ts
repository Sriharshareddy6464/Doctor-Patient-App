import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { getProfile, updateProfile, createTimeSlots } from "./doctor.controller";
import { authorize } from "../../middleware/auth.middleware";

const router = Router();

router.get("/profile", authorize("DOCTOR"), asyncHandler(getProfile));
router.put("/profile", authorize("DOCTOR"), asyncHandler(updateProfile));

router.post("/time-slots", authorize("DOCTOR"), asyncHandler(createTimeSlots));

export default router;