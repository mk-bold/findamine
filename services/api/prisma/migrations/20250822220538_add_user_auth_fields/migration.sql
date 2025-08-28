/*
  Warnings:

  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('ADMIN', 'GAME_MASTER', 'PLAYER');

-- First, add columns as nullable
ALTER TABLE "public"."User" ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "isActive" BOOLEAN,
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "password" TEXT,
ADD COLUMN     "role" "public"."UserRole",
ADD COLUMN     "updatedAt" TIMESTAMP(3);

-- Update existing records with default values
UPDATE "public"."User" SET 
  "password" = 'temp_password_hash',
  "role" = 'PLAYER',
  "isActive" = true,
  "updatedAt" = "createdAt";

-- Now make the required columns NOT NULL
ALTER TABLE "public"."User" ALTER COLUMN "password" SET NOT NULL,
ALTER COLUMN "role" SET NOT NULL,
ALTER COLUMN "isActive" SET NOT NULL,
ALTER COLUMN "updatedAt" SET NOT NULL;

-- Set default values for new records
ALTER TABLE "public"."User" ALTER COLUMN "role" SET DEFAULT 'PLAYER';
ALTER TABLE "public"."User" ALTER COLUMN "isActive" SET DEFAULT true;
