-- Update ProjectDecision table to support board types
-- This migration updates the existing table with the new schema

-- Add board_type column with default value
ALTER TABLE "ProjectDecision" ADD COLUMN IF NOT EXISTS "board_type" VARCHAR(20) NOT NULL DEFAULT 'faisabilite';

-- Add decision_type column as nullable first
ALTER TABLE "ProjectDecision" ADD COLUMN IF NOT EXISTS "decision_type" VARCHAR(50);

-- Copy existing feasibility_type values to decision_type (where decision_type is null)
UPDATE "ProjectDecision" SET "decision_type" = "feasibility_type" WHERE "decision_type" IS NULL;

-- Set default values for any remaining nulls
UPDATE "ProjectDecision" SET "decision_type" = 'budget' WHERE "decision_type" IS NULL;
UPDATE "ProjectDecision" SET "board_type" = 'faisabilite' WHERE "board_type" IS NULL;

-- Now make them NOT NULL
ALTER TABLE "ProjectDecision" ALTER COLUMN "board_type" SET NOT NULL;
ALTER TABLE "ProjectDecision" ALTER COLUMN "decision_type" SET NOT NULL;

-- Drop the old feasibility_type column if it exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ProjectDecision' AND column_name = 'feasibility_type') THEN
        ALTER TABLE "ProjectDecision" DROP COLUMN "feasibility_type";
    END IF;
END $$;

-- Update unique constraint - drop old if exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ProjectDecision_projectId_feasibilityType_unique') THEN
        ALTER TABLE "ProjectDecision" DROP CONSTRAINT "ProjectDecision_projectId_feasibilityType_unique";
    END IF;
END $$;

-- Add new unique constraint for project + board + decision type (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ProjectDecision_project_board_type_unique') THEN
        ALTER TABLE "ProjectDecision" ADD CONSTRAINT "ProjectDecision_project_board_type_unique" 
            UNIQUE ("project_id", "board_type", "decision_type");
    END IF;
END $$;

-- Create index for board_type (if not exists)
CREATE INDEX IF NOT EXISTS "ProjectDecision_board_type_idx" ON "ProjectDecision"("board_type");
