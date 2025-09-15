/*
  Warnings:

  - You are about to drop the column `projectType` on the `Project` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Project" DROP COLUMN "projectType";

-- DropEnum
DROP TYPE "public"."PermissionScope";

-- CreateTable
CREATE TABLE "public"."Type" (
    "typeId" SERIAL NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "Type_pkey" PRIMARY KEY ("typeId")
);

-- CreateTable
CREATE TABLE "public"."ProjectType" (
    "projectId" INTEGER NOT NULL,
    "typeId" INTEGER NOT NULL,

    CONSTRAINT "ProjectType_pkey" PRIMARY KEY ("projectId","typeId")
);

-- CreateTable
CREATE TABLE "public"."TypeQuestion" (
    "typeId" INTEGER NOT NULL,
    "questionId" INTEGER NOT NULL,

    CONSTRAINT "TypeQuestion_pkey" PRIMARY KEY ("questionId","typeId")
);

-- CreateTable
CREATE TABLE "public"."Question" (
    "questionId" SERIAL NOT NULL,
    "label" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "numberOfSelectionableOpt" INTEGER,
    "isRelevant" BOOLEAN,
    "hasMultipleOpenResponse" BOOLEAN,
    "shouldMultiply" BOOLEAN,
    "questionIdParent" INTEGER,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("questionId")
);

-- CreateTable
CREATE TABLE "public"."Option" (
    "optionId" SERIAL NOT NULL,
    "label" TEXT NOT NULL,
    "questionId" INTEGER NOT NULL,

    CONSTRAINT "Option_pkey" PRIMARY KEY ("optionId")
);

-- CreateTable
CREATE TABLE "public"."Response" (
    "responseId" SERIAL NOT NULL,
    "label" TEXT,
    "projectId" INTEGER NOT NULL,
    "questionId" INTEGER NOT NULL,
    "optionId" INTEGER,
    "responseIdParent" INTEGER,

    CONSTRAINT "Response_pkey" PRIMARY KEY ("responseId")
);

-- CreateTable
CREATE TABLE "public"."ProjectQuestion" (
    "projectId" INTEGER NOT NULL,
    "questionId" INTEGER NOT NULL,

    CONSTRAINT "ProjectQuestion_pkey" PRIMARY KEY ("projectId","questionId")
);

-- AddForeignKey
ALTER TABLE "public"."ProjectType" ADD CONSTRAINT "ProjectType_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("projectId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProjectType" ADD CONSTRAINT "ProjectType_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "public"."Type"("typeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TypeQuestion" ADD CONSTRAINT "TypeQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."Question"("questionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TypeQuestion" ADD CONSTRAINT "TypeQuestion_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "public"."Type"("typeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Question" ADD CONSTRAINT "Question_questionIdParent_fkey" FOREIGN KEY ("questionIdParent") REFERENCES "public"."Question"("questionId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Option" ADD CONSTRAINT "Option_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."Question"("questionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Response" ADD CONSTRAINT "Response_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("projectId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Response" ADD CONSTRAINT "Response_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."Question"("questionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Response" ADD CONSTRAINT "Response_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "public"."Option"("optionId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Response" ADD CONSTRAINT "Response_responseIdParent_fkey" FOREIGN KEY ("responseIdParent") REFERENCES "public"."Response"("responseId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProjectQuestion" ADD CONSTRAINT "ProjectQuestion_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("projectId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProjectQuestion" ADD CONSTRAINT "ProjectQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."Question"("questionId") ON DELETE RESTRICT ON UPDATE CASCADE;
