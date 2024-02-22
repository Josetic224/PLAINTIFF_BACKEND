/*
  Warnings:

  - You are about to drop the column `DateOfAppointment` on the `cases` table. All the data in the column will be lost.
  - Added the required column `DateTimeOfAppointment` to the `cases` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `cases` DROP COLUMN `DateOfAppointment`,
    ADD COLUMN `DateTimeOfAppointment` DATETIME(3) NOT NULL;
