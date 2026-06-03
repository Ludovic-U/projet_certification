/*
  Warnings:

  - You are about to drop the column `clientType` on the `Client` table. All the data in the column will be lost.
  - The primary key for the `Mindmap` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `mindmap_id` on the `Mindmap` table. All the data in the column will be lost.
  - You are about to drop the column `hasMultipleOpenResponse` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `isRelevant` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `shouldMultiply` on the `Question` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[label]` on the table `Type` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `keyword` to the `Question` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Action" DROP CONSTRAINT "Action_projectId_fkey";

-- DropForeignKey
ALTER TABLE "public"."FinanceurProjet" DROP CONSTRAINT "FinanceurProjet_projectId_fkey";

-- DropForeignKey
ALTER TABLE "public"."MindmapEdge" DROP CONSTRAINT "MindmapEdge_mindmap_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."MindmapNode" DROP CONSTRAINT "MindmapNode_mindmap_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Response" DROP CONSTRAINT "Response_projectId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Task" DROP CONSTRAINT "Task_project_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Version" DROP CONSTRAINT "Version_project_id_fkey";

-- DropIndex
DROP INDEX "public"."ProjectDecision_board_type_idx";

-- AlterTable
ALTER TABLE "public"."Action" ADD COLUMN     "progress" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."Client" DROP COLUMN "clientType",
ADD COLUMN     "secteur" TEXT,
ADD COLUMN     "statusJuridique" TEXT;

-- AlterTable
ALTER TABLE "public"."Mindmap" DROP CONSTRAINT "Mindmap_pkey",
DROP COLUMN "mindmap_id",
ADD COLUMN     "mindmapId" SERIAL NOT NULL,
ADD CONSTRAINT "Mindmap_pkey" PRIMARY KEY ("mindmapId");

-- AlterTable
ALTER TABLE "public"."Project" ADD COLUMN     "goNogo" TEXT;

-- AlterTable
ALTER TABLE "public"."ProjectDecision" ALTER COLUMN "board_type" SET DATA TYPE TEXT,
ALTER COLUMN "decision_type" SET DATA TYPE TEXT,
ALTER COLUMN "decision_finale" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "public"."Question" DROP COLUMN "hasMultipleOpenResponse",
DROP COLUMN "isRelevant",
DROP COLUMN "shouldMultiply",
ADD COLUMN     "keyword" TEXT NOT NULL,
ADD COLUMN     "onglet" TEXT NOT NULL DEFAULT 'analyse_existant',
ADD COLUMN     "questionCategoryQuestionCategoryId" INTEGER,
ALTER COLUMN "category" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."Response" ADD COLUMN     "keyword" TEXT;

-- AlterTable
ALTER TABLE "public"."SubAction" ADD COLUMN     "progress" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."Task" ADD COLUMN     "budget" TEXT,
ADD COLUMN     "color" TEXT NOT NULL DEFAULT '#3b82f6';

-- AlterTable
ALTER TABLE "public"."TaskDeliverableStatus" ADD COLUMN     "confirmed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "confirmedAt" TIMESTAMP(3),
ADD COLUMN     "fileName" TEXT,
ADD COLUMN     "fileUrl" TEXT;

-- AlterTable
ALTER TABLE "public"."User" ALTER COLUMN "email" DROP NOT NULL;

-- CreateTable
CREATE TABLE "public"."QuestionCategory" (
    "questionCategoryId" SERIAL NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "QuestionCategory_pkey" PRIMARY KEY ("questionCategoryId")
);

-- CreateTable
CREATE TABLE "public"."ProjectImpact" (
    "impact_id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "row_order" INTEGER NOT NULL DEFAULT 0,
    "resultats_attendus" TEXT,
    "criteres" TEXT,
    "indicateurs" TEXT,
    "situation_depart" TEXT,
    "objectif" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectImpact_pkey" PRIMARY KEY ("impact_id")
);

-- CreateTable
CREATE TABLE "public"."IdeationChatBotMistral" (
    "chatbotId" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "chatSummary" TEXT,
    "lastMessages" TEXT,

    CONSTRAINT "IdeationChatBotMistral_pkey" PRIMARY KEY ("chatbotId")
);

-- CreateTable
CREATE TABLE "public"."TutorialPage" (
    "tutorialId" SERIAL NOT NULL,
    "pageName" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TutorialPage_pkey" PRIMARY KEY ("tutorialId")
);

-- CreateTable
CREATE TABLE "public"."UserTutorialView" (
    "viewId" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "tutorialId" INTEGER NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "UserTutorialView_pkey" PRIMARY KEY ("viewId")
);

-- CreateTable
CREATE TABLE "public"."_IdeationRemainingQuestions" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_IdeationRemainingQuestions_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "QuestionCategory_label_key" ON "public"."QuestionCategory"("label");

-- CreateIndex
CREATE INDEX "ProjectImpact_project_id_idx" ON "public"."ProjectImpact"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "IdeationChatBotMistral_projectId_key" ON "public"."IdeationChatBotMistral"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "TutorialPage_pageName_key" ON "public"."TutorialPage"("pageName");

-- CreateIndex
CREATE INDEX "UserTutorialView_userId_idx" ON "public"."UserTutorialView"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserTutorialView_userId_tutorialId_key" ON "public"."UserTutorialView"("userId", "tutorialId");

-- CreateIndex
CREATE INDEX "_IdeationRemainingQuestions_B_index" ON "public"."_IdeationRemainingQuestions"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Type_label_key" ON "public"."Type"("label");

-- AddForeignKey
ALTER TABLE "public"."FinanceurProjet" ADD CONSTRAINT "FinanceurProjet_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("projectId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Action" ADD CONSTRAINT "Action_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("projectId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Task" ADD CONSTRAINT "Task_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."Project"("projectId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Version" ADD CONSTRAINT "Version_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."Project"("projectId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Question" ADD CONSTRAINT "Question_questionCategoryQuestionCategoryId_fkey" FOREIGN KEY ("questionCategoryQuestionCategoryId") REFERENCES "public"."QuestionCategory"("questionCategoryId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Response" ADD CONSTRAINT "Response_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("projectId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MindmapNode" ADD CONSTRAINT "MindmapNode_mindmap_id_fkey" FOREIGN KEY ("mindmap_id") REFERENCES "public"."Mindmap"("mindmapId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MindmapEdge" ADD CONSTRAINT "MindmapEdge_mindmap_id_fkey" FOREIGN KEY ("mindmap_id") REFERENCES "public"."Mindmap"("mindmapId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProjectImpact" ADD CONSTRAINT "ProjectImpact_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."Project"("projectId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."IdeationChatBotMistral" ADD CONSTRAINT "IdeationChatBotMistral_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("projectId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserTutorialView" ADD CONSTRAINT "UserTutorialView_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserTutorialView" ADD CONSTRAINT "UserTutorialView_tutorialId_fkey" FOREIGN KEY ("tutorialId") REFERENCES "public"."TutorialPage"("tutorialId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_IdeationRemainingQuestions" ADD CONSTRAINT "_IdeationRemainingQuestions_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."IdeationChatBotMistral"("chatbotId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_IdeationRemainingQuestions" ADD CONSTRAINT "_IdeationRemainingQuestions_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Question"("questionId") ON DELETE CASCADE ON UPDATE CASCADE;
