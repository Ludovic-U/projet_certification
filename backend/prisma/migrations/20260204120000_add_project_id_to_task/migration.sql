-- Add projectId to Task model for direct project association
ALTER TABLE "Task" ADD COLUMN "project_id" INTEGER;

-- Create index for faster queries
CREATE INDEX "Task_projectId_idx" ON "Task"("project_id");
