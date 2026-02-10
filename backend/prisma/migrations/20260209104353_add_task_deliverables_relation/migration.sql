/*
  Warnings:

  - You are about to drop the `TaskLivrable` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."TaskLivrable" DROP CONSTRAINT "TaskLivrable_taskId_fkey";

-- DropTable
DROP TABLE "public"."TaskLivrable";

-- CreateTable
CREATE TABLE "public"."_TaskDeliverables" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_TaskDeliverables_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_TaskDeliverables_B_index" ON "public"."_TaskDeliverables"("B");

-- AddForeignKey
ALTER TABLE "public"."_TaskDeliverables" ADD CONSTRAINT "_TaskDeliverables_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Deliverable"("deliverableId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_TaskDeliverables" ADD CONSTRAINT "_TaskDeliverables_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Task"("taskId") ON DELETE CASCADE ON UPDATE CASCADE;
