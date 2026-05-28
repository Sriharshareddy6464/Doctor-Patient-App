/*
  Warnings:

  - The values [PENDING,APPROVED] on the enum `DoctorApprovalStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "DoctorApprovalStatus_new" AS ENUM ('PHASE1_PENDING', 'PHASE1_APPROVED', 'REJECTED', 'PHASE2_PENDING', 'PHASE2_APPROVED', 'PHASE2_REJECTED');
ALTER TABLE "public"."DoctorProfile" ALTER COLUMN "approvalStatus" DROP DEFAULT;
ALTER TABLE "DoctorProfile" ALTER COLUMN "approvalStatus" TYPE "DoctorApprovalStatus_new" USING ("approvalStatus"::text::"DoctorApprovalStatus_new");
ALTER TYPE "DoctorApprovalStatus" RENAME TO "DoctorApprovalStatus_old";
ALTER TYPE "DoctorApprovalStatus_new" RENAME TO "DoctorApprovalStatus";
DROP TYPE "public"."DoctorApprovalStatus_old";
ALTER TABLE "DoctorProfile" ALTER COLUMN "approvalStatus" SET DEFAULT 'PHASE1_PENDING';
COMMIT;
