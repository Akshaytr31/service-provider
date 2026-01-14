-- AlterTable
ALTER TABLE `provider_requests` ADD COLUMN `business_expiry_date` VARCHAR(50) NULL,
    ADD COLUMN `rejection_reason` TEXT NULL,
    ADD COLUMN `trn_number` VARCHAR(100) NULL;

-- CreateTable
CREATE TABLE `seeker_profiles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `userType` VARCHAR(20) NOT NULL,
    `gender` VARCHAR(20) NULL,
    `address` TEXT NULL,
    `education` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `seeker_profiles_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `seeker_profiles` ADD CONSTRAINT `seeker_profiles_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
