/*
  Warnings:

  - You are about to drop the column `about` on the `provider_requests` table. All the data in the column will be lost.
  - You are about to drop the column `certificates` on the `provider_requests` table. All the data in the column will be lost.
  - You are about to drop the column `education` on the `provider_requests` table. All the data in the column will be lost.
  - You are about to drop the column `experience` on the `provider_requests` table. All the data in the column will be lost.
  - You are about to drop the column `skills` on the `provider_requests` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `provider_requests` DROP COLUMN `about`,
    DROP COLUMN `certificates`,
    DROP COLUMN `education`,
    DROP COLUMN `experience`,
    DROP COLUMN `skills`,
    ADD COLUMN `address` TEXT NULL,
    ADD COLUMN `availability` JSON NULL,
    ADD COLUMN `background_check_consent` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `base_rate` VARCHAR(100) NULL,
    ADD COLUMN `business_name` VARCHAR(255) NULL,
    ADD COLUMN `business_type` VARCHAR(50) NULL,
    ADD COLUMN `city` VARCHAR(100) NULL,
    ADD COLUMN `company_logo` TEXT NULL,
    ADD COLUMN `contact_method` VARCHAR(50) NULL,
    ADD COLUMN `country` VARCHAR(100) NULL,
    ADD COLUMN `date_of_birth` VARCHAR(50) NULL,
    ADD COLUMN `description` TEXT NULL,
    ADD COLUMN `establishment_year` VARCHAR(4) NULL,
    ADD COLUMN `gender` VARCHAR(20) NULL,
    ADD COLUMN `id_number` VARCHAR(100) NULL,
    ADD COLUMN `id_proof_url` TEXT NULL,
    ADD COLUMN `id_type` VARCHAR(50) NULL,
    ADD COLUMN `licenses` JSON NULL,
    ADD COLUMN `on_site_charges` VARCHAR(100) NULL,
    ADD COLUMN `payment_methods` JSON NULL,
    ADD COLUMN `pricing_type` VARCHAR(50) NULL,
    ADD COLUMN `privacy_accepted` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `qualifications` JSON NULL,
    ADD COLUMN `registration_number` VARCHAR(100) NULL,
    ADD COLUMN `rules_accepted` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `service_areas` JSON NULL,
    ADD COLUMN `service_radius` INTEGER NULL,
    ADD COLUMN `services_offered` JSON NULL,
    ADD COLUMN `state` VARCHAR(100) NULL,
    ADD COLUMN `terms_accepted` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `years_experience` VARCHAR(50) NULL,
    ADD COLUMN `zip_code` VARCHAR(20) NULL,
    MODIFY `profile_photo` TEXT NULL,
    MODIFY `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
