-- DropForeignKey
ALTER TABLE "public"."Task" DROP CONSTRAINT "Task_sub_action_id_fkey";

-- AlterTable
ALTER TABLE "public"."Task" ADD COLUMN     "details" TEXT,
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "files" TEXT[],
ADD COLUMN     "goal" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "parentId" INTEGER,
ADD COLUMN     "progress" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "startDate" TIMESTAMP(3),
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'task',
ADD COLUMN     "version_id" INTEGER,
ALTER COLUMN "sub_action_id" DROP NOT NULL;

-- CreateTable
CREATE TABLE "public"."TaskLink" (
    "linkId" SERIAL NOT NULL,
    "source" INTEGER NOT NULL,
    "target" INTEGER NOT NULL,
    "type" INTEGER NOT NULL DEFAULT 0,
    "versionId" INTEGER,

    CONSTRAINT "TaskLink_pkey" PRIMARY KEY ("linkId")
);

-- CreateTable
CREATE TABLE "public"."TaskLivrable" (
    "livrableId" SERIAL NOT NULL,
    "taskId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "dueDate" TIMESTAMP(3),
    "completed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "TaskLivrable_pkey" PRIMARY KEY ("livrableId")
);

-- CreateTable
CREATE TABLE "public"."TaskExpense" (
    "expenseId" SERIAL NOT NULL,
    "taskId" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "vendor" TEXT,

    CONSTRAINT "TaskExpense_pkey" PRIMARY KEY ("expenseId")
);

-- CreateTable
CREATE TABLE "public"."TaskAssigneeDetail" (
    "id" SERIAL NOT NULL,
    "taskId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "allocation" INTEGER NOT NULL DEFAULT 100,

    CONSTRAINT "TaskAssigneeDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TaskDeliverableStatus" (
    "id" SERIAL NOT NULL,
    "taskId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "completedAt" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "TaskDeliverableStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Version" (
    "versionId" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Version_pkey" PRIMARY KEY ("versionId")
);

-- CreateIndex
CREATE INDEX "TaskLink_source_idx" ON "public"."TaskLink"("source");

-- CreateIndex
CREATE INDEX "TaskLink_target_idx" ON "public"."TaskLink"("target");

-- CreateIndex
CREATE INDEX "TaskLink_versionId_idx" ON "public"."TaskLink"("versionId");

-- CreateIndex
CREATE INDEX "TaskLivrable_taskId_idx" ON "public"."TaskLivrable"("taskId");

-- CreateIndex
CREATE INDEX "TaskExpense_taskId_idx" ON "public"."TaskExpense"("taskId");

-- CreateIndex
CREATE INDEX "TaskAssigneeDetail_taskId_idx" ON "public"."TaskAssigneeDetail"("taskId");

-- CreateIndex
CREATE INDEX "TaskAssigneeDetail_userId_idx" ON "public"."TaskAssigneeDetail"("userId");

-- CreateIndex
CREATE INDEX "TaskDeliverableStatus_taskId_idx" ON "public"."TaskDeliverableStatus"("taskId");

-- CreateIndex
CREATE INDEX "Version_project_id_idx" ON "public"."Version"("project_id");

-- CreateIndex
CREATE INDEX "Task_version_id_idx" ON "public"."Task"("version_id");

-- CreateIndex
CREATE INDEX "Task_parentId_idx" ON "public"."Task"("parentId");

-- AddForeignKey
ALTER TABLE "public"."Task" ADD CONSTRAINT "Task_sub_action_id_fkey" FOREIGN KEY ("sub_action_id") REFERENCES "public"."SubAction"("subActionId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Task" ADD CONSTRAINT "Task_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."Project"("projectId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Task" ADD CONSTRAINT "Task_version_id_fkey" FOREIGN KEY ("version_id") REFERENCES "public"."Version"("versionId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Task" ADD CONSTRAINT "Task_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."Task"("taskId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TaskLink" ADD CONSTRAINT "TaskLink_source_fkey" FOREIGN KEY ("source") REFERENCES "public"."Task"("taskId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TaskLink" ADD CONSTRAINT "TaskLink_target_fkey" FOREIGN KEY ("target") REFERENCES "public"."Task"("taskId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TaskLink" ADD CONSTRAINT "TaskLink_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "public"."Version"("versionId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TaskLivrable" ADD CONSTRAINT "TaskLivrable_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "public"."Task"("taskId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TaskExpense" ADD CONSTRAINT "TaskExpense_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "public"."Task"("taskId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TaskAssigneeDetail" ADD CONSTRAINT "TaskAssigneeDetail_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "public"."Task"("taskId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TaskAssigneeDetail" ADD CONSTRAINT "TaskAssigneeDetail_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TaskDeliverableStatus" ADD CONSTRAINT "TaskDeliverableStatus_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "public"."Task"("taskId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Version" ADD CONSTRAINT "Version_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."Project"("projectId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "public"."Task_projectId_idx" RENAME TO "Task_project_id_idx";
