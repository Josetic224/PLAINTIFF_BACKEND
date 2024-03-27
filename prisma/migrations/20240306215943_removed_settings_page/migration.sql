/*
  Warnings:

  - You are about to drop the column `registeredUserId` on the `Contact` table. All the data in the column will be lost.
  - You are about to drop the `Settings` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Contact" DROP CONSTRAINT "Contact_registeredUserId_fkey";

-- DropForeignKey
ALTER TABLE "Settings" DROP CONSTRAINT "Settings_approvedUserId_fkey";

-- AlterTable
ALTER TABLE "Contact" DROP COLUMN "registeredUserId";

-- DropTable
DROP TABLE "Settings";
