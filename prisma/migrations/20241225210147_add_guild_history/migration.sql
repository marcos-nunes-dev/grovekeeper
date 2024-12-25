-- DropIndex
DROP INDEX "GuildHistory_guildName_idx";

-- AlterTable
ALTER TABLE "GuildHistory" ALTER COLUMN "firstSeen" DROP DEFAULT,
ALTER COLUMN "lastSeen" DROP DEFAULT;
