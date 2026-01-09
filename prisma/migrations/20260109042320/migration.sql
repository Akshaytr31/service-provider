/*
  Warnings:

  - You are about to drop the column `firstName` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `provider_requests` ADD COLUMN `first_name` VARCHAR(255) NULL,
    ADD COLUMN `last_name` VARCHAR(255) NULL,
    ADD COLUMN `user_type` VARCHAR(20) NULL;

-- AlterTable
ALTER TABLE `users` DROP COLUMN `firstName`,
    DROP COLUMN `lastName`;
