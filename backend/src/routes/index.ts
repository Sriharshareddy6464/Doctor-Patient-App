import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes";
import doctorRoutes from "../modules/doctor/doctor.routes";
import patientRoutes from "../modules/patient/patient.routes";
import adminRoutes from "../modules/admin/admin.routes";
import { authenticate, authorize } from "../middleware/auth.middleware";

const router = Router();

router.use("/auth", authRoutes);

router.use("/doctor", authenticate, authorize("DOCTOR"), doctorRoutes);
router.use("/patient", authenticate, authorize("PATIENT"), patientRoutes);
router.use("/admin", authenticate, authorize("ADMIN"), adminRoutes);

export default router;