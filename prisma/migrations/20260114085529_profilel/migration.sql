-- AlterTable
ALTER TABLE `SeekerProfile` ADD COLUMN `acceptedTermsandconditions` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `fieldOfStudy` VARCHAR(191) NULL,
    ADD COLUMN `institution` VARCHAR(191) NULL,
    ADD COLUMN `year` VARCHAR(191) NULL;
