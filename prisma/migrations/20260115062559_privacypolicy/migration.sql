-- AlterTable
ALTER TABLE `SeekerProfile` ADD COLUMN `city` VARCHAR(191) NULL,
    ADD COLUMN `country` VARCHAR(191) NULL,
    ADD COLUMN `state` VARCHAR(191) NULL,
    ADD COLUMN `zipCode` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `privacy_policy` (
    `id` INTEGER NOT NULL DEFAULT 1,
    `content` LONGTEXT NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
