import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes";
import doctorRoutes from "../modules/doctor/doctor.routes";
import patientRoutes from "../modules/patient/patient.routes";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.use("/auth", authRoutes);

router.use("/doctor", authenticate, doctorRoutes);
router.use("/patient", authenticate, patientRoutes);

export default router;