/*
  Warnings:

  - You are about to drop the `seeker_profiles` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `seeker_profiles` DROP FOREIGN KEY `seeker_profiles_userId_fkey`;

-- DropTable
DROP TABLE `seeker_profiles`;

-- CreateTable
CREATE TABLE `SeekerProfile` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `userType` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(191) NULL,
    `lastName` VARCHAR(191) NULL,
    `idType` VARCHAR(191) NULL,
    `idNumber` VARCHAR(191) NULL,
    `backgroundCheck` BOOLEAN NULL DEFAULT false,
    `qualifications` JSON NULL,
    `businessName` VARCHAR(191) NULL,
    `businessType` VARCHAR(191) NULL,
    `registrationNumber` VARCHAR(191) NULL,
    `establishmentYear` VARCHAR(191) NULL,
    `trnNumber` VARCHAR(191) NULL,
    `businessExpiryDate` VARCHAR(191) NULL,

    UNIQUE INDEX `SeekerProfile_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `SeekerProfile` ADD CONSTRAINT `SeekerProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
