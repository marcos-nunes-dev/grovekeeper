-- CreateTable
CREATE TABLE "PlayerCache" (
    "id" TEXT NOT NULL,
    "playerName" TEXT NOT NULL,
    "guildName" TEXT,
    "killFame" BIGINT NOT NULL,
    "deathFame" BIGINT NOT NULL,
    "pveTotal" BIGINT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlayerCache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlayerCache_playerName_key" ON "PlayerCache"("playerName");

-- CreateIndex
CREATE INDEX "PlayerCache_playerName_idx" ON "PlayerCache"("playerName");
