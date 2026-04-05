import { Router } from "express";
import * as ctrl from "./admin.controller";

const router = Router();

// Platform stats
router.get("/stats", ctrl.getStats);

// Doctor management
router.get("/doctors", ctrl.getAllDoctors);
router.patch("/doctors/:id/approve", ctrl.approveDoctor);
router.patch("/doctors/:id/reject", ctrl.rejectDoctor);
router.patch("/doctors/:id/activate", ctrl.activateDoctor);
router.patch("/doctors/:id/deactivate", ctrl.deactivateDoctor);

// Patient management
router.get("/patients", ctrl.getAllPatients);

// Appointment management
router.get("/appointments", ctrl.getAllAppointments);
router.patch("/appointments/:id/cancel", ctrl.cancelAppointment);

export default router;
