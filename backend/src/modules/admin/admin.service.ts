import { prisma } from "../../config/prisma";
import { DoctorApprovalStatus } from "@prisma/client";

/** Platform-wide stats for the admin overview card */
export const getStats = async () => {
  const [
    totalDoctors,
    activeDoctors,
    phase1Pending,
    phase2Pending,
    totalPatients,
    totalAppointments,
    confirmedAppointments,
    completedAppointments,
    cancelledAppointments,
    revenue,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "DOCTOR" } }),
    prisma.user.count({
      where: {
        role: "DOCTOR",
        isActive: true,
        doctorProfile: { approvalStatus: DoctorApprovalStatus.PHASE2_APPROVED },
      },
    }),
    prisma.user.count({
      where: {
        role: "DOCTOR",
        doctorProfile: { approvalStatus: DoctorApprovalStatus.PHASE1_PENDING },
      },
    }),
    prisma.user.count({
      where: {
        role: "DOCTOR",
        doctorProfile: { approvalStatus: DoctorApprovalStatus.PHASE2_PENDING },
      },
    }),
    prisma.user.count({ where: { role: "PATIENT" } }),
    prisma.appointment.count(),
    prisma.appointment.count({ where: { status: "CONFIRMED" } }),
    prisma.appointment.count({ where: { status: "COMPLETED" } }),
    prisma.appointment.count({ where: { status: "CANCELLED" } }),
    prisma.appointment.aggregate({ _sum: { amount: true }, where: { paymentStatus: "PAID" } }),
  ]);

  return {
    totalDoctors,
    activeDoctors,
    // Total pending = Phase 1 + Phase 2
    pendingApprovals: phase1Pending + phase2Pending,
    phase1Pending,
    phase2Pending,
    totalPatients,
    totalAppointments,
    confirmedAppointments,
    completedAppointments,
    cancelledAppointments,
    totalRevenue: revenue._sum.amount ?? 0,
  };
};

/** All doctors (including inactive and unapproved) */
export const getAllDoctors = async () => {
  return prisma.user.findMany({
    where: { role: "DOCTOR" },
    select: {
      id: true,
      name: true,
      email: true,
      isActive: true,
      createdAt: true,
      doctorProfile: {
        select: {
          approvalStatus: true,
          rejectionReason: true,
          phase2RejectionReason: true,
          specializations: true,
          experience: true,
          consultationFee: true,
          qualifications: true,
          licenseNumber: true,
          canTakeAppointments: true,
          phone: true,
        },
      },
      _count: { select: { doctorAppointments: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

// ─────────────── PHASE 1 ───────────────

/** Approve Phase 1 — doctor can now log in and submit full profile */
export const approvePhase1 = async (doctorId: string) => {
  const user = await prisma.user.findUnique({ where: { id: doctorId, role: "DOCTOR" } });
  if (!user) throw { status: 404, message: "Doctor not found" };

  const profile = await prisma.doctorProfile.findUnique({ where: { userId: doctorId } });
  if (!profile) throw { status: 404, message: "Doctor profile not found" };
  if (profile.approvalStatus !== DoctorApprovalStatus.PHASE1_PENDING) {
    throw { status: 400, message: "Doctor is not in Phase 1 pending state" };
  }

  await prisma.$transaction([
    prisma.doctorProfile.update({
      where: { userId: doctorId },
      data: { approvalStatus: DoctorApprovalStatus.PHASE1_APPROVED, rejectionReason: null },
    }),
    prisma.user.update({ where: { id: doctorId }, data: { isActive: true } }),
  ]);

  return { message: "Phase 1 approved. Doctor can now log in and submit professional details." };
};

/** Reject Phase 1 — doctor cannot log in */
export const rejectPhase1 = async (doctorId: string, reason: string) => {
  const user = await prisma.user.findUnique({ where: { id: doctorId, role: "DOCTOR" } });
  if (!user) throw { status: 404, message: "Doctor not found" };

  await prisma.doctorProfile.update({
    where: { userId: doctorId },
    data: { approvalStatus: DoctorApprovalStatus.REJECTED, rejectionReason: reason || null },
  });

  return { message: "Doctor Phase 1 application rejected." };
};

// ─────────────── PHASE 2 ───────────────

/** Approve Phase 2 — doctor is fully verified */
export const approvePhase2 = async (doctorId: string) => {
  const user = await prisma.user.findUnique({ where: { id: doctorId, role: "DOCTOR" } });
  if (!user) throw { status: 404, message: "Doctor not found" };

  const profile = await prisma.doctorProfile.findUnique({ where: { userId: doctorId } });
  if (!profile) throw { status: 404, message: "Doctor profile not found" };
  if (profile.approvalStatus !== DoctorApprovalStatus.PHASE2_PENDING) {
    throw { status: 400, message: "Doctor is not in Phase 2 pending state" };
  }

  await prisma.doctorProfile.update({
    where: { userId: doctorId },
    data: { approvalStatus: DoctorApprovalStatus.PHASE2_APPROVED, phase2RejectionReason: null },
  });

  return { message: "Phase 2 approved. Doctor is fully verified. Toggle appointments to allow bookings." };
};

/** Reject Phase 2 — doctor can re-submit their professional details */
export const rejectPhase2 = async (doctorId: string, reason: string) => {
  const user = await prisma.user.findUnique({ where: { id: doctorId, role: "DOCTOR" } });
  if (!user) throw { status: 404, message: "Doctor not found" };

  const profile = await prisma.doctorProfile.findUnique({ where: { userId: doctorId } });
  if (!profile) throw { status: 404, message: "Doctor profile not found" };

  await prisma.doctorProfile.update({
    where: { userId: doctorId },
    data: {
      approvalStatus: DoctorApprovalStatus.PHASE2_REJECTED,
      phase2RejectionReason: reason || null,
    },
  });

  return { message: "Doctor Phase 2 details rejected. They can re-submit their information." };
};

// ─────────────── PHASE 3 ───────────────

/** Toggle whether a doctor can accept appointment bookings (Phase 3 gate) */
export const toggleAppointments = async (doctorId: string, canTake: boolean) => {
  const user = await prisma.user.findUnique({ where: { id: doctorId, role: "DOCTOR" } });
  if (!user) throw { status: 404, message: "Doctor not found" };

  const profile = await prisma.doctorProfile.findUnique({ where: { userId: doctorId } });
  if (!profile) throw { status: 404, message: "Doctor profile not found" };
  if (profile.approvalStatus !== DoctorApprovalStatus.PHASE2_APPROVED) {
    throw { status: 400, message: "Doctor must be Phase 2 approved before toggling appointments" };
  }

  // If disabling, block if there are active calls
  if (!canTake) {
    const activeCalls = await prisma.appointment.count({
      where: { doctorId, callStatus: "IN_PROGRESS" },
    });
    if (activeCalls > 0) {
      throw { status: 409, message: "Cannot disable appointments: Doctor is currently in an active video consultation." };
    }
  }

  await prisma.doctorProfile.update({
    where: { userId: doctorId },
    data: { canTakeAppointments: canTake },
  });

  return {
    message: canTake
      ? "Appointments enabled. Doctor can now receive bookings."
      : "Appointments disabled. Doctor will not receive new bookings.",
  };
};

// ─────────────── ACTIVATE / DEACTIVATE (account ban) ───────────────

/** Deactivate a doctor account (blocks login entirely) */
export const deactivateDoctor = async (doctorId: string) => {
  const user = await prisma.user.findUnique({ where: { id: doctorId, role: "DOCTOR" } });
  if (!user) throw { status: 404, message: "Doctor not found" };

  const activeCalls = await prisma.appointment.count({
    where: { doctorId, callStatus: "IN_PROGRESS" },
  });
  if (activeCalls > 0) {
    throw { status: 409, message: "Cannot deactivate: Doctor is currently in an active video consultation." };
  }

  const scheduledAppointments = await prisma.appointment.count({
    where: { doctorId, status: "CONFIRMED" },
  });
  if (scheduledAppointments > 0) {
    throw {
      status: 409,
      message: `Cannot deactivate: ${scheduledAppointments} appointment(s) are scheduled. Cancel or complete them first.`,
    };
  }

  await prisma.user.update({ where: { id: doctorId }, data: { isActive: false } });
  return { message: "Doctor deactivated. They can no longer log in." };
};

/** Re-activate a previously deactivated doctor account */
export const activateDoctor = async (doctorId: string) => {
  const user = await prisma.user.findUnique({ where: { id: doctorId, role: "DOCTOR" } });
  if (!user) throw { status: 404, message: "Doctor not found" };

  await prisma.user.update({ where: { id: doctorId }, data: { isActive: true } });
  return { message: "Doctor account reactivated successfully." };
};

// ─────────────── PATIENTS ───────────────

/** All patients */
export const getAllPatients = async () => {
  return prisma.user.findMany({
    where: { role: "PATIENT" },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      patientProfile: {
        select: { phone: true, dateOfBirth: true, gender: true, bloodGroup: true },
      },
      _count: { select: { patientAppointments: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

/** All appointments with full relations (admin view) */
export const getAllAppointments = async () => {
  return prisma.appointment.findMany({
    include: {
      timeSlot: true,
      doctor: { select: { id: true, name: true, email: true } },
      patient: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
};

/** Cancel any appointment (admin override) */
export const cancelAppointment = async (appointmentId: string) => {
  const appt = await prisma.appointment.findUnique({ where: { id: appointmentId } });
  if (!appt) throw { status: 404, message: "Appointment not found" };
  if (appt.status !== "CONFIRMED") throw { status: 400, message: "Only CONFIRMED appointments can be cancelled" };

  return prisma.$transaction([
    prisma.appointment.update({ where: { id: appointmentId }, data: { status: "CANCELLED" } }),
    prisma.timeSlot.update({ where: { id: appt.timeSlotId }, data: { isBooked: false } }),
  ]);
};
