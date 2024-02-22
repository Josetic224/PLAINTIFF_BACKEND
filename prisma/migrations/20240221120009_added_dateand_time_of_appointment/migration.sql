/*
  Warnings:

  - You are about to drop the column `DateTimeOfAppointment` on the `cases` table. All the data in the column will be lost.
  - Added the required column `DateOfAppointment` to the `cases` table without a default value. This is not possible if the table is not empty.
  - Added the required column `TimeOfAppointment` to the `cases` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `cases` DROP COLUMN `DateTimeOfAppointment`,
    ADD COLUMN `DateOfAppointment` DATETIME(3) NOT NULL,
    ADD COLUMN `TimeOfAppointment` VARCHAR(191) NOT NULL;
