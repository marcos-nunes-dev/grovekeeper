/*
  Warnings:

  - You are about to drop the column `eventDate` on the `GuildHistory` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[playerName,guildName]` on the table `GuildHistory` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `firstSeen` to the `GuildHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastSeen` to the `GuildHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `GuildHistory` table without a default value. This is not possible if the table is not empty.

*/
-- First, add the new columns with nullable constraint
ALTER TABLE "GuildHistory" ADD COLUMN "firstSeen" TIMESTAMP(3);
ALTER TABLE "GuildHistory" ADD COLUMN "lastSeen" TIMESTAMP(3);
ALTER TABLE "GuildHistory" ADD COLUMN "updatedAt" TIMESTAMP(3);

-- Update existing rows
UPDATE "GuildHistory" 
SET "firstSeen" = "eventDate",
    "lastSeen" = "eventDate",
    "updatedAt" = "createdAt";

-- Make columns required
ALTER TABLE "GuildHistory" ALTER COLUMN "firstSeen" SET NOT NULL;
ALTER TABLE "GuildHistory" ALTER COLUMN "lastSeen" SET NOT NULL;
ALTER TABLE "GuildHistory" ALTER COLUMN "updatedAt" SET NOT NULL;

-- Drop old column
ALTER TABLE "GuildHistory" DROP COLUMN "eventDate";

-- Drop old index if exists
DROP INDEX IF EXISTS "GuildHistory_eventDate_idx";

-- Add new index
CREATE INDEX "GuildHistory_guildName_idx" ON "GuildHistory"("guildName");

-- Delete duplicates keeping the latest entry
DELETE FROM "GuildHistory" a USING "GuildHistory" b
WHERE a.id < b.id 
  AND a."playerName" = b."playerName" 
  AND a."guildName" = b."guildName";

-- Add unique constraint
CREATE UNIQUE INDEX "GuildHistory_playerName_guildName_key" ON "GuildHistory"("playerName", "guildName");
