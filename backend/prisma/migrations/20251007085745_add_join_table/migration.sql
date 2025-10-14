/*
  Warnings:

  - You are about to drop the `ProjectQuestion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProjectType` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TypeQuestion` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."ProjectQuestion" DROP CONSTRAINT "ProjectQuestion_projectId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ProjectQuestion" DROP CONSTRAINT "ProjectQuestion_questionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ProjectType" DROP CONSTRAINT "ProjectType_projectId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ProjectType" DROP CONSTRAINT "ProjectType_typeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TypeQuestion" DROP CONSTRAINT "TypeQuestion_questionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TypeQuestion" DROP CONSTRAINT "TypeQuestion_typeId_fkey";

-- DropTable
DROP TABLE "public"."ProjectQuestion";

-- DropTable
DROP TABLE "public"."ProjectType";

-- DropTable
DROP TABLE "public"."TypeQuestion";

-- CreateTable
CREATE TABLE "public"."_ProjectType" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ProjectType_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_ProjectQuestion" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ProjectQuestion_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_TypeQuestion" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_TypeQuestion_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ProjectType_B_index" ON "public"."_ProjectType"("B");

-- CreateIndex
CREATE INDEX "_ProjectQuestion_B_index" ON "public"."_ProjectQuestion"("B");

-- CreateIndex
CREATE INDEX "_TypeQuestion_B_index" ON "public"."_TypeQuestion"("B");

-- AddForeignKey
ALTER TABLE "public"."_ProjectType" ADD CONSTRAINT "_ProjectType_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Project"("projectId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ProjectType" ADD CONSTRAINT "_ProjectType_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Type"("typeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ProjectQuestion" ADD CONSTRAINT "_ProjectQuestion_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Project"("projectId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ProjectQuestion" ADD CONSTRAINT "_ProjectQuestion_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Question"("questionId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_TypeQuestion" ADD CONSTRAINT "_TypeQuestion_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Question"("questionId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_TypeQuestion" ADD CONSTRAINT "_TypeQuestion_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Type"("typeId") ON DELETE CASCADE ON UPDATE CASCADE;
