/*
  Warnings:

  - The values [PHASE1_PENDING,PHASE1_APPROVED,PHASE2_PENDING,PHASE2_APPROVED,PHASE2_REJECTED] on the enum `DoctorApprovalStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `phase2RejectionReason` on the `DoctorProfile` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "DoctorApprovalStatus_new" AS ENUM ('NEEDS_DETAILS', 'PENDING', 'APPROVED', 'REJECTED');
ALTER TABLE "public"."DoctorProfile" ALTER COLUMN "approvalStatus" DROP DEFAULT;
ALTER TABLE "DoctorProfile" ALTER COLUMN "approvalStatus" TYPE "DoctorApprovalStatus_new" USING ("approvalStatus"::text::"DoctorApprovalStatus_new");
ALTER TYPE "DoctorApprovalStatus" RENAME TO "DoctorApprovalStatus_old";
ALTER TYPE "DoctorApprovalStatus_new" RENAME TO "DoctorApprovalStatus";
DROP TYPE "public"."DoctorApprovalStatus_old";
ALTER TABLE "DoctorProfile" ALTER COLUMN "approvalStatus" SET DEFAULT 'NEEDS_DETAILS';
COMMIT;

-- AlterTable
ALTER TABLE "DoctorProfile" DROP COLUMN "phase2RejectionReason",
ALTER COLUMN "approvalStatus" SET DEFAULT 'NEEDS_DETAILS';
