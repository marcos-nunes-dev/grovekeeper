-- AlterTable
ALTER TABLE "PlayerCache" ADD COLUMN     "craftingTotal" BIGINT NOT NULL DEFAULT 0,
ADD COLUMN     "gatheringTotal" BIGINT NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "PlayerEvent" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "playerName" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "eventType" TEXT NOT NULL,
    "eventData" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlayerEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PlayerEvent_playerId_timestamp_idx" ON "PlayerEvent"("playerId", "timestamp" DESC);

-- CreateIndex
CREATE INDEX "PlayerEvent_playerName_timestamp_idx" ON "PlayerEvent"("playerName", "timestamp" DESC);
