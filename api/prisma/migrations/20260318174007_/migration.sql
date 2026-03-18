-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "from_user_id" UUID;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_from_user_id_fkey" FOREIGN KEY ("from_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
