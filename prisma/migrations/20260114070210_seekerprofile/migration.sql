/*
  Warnings:

  - You are about to drop the `SeekerProfile` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `SeekerProfile` DROP FOREIGN KEY `SeekerProfile_userId_fkey`;

-- DropTable
DROP TABLE `SeekerProfile`;

-- CreateTable
CREATE TABLE `seeker_profiles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `userType` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(191) NULL,
    `lastName` VARCHAR(191) NULL,
    `idType` VARCHAR(191) NULL,
    `idNumber` VARCHAR(191) NULL,
    `backgroundCheck` BOOLEAN NOT NULL DEFAULT false,
    `businessName` VARCHAR(191) NULL,
    `businessType` VARCHAR(191) NULL,
    `registrationNumber` VARCHAR(191) NULL,
    `establishmentYear` VARCHAR(191) NULL,
    `trnNumber` VARCHAR(191) NULL,
    `businessExpiryDate` VARCHAR(191) NULL,
    `qualifications` JSON NULL,
    `gender` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `seeker_profiles_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `seeker_profiles` ADD CONSTRAINT `seeker_profiles_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
