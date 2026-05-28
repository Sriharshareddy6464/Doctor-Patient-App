import { Request, Response } from "express";
import * as adminService from "./admin.service";

const handle =
  (fn: (req: Request, res: Response) => Promise<unknown>) =>
  async (req: Request, res: Response) => {
    try {
      const result = await fn(req, res);
      res.status(200).json({ success: true, data: result });
    } catch (err: unknown) {
      const e = err as { status?: number; message?: string };
      res.status(e.status ?? 500).json({ success: false, message: e.message ?? "Internal server error" });
    }
  };

export const getStats = handle(async () => adminService.getStats());

export const getAllDoctors = handle(async () => adminService.getAllDoctors());

const requireId = (req: Request): string => {
  const id = req.params.id;
  if (typeof id !== "string") throw { status: 400, message: "Invalid ID" };
  return id;
};

// ── Phase 1 ──
export const approvePhase1 = handle(async (req) => adminService.approvePhase1(requireId(req)));

export const rejectPhase1 = handle(async (req) => {
  const { reason } = req.body as { reason?: string };
  return adminService.rejectPhase1(requireId(req), reason ?? "");
});

// ── Phase 2 ──
export const approvePhase2 = handle(async (req) => adminService.approvePhase2(requireId(req)));

export const rejectPhase2 = handle(async (req) => {
  const { reason } = req.body as { reason?: string };
  return adminService.rejectPhase2(requireId(req), reason ?? "");
});

// ── Phase 3 ──
export const toggleAppointments = handle(async (req) => {
  const { canTake } = req.body as { canTake: boolean };
  if (typeof canTake !== "boolean") throw { status: 400, message: "canTake must be a boolean" };
  return adminService.toggleAppointments(requireId(req), canTake);
});

// ── Account management ──
export const deactivateDoctor = handle(async (req) => adminService.deactivateDoctor(requireId(req)));
export const activateDoctor = handle(async (req) => adminService.activateDoctor(requireId(req)));

// ── Patients ──
export const getAllPatients = handle(async () => adminService.getAllPatients());

// ── Appointments ──
export const getAllAppointments = handle(async () => adminService.getAllAppointments());
export const cancelAppointment = handle(async (req) => adminService.cancelAppointment(requireId(req)));
