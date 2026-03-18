-- AlterTable
ALTER TABLE "therapy_sessions" ADD COLUMN     "cancellation_reason" VARCHAR(255),
ADD COLUMN     "reschedule_reason" VARCHAR(255),
ADD COLUMN     "status" VARCHAR(20) NOT NULL DEFAULT 'scheduled';
