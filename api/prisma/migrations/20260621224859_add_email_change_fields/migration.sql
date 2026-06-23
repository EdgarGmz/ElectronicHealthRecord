-- AlterTable
ALTER TABLE "users" ADD COLUMN     "email_confirmation_token" VARCHAR(255),
ADD COLUMN     "email_confirmation_token_expires" TIMESTAMP(3),
ADD COLUMN     "pending_email" VARCHAR(255);
