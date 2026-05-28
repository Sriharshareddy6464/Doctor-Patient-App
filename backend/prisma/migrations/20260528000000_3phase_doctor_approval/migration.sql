-- Migration: 3-phase doctor approval system
-- Adds PHASE1_PENDING, PHASE1_APPROVED, PHASE2_PENDING, PHASE2_APPROVED, PHASE2_REJECTED
-- Migrates existing PENDING -> PHASE1_PENDING, APPROVED -> PHASE2_APPROVED

-- Step 1: Add new enum values to the existing type
ALTER TYPE "DoctorApprovalStatus" ADD VALUE IF NOT EXISTS 'PHASE1_PENDING';
ALTER TYPE "DoctorApprovalStatus" ADD VALUE IF NOT EXISTS 'PHASE1_APPROVED';
ALTER TYPE "DoctorApprovalStatus" ADD VALUE IF NOT EXISTS 'PHASE2_PENDING';
ALTER TYPE "DoctorApprovalStatus" ADD VALUE IF NOT EXISTS 'PHASE2_APPROVED';
ALTER TYPE "DoctorApprovalStatus" ADD VALUE IF NOT EXISTS 'PHASE2_REJECTED';

-- Step 2: Migrate existing data BEFORE removing old values
-- PENDING doctors (awaiting first approval) become PHASE1_PENDING
UPDATE "DoctorProfile" SET "approvalStatus" = 'PHASE1_PENDING' WHERE "approvalStatus" = 'PENDING';

-- APPROVED doctors (already approved) become PHASE2_APPROVED (fully verified)
UPDATE "DoctorProfile" SET "approvalStatus" = 'PHASE2_APPROVED' WHERE "approvalStatus" = 'APPROVED';

-- Step 3: Add new columns to DoctorProfile
ALTER TABLE "DoctorProfile" 
  ADD COLUMN IF NOT EXISTS "licenseNumber" TEXT,
  ADD COLUMN IF NOT EXISTS "phase2RejectionReason" TEXT,
  ADD COLUMN IF NOT EXISTS "canTakeAppointments" BOOLEAN NOT NULL DEFAULT false;

-- Step 4: For already PHASE2_APPROVED doctors, enable appointments (they were already active)
UPDATE "DoctorProfile" SET "canTakeAppointments" = true WHERE "approvalStatus" = 'PHASE2_APPROVED';

-- Step 5: Change the default for approvalStatus to PHASE1_PENDING
ALTER TABLE "DoctorProfile" ALTER COLUMN "approvalStatus" SET DEFAULT 'PHASE1_PENDING';
