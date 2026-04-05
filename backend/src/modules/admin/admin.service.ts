import { prisma } from "../../config/prisma";

/** Platform-wide stats for the admin overview card */
export const getStats = async () => {
  const [
    totalDoctors,
    activeDoctors,
    pendingApprovals,
    totalPatients,
    totalAppointments,
    confirmedAppointments,
    completedAppointments,
    cancelledAppointments,
    revenue,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "DOCTOR" } }),
    prisma.user.count({ where: { role: "DOCTOR", isActive: true, doctorProfile: { approvalStatus: "APPROVED" } } }),
    prisma.user.count({ where: { role: "DOCTOR", OR: [{ doctorProfile: null }, { doctorProfile: { approvalStatus: "PENDING" } }] } }),
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
    pendingApprovals,
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
          specializations: true,
          experience: true,
          consultationFee: true,
          qualifications: true,
        },
      },
      _count: { select: { doctorAppointments: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

/** Approve a pending doctor — also ensures isActive=true */
export const approveDoctor = async (doctorId: string) => {
  const user = await prisma.user.findUnique({ where: { id: doctorId, role: "DOCTOR" } });
  if (!user) throw { status: 404, message: "Doctor not found" };

  await prisma.$transaction([
    prisma.doctorProfile.upsert({
      where: { userId: doctorId },
      create: { userId: doctorId, approvalStatus: "APPROVED" },
      update: { approvalStatus: "APPROVED", rejectionReason: null },
    }),
    prisma.user.update({ where: { id: doctorId }, data: { isActive: true } }),
  ]);

  return { message: "Doctor approved successfully. They can now log in." };
};

/** Reject a pending doctor with an optional reason */
export const rejectDoctor = async (doctorId: string, reason: string) => {
  const user = await prisma.user.findUnique({ where: { id: doctorId, role: "DOCTOR" } });
  if (!user) throw { status: 404, message: "Doctor not found" };

  await prisma.doctorProfile.upsert({
    where: { userId: doctorId },
    create: { userId: doctorId, approvalStatus: "REJECTED", rejectionReason: reason || null },
    update: { approvalStatus: "REJECTED", rejectionReason: reason || null },
  });

  return { message: "Doctor application rejected." };
};

/** Deactivate a doctor — blocked if they have confirmed appointments or an active call */
export const deactivateDoctor = async (doctorId: string) => {
  const user = await prisma.user.findUnique({ where: { id: doctorId, role: "DOCTOR" } });
  if (!user) throw { status: 404, message: "Doctor not found" };

  // Block if doctor is in an active video call
  const activeCalls = await prisma.appointment.count({
    where: { doctorId, callStatus: "IN_PROGRESS" },
  });
  if (activeCalls > 0) {
    throw { status: 409, message: "Cannot deactivate: Doctor is currently in an active video consultation." };
  }

  // Block if doctor has upcoming confirmed appointments
  const scheduledAppointments = await prisma.appointment.count({
    where: { doctorId, status: "CONFIRMED" },
  });
  if (scheduledAppointments > 0) {
    throw {
      status: 409,
      message: `Cannot deactivate: ${scheduledAppointments} appointment(s) are scheduled with this doctor. Cancel or complete them first.`,
    };
  }

  await prisma.user.update({ where: { id: doctorId }, data: { isActive: false } });
  return { message: "Doctor deactivated. They can no longer log in or appear in searches." };
};

/** Re-activate a previously deactivated doctor */
export const activateDoctor = async (doctorId: string) => {
  const user = await prisma.user.findUnique({ where: { id: doctorId, role: "DOCTOR" } });
  if (!user) throw { status: 404, message: "Doctor not found" };

  await prisma.user.update({ where: { id: doctorId }, data: { isActive: true } });
  return { message: "Doctor reactivated successfully." };
};

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
