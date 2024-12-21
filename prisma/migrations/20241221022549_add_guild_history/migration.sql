/*
  Warnings:

  - You are about to drop the `CachedPrice` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "CachedPrice";

-- CreateTable
CREATE TABLE "GuildHistory" (
    "id" TEXT NOT NULL,
    "playerName" TEXT NOT NULL,
    "guildName" TEXT NOT NULL,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuildHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GuildHistory_playerName_idx" ON "GuildHistory"("playerName");

-- CreateIndex
CREATE INDEX "GuildHistory_eventDate_idx" ON "GuildHistory"("eventDate");
