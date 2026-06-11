import { prisma } from "./config/prisma";
async function main() {
  console.log("Cleaning database profiles...");
  try {
    await prisma.appointment.deleteMany({});
    await prisma.timeSlot.deleteMany({});
    await prisma.doctorProfile.deleteMany({});
    await prisma.patientProfile.deleteMany({});
    await prisma.user.deleteMany({});
    console.log("Successfully cleaned all tables!");
  } catch (err) {
    console.error("Error cleaning:", err);
  }
}
main();
