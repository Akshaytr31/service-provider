-- AlterTable
ALTER TABLE `provider_requests` ADD COLUMN `sub_category_id` INTEGER NULL,
    MODIFY `about` VARCHAR(191) NULL,
    MODIFY `education` VARCHAR(191) NULL,
    MODIFY `experience` VARCHAR(191) NULL,
    MODIFY `skills` JSON NULL,
    MODIFY `certificates` JSON NULL;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `dateOfBirth` VARCHAR(50) NULL,
    ADD COLUMN `firstName` VARCHAR(255) NULL,
    ADD COLUMN `languages` TEXT NULL,
    ADD COLUMN `lastName` VARCHAR(255) NULL,
    ADD COLUMN `otp` VARCHAR(10) NULL,
    ADD COLUMN `otpExpiry` DATETIME(3) NULL;
