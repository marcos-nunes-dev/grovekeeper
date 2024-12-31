/*
  Warnings:

  - You are about to drop the `statistics` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `guildId` to the `GuildStatistics` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GuildStatistics" ADD COLUMN     "guildId" TEXT NOT NULL;

-- DropTable
DROP TABLE "statistics";

-- CreateIndex
CREATE INDEX "GuildStatistics_guildId_idx" ON "GuildStatistics"("guildId");
