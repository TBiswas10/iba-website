/*
  Warnings:

  - The values [MEMBER] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `tier` on the `Membership` table. All the data in the column will be lost.
  - You are about to drop the column `additionalNotes` on the `Rsvp` table. All the data in the column will be lost.
  - You are about to drop the column `dietaryNotes` on the `Rsvp` table. All the data in the column will be lost.
  - You are about to drop the column `donationIntent` on the `Rsvp` table. All the data in the column will be lost.
  - You are about to drop the column `volunteerInterest` on the `Rsvp` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slug]` on the table `Event` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('ADMIN', 'USER');
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "UserRole_old";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'USER';
COMMIT;

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "slug" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "GalleryItem" ADD COLUMN     "albumId" INTEGER,
ALTER COLUMN "mediaType" SET DEFAULT 'image';

-- AlterTable
ALTER TABLE "Membership" DROP COLUMN "tier";

-- AlterTable
ALTER TABLE "Rsvp" DROP COLUMN "additionalNotes",
DROP COLUMN "dietaryNotes",
DROP COLUMN "donationIntent",
DROP COLUMN "volunteerInterest",
ADD COLUMN     "kidsAges" TEXT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'USER';

-- DropEnum
DROP TYPE "MembershipTier";

-- CreateTable
CREATE TABLE "Album" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "coverUrl" TEXT,
    "eventId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Album_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Album_eventId_idx" ON "Album"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "Event_slug_key" ON "Event"("slug");

-- CreateIndex
CREATE INDEX "GalleryItem_albumId_idx" ON "GalleryItem"("albumId");

-- AddForeignKey
ALTER TABLE "Album" ADD CONSTRAINT "Album_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GalleryItem" ADD CONSTRAINT "GalleryItem_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "Album"("id") ON DELETE SET NULL ON UPDATE CASCADE;
