/*
  Warnings:

  - You are about to drop the column `clueId` on the `ClueFinding` table. All the data in the column will be lost.
  - You are about to drop the column `question` on the `SurveyResponse` table. All the data in the column will be lost.
  - You are about to drop the `Clue` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GameLocation` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId,gameClueId]` on the table `ClueFinding` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `gameClueId` to the `ClueFinding` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gpsLatitude` to the `ClueFinding` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gpsLongitude` to the `ClueFinding` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gameSurveyId` to the `SurveyResponse` table without a default value. This is not possible if the table is not empty.
  - Added the required column `questionId` to the `SurveyResponse` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."PrizeDelivery" AS ENUM ('IN_PERSON', 'ELECTRONIC');

-- CreateEnum
CREATE TYPE "public"."QuestionType" AS ENUM ('SINGLE_CHOICE', 'MULTIPLE_CHOICE');

-- CreateEnum
CREATE TYPE "public"."PointTrackingMode" AS ENUM ('HISTORICAL', 'REAL_TIME');

-- CreateEnum
CREATE TYPE "public"."TreatmentAssignmentType" AS ENUM ('RANDOM', 'MANUAL', 'AUTO_FUTURE');

-- DropForeignKey
ALTER TABLE "public"."Clue" DROP CONSTRAINT "Clue_gameId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Clue" DROP CONSTRAINT "Clue_locationId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ClueFinding" DROP CONSTRAINT "ClueFinding_clueId_fkey";

-- DropForeignKey
ALTER TABLE "public"."GameLocation" DROP CONSTRAINT "GameLocation_gameId_fkey";

-- DropIndex
DROP INDEX "public"."ClueFinding_userId_clueId_key";

-- AlterTable
ALTER TABLE "public"."ClueFinding" DROP COLUMN "clueId",
ADD COLUMN     "gameClueId" TEXT NOT NULL,
ADD COLUMN     "gpsLatitude" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "gpsLongitude" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "selfiePhoto" TEXT,
ADD COLUMN     "shareFind" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sharePhoto" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."Game" ADD COLUMN     "pointTrackingMode" "public"."PointTrackingMode" NOT NULL DEFAULT 'HISTORICAL';

-- AlterTable
ALTER TABLE "public"."Prize" ADD COLUMN     "delivery" "public"."PrizeDelivery" NOT NULL DEFAULT 'ELECTRONIC';

-- AlterTable
ALTER TABLE "public"."SurveyResponse" DROP COLUMN "question",
ADD COLUMN     "gameSurveyId" TEXT NOT NULL,
ADD COLUMN     "questionId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "bestFindMemory" TEXT,
ADD COLUMN     "degrees" TEXT[],
ADD COLUMN     "education" TEXT[],
ADD COLUMN     "favoritePlayZones" TEXT[],
ADD COLUMN     "hobbies" TEXT[],
ADD COLUMN     "homeCity" TEXT,
ADD COLUMN     "profilePicture" TEXT,
ADD COLUMN     "statusMessage" TEXT,
ADD COLUMN     "workHistory" TEXT[];

-- DropTable
DROP TABLE "public"."Clue";

-- DropTable
DROP TABLE "public"."GameLocation";

-- CreateTable
CREATE TABLE "public"."ClueLocation" (
    "id" TEXT NOT NULL,
    "identifyingName" TEXT NOT NULL,
    "anonymizedName" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "text" TEXT NOT NULL,
    "hint" TEXT,
    "gpsVerificationRadius" DOUBLE PRECISION NOT NULL DEFAULT 1.5,
    "requiresSelfie" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClueLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."GameClue" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "clueLocationId" TEXT NOT NULL,
    "customName" TEXT,
    "customText" TEXT,
    "customHint" TEXT,
    "points" INTEGER NOT NULL DEFAULT 100,
    "releaseTime" TIMESTAMP(3),
    "isReleased" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GameClue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Survey" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Survey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SurveyQuestion" (
    "id" TEXT NOT NULL,
    "surveyId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "type" "public"."QuestionType" NOT NULL,
    "pointScaleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SurveyQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PointScale" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "options" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PointScale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."GameSurvey" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "surveyId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "points" INTEGER NOT NULL DEFAULT 10,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GameSurvey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Team" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isCrossGame" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "gameId" TEXT,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TeamMember" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Badge" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Badge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Treatment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Treatment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."GameTreatment" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "treatmentId" TEXT NOT NULL,
    "assignmentType" "public"."TreatmentAssignmentType" NOT NULL DEFAULT 'RANDOM',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GameTreatment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TreatmentAssignment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gameTreatmentId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TreatmentAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GameClue_gameId_clueLocationId_key" ON "public"."GameClue"("gameId", "clueLocationId");

-- CreateIndex
CREATE UNIQUE INDEX "GameSurvey_gameId_surveyId_key" ON "public"."GameSurvey"("gameId", "surveyId");

-- CreateIndex
CREATE UNIQUE INDEX "TeamMember_teamId_userId_key" ON "public"."TeamMember"("teamId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "GameTreatment_gameId_treatmentId_key" ON "public"."GameTreatment"("gameId", "treatmentId");

-- CreateIndex
CREATE UNIQUE INDEX "TreatmentAssignment_userId_gameTreatmentId_key" ON "public"."TreatmentAssignment"("userId", "gameTreatmentId");

-- CreateIndex
CREATE UNIQUE INDEX "ClueFinding_userId_gameClueId_key" ON "public"."ClueFinding"("userId", "gameClueId");

-- AddForeignKey
ALTER TABLE "public"."GameClue" ADD CONSTRAINT "GameClue_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "public"."Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GameClue" ADD CONSTRAINT "GameClue_clueLocationId_fkey" FOREIGN KEY ("clueLocationId") REFERENCES "public"."ClueLocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ClueFinding" ADD CONSTRAINT "ClueFinding_gameClueId_fkey" FOREIGN KEY ("gameClueId") REFERENCES "public"."GameClue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SurveyQuestion" ADD CONSTRAINT "SurveyQuestion_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "public"."Survey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SurveyQuestion" ADD CONSTRAINT "SurveyQuestion_pointScaleId_fkey" FOREIGN KEY ("pointScaleId") REFERENCES "public"."PointScale"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GameSurvey" ADD CONSTRAINT "GameSurvey_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "public"."Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GameSurvey" ADD CONSTRAINT "GameSurvey_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "public"."Survey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SurveyResponse" ADD CONSTRAINT "SurveyResponse_gameSurveyId_fkey" FOREIGN KEY ("gameSurveyId") REFERENCES "public"."GameSurvey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SurveyResponse" ADD CONSTRAINT "SurveyResponse_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."SurveyQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Team" ADD CONSTRAINT "Team_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "public"."Game"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeamMember" ADD CONSTRAINT "TeamMember_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "public"."Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeamMember" ADD CONSTRAINT "TeamMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Badge" ADD CONSTRAINT "Badge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GameTreatment" ADD CONSTRAINT "GameTreatment_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "public"."Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GameTreatment" ADD CONSTRAINT "GameTreatment_treatmentId_fkey" FOREIGN KEY ("treatmentId") REFERENCES "public"."Treatment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TreatmentAssignment" ADD CONSTRAINT "TreatmentAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TreatmentAssignment" ADD CONSTRAINT "TreatmentAssignment_gameTreatmentId_fkey" FOREIGN KEY ("gameTreatmentId") REFERENCES "public"."GameTreatment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
