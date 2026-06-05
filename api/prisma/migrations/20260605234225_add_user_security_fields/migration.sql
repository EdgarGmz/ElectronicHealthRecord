/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `username` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "confirmation_token" VARCHAR(255),
ADD COLUMN     "confirmation_token_expires" TIMESTAMP(3),
ADD COLUMN     "is_confirmed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "must_change_password" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "reset_password_expires" TIMESTAMP(3),
ADD COLUMN     "reset_password_token" VARCHAR(255),
ADD COLUMN     "username" VARCHAR(50);

-- Populate usernames for existing users before setting NOT NULL
UPDATE "users" SET "username" = 'XochiltVLL' WHERE "email" = 'admin@ehr-system.com';
UPDATE "users" SET "username" = 'EdgarGMZ' WHERE "email" = 'edgar.tiburcio@ehr-system.com';
UPDATE "users" SET "username" = 'OrlandoCSS' WHERE "email" = 'orlando.casas@ehr-system.com';
UPDATE "users" SET "username" = 'CarlosRDR' WHERE "email" = 'carlos.rodriguez@ehr-system.com';
UPDATE "users" SET "username" = 'DanielaGVR' WHERE "email" = 'daniela.guevara@ehr-system.com';

-- Fallback for any other users
UPDATE "users" SET "username" = split_part("email", '@', 1) WHERE "username" IS NULL;

-- Make it NOT NULL
ALTER TABLE "users" ALTER COLUMN "username" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
