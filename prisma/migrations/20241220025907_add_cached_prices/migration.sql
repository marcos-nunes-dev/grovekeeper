-- CreateTable
CREATE TABLE "CachedPrice" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "avgPrice" DOUBLE PRECISION NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CachedPrice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CachedPrice_itemId_key" ON "CachedPrice"("itemId");

-- CreateIndex
CREATE INDEX "CachedPrice_itemId_idx" ON "CachedPrice"("itemId");
