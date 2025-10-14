-- DropForeignKey
ALTER TABLE "public"."Option" DROP CONSTRAINT "Option_questionId_fkey";

-- AddForeignKey
ALTER TABLE "public"."Option" ADD CONSTRAINT "Option_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."Question"("questionId") ON DELETE CASCADE ON UPDATE CASCADE;
