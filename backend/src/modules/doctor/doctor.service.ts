import { prisma } from "../../config/prisma";
import { UpdateDoctorProfileInput, CreateTimeSlotsInput } from "./doctor.schema";
import { DoctorApprovalStatus } from "@prisma/client";


/**
 * Remove keys with `undefined` values from an object.
 * This is needed because `exactOptionalPropertyTypes` forbids
 * explicitly assigning `undefined` to Prisma input properties.
 */
function stripUndefined<T extends Record<string, unknown>>(obj: T) {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as { [K in keyof T]: Exclude<T[K], undefined> };
}

/**
 * Get doctor profile by userId
 */
export const getDoctorProfile = async (userId: string) => {
  const profile = await prisma.doctorProfile.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      },
    },
  });

  if (!profile) {
    // Return user info with empty profile if profile doesn't exist yet
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw { status: 404, message: "User not found" };
    }

    return {
      user,
      profile: null,
    };
  }

  const { user, ...profileData } = profile;
  return {
    user,
    profile: profileData,
  };
};

/**
 * Update (or create) doctor profile.
 * If the doctor is at NEEDS_DETAILS or REJECTED and submits a licenseNumber,
 * automatically advance their status to PENDING.
 */
export const updateDoctorProfile = async (
  userId: string,
  data: UpdateDoctorProfileInput
) => {
  const cleanData = stripUndefined(data);

  // Fetch current approval status to decide whether to auto-advance to PENDING
  const currentProfile = await prisma.doctorProfile.findUnique({
    where: { userId },
    select: { approvalStatus: true },
  });

  // If doctor is in NEEDS_DETAILS or REJECTED and submits a licenseNumber,
  // automatically move them to PENDING for admin review
  let approvalStatusOverride: DoctorApprovalStatus | undefined;
  if (
    (!currentProfile ||
      currentProfile.approvalStatus === DoctorApprovalStatus.NEEDS_DETAILS ||
      currentProfile.approvalStatus === DoctorApprovalStatus.REJECTED) &&
    data.licenseNumber &&
    data.licenseNumber.trim().length > 0
  ) {
    approvalStatusOverride = DoctorApprovalStatus.PENDING;
  }

  const profile = await prisma.doctorProfile.upsert({
    where: { userId },
    create: {
      userId,
      ...cleanData,
      ...(approvalStatusOverride ? { approvalStatus: approvalStatusOverride } : {}),
    },
    update: {
      ...cleanData,
      ...(approvalStatusOverride ? { approvalStatus: approvalStatusOverride, rejectionReason: null } : {}),
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  const { user, ...profileData } = profile;
  return {
    user,
    profile: profileData,
  };
};

/**
 * Get all doctors visible to patients:
 * Must be APPROVED AND canTakeAppointments = true
 */
export const getAllDoctors = async () => {
  const doctors = await prisma.user.findMany({
    where: {
      role: "DOCTOR",
      isActive: true,
      doctorProfile: {
        approvalStatus: DoctorApprovalStatus.APPROVED,
        canTakeAppointments: true,
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      doctorProfile: true,
    },
  });

  return doctors.map(doctor => {
    const { doctorProfile, ...user } = doctor;
    return {
      user,
      profile: doctorProfile || null,
    };
  });
};

function generateTimeSlots(date: string, startTime: string, endTime: string) {
  const slots = [];
  let currentStartTime = new Date(`${date}T${startTime}:00`);
  const endDateTime = new Date(`${date}T${endTime}:00`);

  while (currentStartTime < endDateTime) {
    const nextTime = new Date(currentStartTime.getTime() + 30 * 60 * 1000);
    if (nextTime > endDateTime) break;
    
    const toHHMM = (d: Date) => {
      const hh = String(d.getHours()).padStart(2, "0");
      const mm = String(d.getMinutes()).padStart(2, "0");
      return `${hh}:${mm}`;
    };

    slots.push({
      date,
      startTime: toHHMM(currentStartTime),
      endTime: toHHMM(nextTime),
    });
    
    currentStartTime = nextTime;
  }
  return slots;
}

/**
 * Configure 30-min time slots for a specific date
 */
export const createDailyTimeSlots = async (userId: string, data: CreateTimeSlotsInput) => {
  // Verify doctor is approved and can take appointments
  const profile = await prisma.doctorProfile.findUnique({
    where: { userId },
    select: { approvalStatus: true, canTakeAppointments: true },
  });

  if (!profile || profile.approvalStatus !== DoctorApprovalStatus.APPROVED) {
    throw { status: 403, message: "Doctor profile must be fully verified to create time slots." };
  }

  if (!profile.canTakeAppointments) {
    throw { status: 403, message: "Appointment booking is not enabled for your account. Please contact admin." };
  }

  const { date, endDate, startTime, endTime } = data;
  
  // Generate list of dates to apply
  const dates: string[] = [];
  if (endDate && endDate !== date) {
    const start = new Date(date);
    const end = new Date(endDate);
    const current = new Date(start);
    // Limit to maximum 30 days to prevent overloading the database
    let count = 0;
    while (current <= end && count < 30) {
      dates.push(current.toISOString().substring(0, 10));
      current.setDate(current.getDate() + 1);
      count++;
    }
  } else {
    dates.push(date);
  }
  
  await prisma.$transaction(async (tx) => {
    for (const d of dates) {
      const newSlotsData = generateTimeSlots(d, startTime, endTime).map(s => ({
        ...s,
        doctorId: userId
      }));

      // Delete unbooked slots for this date
      await tx.timeSlot.deleteMany({
        where: {
          doctorId: userId,
          date: d,
          isBooked: false,
        }
      });

      if (newSlotsData.length > 0) {
        await tx.timeSlot.createMany({
          data: newSlotsData,
          skipDuplicates: true
        });
      }
    }
  });

  return prisma.timeSlot.findMany({
    where: {
      doctorId: userId,
      date: { in: dates }
    },
    orderBy: [
      { date: 'asc' },
      { startTime: 'asc' }
    ]
  });
};
