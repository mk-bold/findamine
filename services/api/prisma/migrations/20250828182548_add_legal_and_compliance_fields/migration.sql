-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "agreedToPrivacy" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "agreedToTerms" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "dateOfBirth" TIMESTAMP(3),
ADD COLUMN     "isPaidUser" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "privacyVersion" TEXT,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "termsVersion" TEXT;
