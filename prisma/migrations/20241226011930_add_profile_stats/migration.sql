-- AlterTable
ALTER TABLE "GuildHistory" ALTER COLUMN "firstSeen" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "lastSeen" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "statistics" ADD COLUMN     "playersTracked" BIGINT NOT NULL DEFAULT 0,
ADD COLUMN     "totalPveFame" BIGINT NOT NULL DEFAULT 0,
ADD COLUMN     "totalPvpFame" BIGINT NOT NULL DEFAULT 0;