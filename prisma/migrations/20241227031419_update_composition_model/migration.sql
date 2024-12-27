/*
  Warnings:

  - You are about to drop the column `compositionId` on the `Build` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `Build` table. All the data in the column will be lost.
  - You are about to drop the column `purpose` on the `Composition` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Build" DROP CONSTRAINT "Build_compositionId_fkey";

-- DropIndex
DROP INDEX "Build_compositionId_idx";

-- AlterTable
ALTER TABLE "Build" DROP COLUMN "compositionId",
DROP COLUMN "role",
ADD COLUMN     "class" TEXT,
ADD COLUMN     "classSectionId" TEXT;

-- AlterTable
ALTER TABLE "Composition" DROP COLUMN "purpose",
ADD COLUMN     "contentType" TEXT;

-- CreateTable
CREATE TABLE "ClassSection" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "compositionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClassSection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClassSection_compositionId_idx" ON "ClassSection"("compositionId");

-- CreateIndex
CREATE INDEX "Build_classSectionId_idx" ON "Build"("classSectionId");

-- AddForeignKey
ALTER TABLE "Build" ADD CONSTRAINT "Build_classSectionId_fkey" FOREIGN KEY ("classSectionId") REFERENCES "ClassSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassSection" ADD CONSTRAINT "ClassSection_compositionId_fkey" FOREIGN KEY ("compositionId") REFERENCES "Composition"("id") ON DELETE CASCADE ON UPDATE CASCADE;
