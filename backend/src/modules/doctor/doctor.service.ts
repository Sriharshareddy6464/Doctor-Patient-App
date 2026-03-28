import { prisma } from "../../config/prisma";
import { UpdateDoctorProfileInput } from "./doctor.schema";

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
 * Update (or create) doctor profile
 */
export const updateDoctorProfile = async (
  userId: string,
  data: UpdateDoctorProfileInput
) => {
  const cleanData = stripUndefined(data);
  const profile = await prisma.doctorProfile.upsert({
    where: { userId },
    create: {
      userId,
      ...cleanData,
    },
    update: {
      ...cleanData,
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
 * Get all doctors with their profiles
 */
export const getAllDoctors = async () => {
  const doctors = await prisma.user.findMany({
    where: { role: "DOCTOR" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      doctorProfile: true, // Include the associated profile
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
export const createDailyTimeSlots = async (userId: string, data: any) => {
  const { date, startTime, endTime } = data;
  
  const newSlotsData = generateTimeSlots(date, startTime, endTime).map(s => ({
    ...s,
    doctorId: userId
  }));
  
  await prisma.$transaction(async (tx) => {
    // Delete unbooked slots for this date
    await tx.timeSlot.deleteMany({
      where: {
        doctorId: userId,
        date: date,
        isBooked: false,
      }
    });

    if (newSlotsData.length > 0) {
      await tx.timeSlot.createMany({
        data: newSlotsData,
        skipDuplicates: true
      });
    }
  });

  return prisma.timeSlot.findMany({
    where: {
      doctorId: userId,
      date: date
    },
    orderBy: {
      startTime: 'asc'
    }
  });
};
