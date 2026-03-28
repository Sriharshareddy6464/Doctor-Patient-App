import { prisma } from "../../config/prisma";
import { UpdatePatientProfileInput } from "./patient.schema";

/**
 * Get patient profile by userId
 */
export const getPatientProfile = async (userId: string) => {
  const profile = await prisma.patientProfile.findUnique({
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
 * Update (or create) patient profile
 */
export const updatePatientProfile = async (
  userId: string,
  data: UpdatePatientProfileInput
) => {
  // Convert dateOfBirth string to Date object if provided
  const processedData: any = { ...data };
  if (data.dateOfBirth) {
    processedData.dateOfBirth = new Date(data.dateOfBirth);
  }

  const profile = await prisma.patientProfile.upsert({
    where: { userId },
    create: {
      userId,
      ...processedData,
    },
    update: {
      ...processedData,
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
