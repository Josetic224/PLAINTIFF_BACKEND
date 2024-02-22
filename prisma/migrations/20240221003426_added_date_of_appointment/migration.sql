/*
  Warnings:

  - Added the required column `DateOfAppointment` to the `cases` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `cases` ADD COLUMN `DateOfAppointment` DATETIME(3) NOT NULL;
