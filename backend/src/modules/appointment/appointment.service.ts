import { prisma } from "../../config/prisma";
import { RtcTokenBuilder, RtcRole } from "agora-access-token";
import { env } from "../../config/env";
import { BookAppointmentInput } from "./appointment.schema";

// Doctor always joins as UID 1, patient as UID 2
const DOCTOR_UID = 1;
const PATIENT_UID = 2;
const CALL_EXPIRY_SECONDS = 3600; // 1 hour

function generateAgoraToken(channelName: string, uid: number): string {
  const expireTime = Math.floor(Date.now() / 1000) + CALL_EXPIRY_SECONDS;
  return RtcTokenBuilder.buildTokenWithUid(
    env.AGORA_APP_ID,
    env.AGORA_APP_CERTIFICATE,
    channelName,
    uid,
    RtcRole.PUBLISHER,
    expireTime
  );
}

function generateMockPaymentId(): string {
  return `PAY-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
}

/**
 * Get available (unbooked) time slots for a doctor on a given date
 */
export const getDoctorAvailableSlots = async (doctorId: string, date: string) => {
  // Reject dates in the past (compare calendar dates only, not time)
  const today = new Date().toISOString().substring(0, 10);
  if (date < today) {
    throw { status: 400, message: "Cannot fetch slots for a past date" };
  }

  const doctor = await prisma.user.findUnique({
    where: { id: doctorId, role: "DOCTOR" },
    select: { id: true, name: true, email: true, isActive: true, doctorProfile: true },
  });

  if (!doctor) {
    throw { status: 404, message: "Doctor not found" };
  }
  if (!doctor.isActive || doctor.doctorProfile?.approvalStatus !== "APPROVED") {
    throw { status: 403, message: "This doctor is not currently available for bookings" };
  }

  const slots = await prisma.timeSlot.findMany({
    where: { doctorId, date, isBooked: false },
    orderBy: { startTime: "asc" },
  });

  return { doctor, slots };
};

/**
 * Book a time slot, run mock payment, and create an appointment with Agora channel
 */
export const bookAppointment = async (
  patientId: string,
  input: BookAppointmentInput
) => {
  const { timeSlotId, notes } = input;

  // Fetch the slot and validate
  const slot = await prisma.timeSlot.findUnique({
    where: { id: timeSlotId },
    include: {
      doctor: {
        select: { id: true, name: true, email: true, doctorProfile: true },
      },
    },
  });

  if (!slot) {
    throw { status: 404, message: "Time slot not found" };
  }

  // Reject past slots
  const slotDateTime = new Date(`${slot.date}T${slot.startTime}:00`);
  if (slotDateTime < new Date()) {
    throw { status: 400, message: "Cannot book a time slot that is in the past" };
  }

  const consultationFee = slot.doctor.doctorProfile?.consultationFee ?? 0;
  const mockPaymentId = generateMockPaymentId();

  const appointment = await prisma.$transaction(async (tx) => {
    // Atomic check-and-mark: only succeeds if the slot is STILL unbooked.
    // This eliminates the read-then-write race condition where two concurrent
    // requests both read isBooked=false and both proceed to create an appointment.
    const updated = await tx.timeSlot.updateMany({
      where: { id: timeSlotId, isBooked: false },
      data: { isBooked: true },
    });

    if (updated.count === 0) {
      throw { status: 409, message: "This time slot was just booked by someone else. Please choose another slot." };
    }

    // Channel name: unique per appointment using the slot ID
    const channelName = `appt-${timeSlotId.replace(/-/g, "")}`;

    return tx.appointment.create({
      data: {
        timeSlotId,
        patientId,
        doctorId: slot.doctorId,
        paymentStatus: "PAID",
        paymentId: mockPaymentId,
        amount: consultationFee,
        channelName,
        callStatus: "SCHEDULED",
        status: "CONFIRMED",
        notes: notes ?? null,
      },
      include: {
        timeSlot: true,
        doctor: { select: { id: true, name: true, email: true } },
        patient: { select: { id: true, name: true, email: true } },
      },
    });
  });

  return {
    appointment,
    payment: {
      status: "PAID",
      transactionId: mockPaymentId,
      amount: consultationFee,
      currency: "INR",
      message: "Mock payment successful",
    },
  };
};

/**
 * List all appointments for a patient
 */
export const getPatientAppointments = async (patientId: string) => {
  return prisma.appointment.findMany({
    where: { patientId },
    include: {
      timeSlot: true,
      doctor: { select: { id: true, name: true, email: true, doctorProfile: true } },
    },
    orderBy: [{ timeSlot: { date: "asc" } }],
  });
};

/**
 * List all appointments for a doctor
 */
export const getDoctorAppointments = async (doctorId: string) => {
  return prisma.appointment.findMany({
    where: { doctorId },
    include: {
      timeSlot: true,
      patient: { select: { id: true, name: true, email: true, patientProfile: true } },
    },
    orderBy: [{ timeSlot: { date: "asc" } }],
  });
};

/**
 * Get Agora token for a patient to join their appointment call
 */
export const getPatientCallToken = async (appointmentId: string, patientId: string) => {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      timeSlot: true,
      doctor: { select: { id: true, name: true } },
    },
  });

  if (!appointment) {
    throw { status: 404, message: "Appointment not found" };
  }
  if (appointment.patientId !== patientId) {
    throw { status: 403, message: "You are not the patient for this appointment" };
  }
  if (appointment.status === "CANCELLED") {
    throw { status: 400, message: "This appointment has been cancelled" };
  }
  if (appointment.status === "COMPLETED") {
    throw { status: 400, message: "This consultation has already been completed" };
  }

  const token = generateAgoraToken(appointment.channelName, PATIENT_UID);

  // Always mark as IN_PROGRESS when joining (handles re-join after disconnect)
  if (appointment.callStatus !== "IN_PROGRESS") {
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { callStatus: "IN_PROGRESS" },
    });
  }

  return {
    appId: env.AGORA_APP_ID,
    channelName: appointment.channelName,
    token,
    uid: PATIENT_UID,
    role: "patient",
    expiresIn: CALL_EXPIRY_SECONDS,
    appointment: {
      id: appointment.id,
      date: appointment.timeSlot.date,
      startTime: appointment.timeSlot.startTime,
      endTime: appointment.timeSlot.endTime,
      doctor: appointment.doctor,
    },
  };
};

/**
 * Get Agora token for a doctor to join their appointment call
 */
export const getDoctorCallToken = async (appointmentId: string, doctorId: string) => {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      timeSlot: true,
      patient: { select: { id: true, name: true } },
    },
  });

  if (!appointment) {
    throw { status: 404, message: "Appointment not found" };
  }
  if (appointment.doctorId !== doctorId) {
    throw { status: 403, message: "You are not the doctor for this appointment" };
  }
  if (appointment.status === "CANCELLED") {
    throw { status: 400, message: "This appointment has been cancelled" };
  }
  if (appointment.status === "COMPLETED") {
    throw { status: 400, message: "This consultation has already been completed" };
  }

  const token = generateAgoraToken(appointment.channelName, DOCTOR_UID);

  // Always mark as IN_PROGRESS when joining (handles re-join after disconnect)
  if (appointment.callStatus !== "IN_PROGRESS") {
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { callStatus: "IN_PROGRESS" },
    });
  }

  return {
    appId: env.AGORA_APP_ID,
    channelName: appointment.channelName,
    token,
    uid: DOCTOR_UID,
    role: "doctor",
    expiresIn: CALL_EXPIRY_SECONDS,
    appointment: {
      id: appointment.id,
      date: appointment.timeSlot.date,
      startTime: appointment.timeSlot.startTime,
      endTime: appointment.timeSlot.endTime,
      patient: appointment.patient,
    },
  };
};

/**
 * Mark an appointment call as completed
 */
export const endCall = async (appointmentId: string, userId: string) => {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
  });

  if (!appointment) {
    throw { status: 404, message: "Appointment not found" };
  }
  if (appointment.doctorId !== userId && appointment.patientId !== userId) {
    throw { status: 403, message: "Not authorized to end this call" };
  }

  return prisma.appointment.update({
    where: { id: appointmentId },
    data: { callStatus: "COMPLETED", status: "COMPLETED" },
  });
};
