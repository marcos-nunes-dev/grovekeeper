-- CreateTable
CREATE TABLE "statistics" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "deathsAnalyzed" BIGINT NOT NULL DEFAULT 0,
    "silverCalculated" BIGINT NOT NULL DEFAULT 0,
    "playersTracked" BIGINT NOT NULL DEFAULT 0,
    "totalPveFame" BIGINT NOT NULL DEFAULT 0,
    "totalPvpFame" BIGINT NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "statistics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuildHistory" (
    "id" TEXT NOT NULL,
    "playerName" TEXT NOT NULL,
    "guildName" TEXT NOT NULL,
    "firstSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuildHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerCache" (
    "id" TEXT NOT NULL,
    "playerName" TEXT NOT NULL,
    "guildName" TEXT,
    "killFame" BIGINT NOT NULL,
    "deathFame" BIGINT NOT NULL,
    "pveTotal" BIGINT NOT NULL,
    "gatheringTotal" BIGINT NOT NULL DEFAULT 0,
    "craftingTotal" BIGINT NOT NULL DEFAULT 0,
    "hasDeepSearch" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlayerCache_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "discordId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Build" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "class" TEXT,
    "content" TEXT,
    "difficulty" TEXT,
    "costTier" TEXT,
    "instructions" TEXT,
    "status" TEXT NOT NULL,
    "equipment" JSONB NOT NULL,
    "spells" JSONB NOT NULL,
    "swaps" JSONB NOT NULL,
    "authorId" TEXT NOT NULL,
    "classSectionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Build_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassSection" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "compositionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClassSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Composition" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contentType" TEXT,
    "description" TEXT,
    "tags" TEXT[],
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Composition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuildStatistics" (
    "id" SERIAL NOT NULL,
    "guildName" TEXT NOT NULL,
    "month" TIMESTAMP(3) NOT NULL,
    "minGP" INTEGER NOT NULL,
    "guildSize" INTEGER NOT NULL DEFAULT 0,
    "killFame" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "deathFame" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "averageAttendance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "dpsKillDeathRatio" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tankKillDeathRatio" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "healerKillDeathRatio" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "supportKillDeathRatio" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "utilityKillDeathRatio" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "dpsAverageIP" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tankAverageIP" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "healerAverageIP" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "supportAverageIP" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "utilityAverageIP" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "dpsKillContribution" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tankKillContribution" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "healerKillContribution" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "supportKillContribution" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "utilityKillContribution" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "dpsTotalDamage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tankTotalDamage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "healerTotalDamage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "supportTotalDamage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "utilityTotalDamage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "dpsTotalHealing" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tankTotalHealing" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "healerTotalHealing" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "supportTotalHealing" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "utilityTotalHealing" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "dpsTotalFame" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tankTotalFame" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "healerTotalFame" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "supportTotalFame" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "utilityTotalFame" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuildStatistics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GuildHistory_playerName_idx" ON "GuildHistory"("playerName");

-- CreateIndex
CREATE INDEX "GuildHistory_guildName_idx" ON "GuildHistory"("guildName");

-- CreateIndex
CREATE UNIQUE INDEX "GuildHistory_playerName_guildName_key" ON "GuildHistory"("playerName", "guildName");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerCache_playerName_key" ON "PlayerCache"("playerName");

-- CreateIndex
CREATE INDEX "PlayerCache_playerName_idx" ON "PlayerCache"("playerName");

-- CreateIndex
CREATE INDEX "PlayerEvent_playerId_timestamp_idx" ON "PlayerEvent"("playerId", "timestamp" DESC);

-- CreateIndex
CREATE INDEX "PlayerEvent_playerName_timestamp_idx" ON "PlayerEvent"("playerName", "timestamp" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_discordId_key" ON "User"("discordId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE INDEX "Build_authorId_idx" ON "Build"("authorId");

-- CreateIndex
CREATE INDEX "Build_classSectionId_idx" ON "Build"("classSectionId");

-- CreateIndex
CREATE INDEX "ClassSection_compositionId_idx" ON "ClassSection"("compositionId");

-- CreateIndex
CREATE INDEX "Composition_authorId_idx" ON "Composition"("authorId");

-- CreateIndex
CREATE INDEX "GuildStatistics_guildName_idx" ON "GuildStatistics"("guildName");

-- CreateIndex
CREATE INDEX "GuildStatistics_month_idx" ON "GuildStatistics"("month");

-- CreateIndex
CREATE INDEX "GuildStatistics_minGP_idx" ON "GuildStatistics"("minGP");

-- CreateIndex
CREATE UNIQUE INDEX "GuildStatistics_guildName_month_minGP_key" ON "GuildStatistics"("guildName", "month", "minGP");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Build" ADD CONSTRAINT "Build_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Build" ADD CONSTRAINT "Build_classSectionId_fkey" FOREIGN KEY ("classSectionId") REFERENCES "ClassSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassSection" ADD CONSTRAINT "ClassSection_compositionId_fkey" FOREIGN KEY ("compositionId") REFERENCES "Composition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Composition" ADD CONSTRAINT "Composition_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
