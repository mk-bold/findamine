-- AlterTable
ALTER TABLE "public"."Game" ADD COLUMN     "gameCenterAddress" TEXT,
ADD COLUMN     "gameCenterLat" DOUBLE PRECISION,
ADD COLUMN     "gameCenterLng" DOUBLE PRECISION;
