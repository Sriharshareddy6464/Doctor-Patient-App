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

export const approveDoctor = handle(async (req) => adminService.approveDoctor(requireId(req)));

export const rejectDoctor = handle(async (req) => {
  const { reason } = req.body as { reason?: string };
  return adminService.rejectDoctor(requireId(req), reason ?? "");
});

export const deactivateDoctor = handle(async (req) => adminService.deactivateDoctor(requireId(req)));

export const activateDoctor = handle(async (req) => adminService.activateDoctor(requireId(req)));

export const getAllPatients = handle(async () => adminService.getAllPatients());



export const getAllAppointments = handle(async () => adminService.getAllAppointments());

export const cancelAppointment = handle(async (req) => adminService.cancelAppointment(requireId(req)));
