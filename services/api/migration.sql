-- AlterEnum
BEGIN;
CREATE TYPE "public"."UserRole_new" AS ENUM ('ADMIN', 'GAME_MASTER', 'PLAYER');
ALTER TABLE "public"."User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "public"."User" ALTER COLUMN "role" TYPE "public"."UserRole_new" USING ("role"::text::"public"."UserRole_new");
ALTER TYPE "public"."UserRole" RENAME TO "UserRole_old";
ALTER TYPE "public"."UserRole_new" RENAME TO "UserRole";
DROP TYPE "public"."UserRole_old";
ALTER TABLE "public"."User" ALTER COLUMN "role" SET DEFAULT 'PLAYER';
COMMIT;

-- DropIndex
DROP INDEX "public"."Game_gameCode_key";

-- AlterTable
ALTER TABLE "public"."Game" DROP COLUMN "entryFee",
DROP COLUMN "gameCenterAddress",
DROP COLUMN "gameCenterLat",
DROP COLUMN "gameCenterLng",
DROP COLUMN "gameCode",
DROP COLUMN "isPublic",
DROP COLUMN "maxPlayers",
DROP COLUMN "prizeDelivery",
DROP COLUMN "prizeDistribution",
DROP COLUMN "prizePool",
DROP COLUMN "prizeType",
DROP COLUMN "rules";

-- AlterTable
ALTER TABLE "public"."GameClue" ADD COLUMN     "customName" TEXT;

-- AlterTable
ALTER TABLE "public"."GamePhoto" DROP COLUMN "order";

