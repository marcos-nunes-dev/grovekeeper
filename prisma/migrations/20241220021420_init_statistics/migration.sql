-- CreateTable
CREATE TABLE "statistics" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "deathsAnalyzed" BIGINT NOT NULL DEFAULT 0,
    "silverCalculated" BIGINT NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "statistics_pkey" PRIMARY KEY ("id")
);
