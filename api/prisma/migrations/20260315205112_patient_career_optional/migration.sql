-- DropForeignKey
ALTER TABLE "patients" DROP CONSTRAINT "patients_career_id_fkey";

-- AlterTable
ALTER TABLE "patients" ALTER COLUMN "career_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "patients" ADD CONSTRAINT "patients_career_id_fkey" FOREIGN KEY ("career_id") REFERENCES "careers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Docentes y administrativos no tienen carrera
UPDATE "patients" SET "career_id" = NULL WHERE "patient_type" IN ('faculty', 'administrative');
