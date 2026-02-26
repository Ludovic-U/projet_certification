-- Migration for Mindmap models
-- Tables already exist in the database, this migration records the change in migration history

-- CreateMindmap
CREATE TABLE IF NOT EXISTS "Mindmap" (
    "mindmap_id" SERIAL PRIMARY KEY,
    "project_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Untitled Mindmap',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL
);

-- CreateMindmapNode
CREATE TABLE IF NOT EXISTS "MindmapNode" (
    "node_id" SERIAL PRIMARY KEY,
    "mindmap_id" INTEGER NOT NULL,
    "external_id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "node_type" TEXT NOT NULL,
    "position_x" DOUBLE PRECISION NOT NULL,
    "position_y" DOUBLE PRECISION NOT NULL,
    "color" TEXT,
    "font_size" INTEGER NOT NULL DEFAULT 14,
    "is_root" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL
);

-- CreateMindmapEdge
CREATE TABLE IF NOT EXISTS "MindmapEdge" (
    "edge_id" SERIAL PRIMARY KEY,
    "mindmap_id" INTEGER NOT NULL,
    "external_id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL
);

-- Add indexes and foreign keys
CREATE INDEX IF NOT EXISTS "Mindmap_project_id_idx" ON "Mindmap"("project_id");
CREATE INDEX IF NOT EXISTS "MindmapNode_mindmap_id_idx" ON "MindmapNode"("mindmap_id");
CREATE INDEX IF NOT EXISTS "MindmapEdge_mindmap_id_idx" ON "MindmapEdge"("mindmap_id");

ALTER TABLE "Mindmap" DROP CONSTRAINT IF EXISTS "Mindmap_project_id_fkey";
ALTER TABLE "Mindmap" ADD CONSTRAINT "Mindmap_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("projectId") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "MindmapNode" DROP CONSTRAINT IF EXISTS "MindmapNode_mindmap_id_fkey";
ALTER TABLE "MindmapNode" ADD CONSTRAINT "MindmapNode_mindmap_id_fkey" FOREIGN KEY ("mindmap_id") REFERENCES "Mindmap"("mindmap_id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "MindmapEdge" DROP CONSTRAINT IF EXISTS "MindmapEdge_mindmap_id_fkey";
ALTER TABLE "MindmapEdge" ADD CONSTRAINT "MindmapEdge_mindmap_id_fkey" FOREIGN KEY ("mindmap_id") REFERENCES "Mindmap"("mindmap_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add unique constraints
ALTER TABLE "MindmapNode" DROP CONSTRAINT IF EXISTS "MindmapNode_mindmap_id_external_id_key";
ALTER TABLE "MindmapNode" ADD CONSTRAINT "MindmapNode_mindmap_id_external_id_key" UNIQUE ("mindmap_id", "external_id");

ALTER TABLE "MindmapEdge" DROP CONSTRAINT IF EXISTS "MindmapEdge_mindmap_id_external_id_key";
ALTER TABLE "MindmapEdge" ADD CONSTRAINT "MindmapEdge_mindmap_id_external_id_key" UNIQUE ("mindmap_id", "external_id");
