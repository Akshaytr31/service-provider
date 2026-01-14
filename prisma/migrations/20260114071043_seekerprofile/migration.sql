/*
  Warnings:

  - You are about to alter the column `userType` on the `seeker_profiles` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(20)`.
  - You are about to alter the column `idType` on the `seeker_profiles` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(50)`.
  - You are about to alter the column `idNumber` on the `seeker_profiles` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(100)`.
  - You are about to alter the column `businessType` on the `seeker_profiles` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(50)`.
  - You are about to alter the column `registrationNumber` on the `seeker_profiles` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(100)`.
  - You are about to alter the column `establishmentYear` on the `seeker_profiles` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(4)`.
  - You are about to alter the column `trnNumber` on the `seeker_profiles` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(100)`.
  - You are about to alter the column `businessExpiryDate` on the `seeker_profiles` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(50)`.
  - You are about to alter the column `gender` on the `seeker_profiles` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(20)`.

*/
-- AlterTable
ALTER TABLE `seeker_profiles` MODIFY `userType` VARCHAR(20) NOT NULL,
    MODIFY `firstName` VARCHAR(255) NULL,
    MODIFY `lastName` VARCHAR(255) NULL,
    MODIFY `idType` VARCHAR(50) NULL,
    MODIFY `idNumber` VARCHAR(100) NULL,
    MODIFY `businessName` VARCHAR(255) NULL,
    MODIFY `businessType` VARCHAR(50) NULL,
    MODIFY `registrationNumber` VARCHAR(100) NULL,
    MODIFY `establishmentYear` VARCHAR(4) NULL,
    MODIFY `trnNumber` VARCHAR(100) NULL,
    MODIFY `businessExpiryDate` VARCHAR(50) NULL,
    MODIFY `gender` VARCHAR(20) NULL,
    MODIFY `address` TEXT NULL;
