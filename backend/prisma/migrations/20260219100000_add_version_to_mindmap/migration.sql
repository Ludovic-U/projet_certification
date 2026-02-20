-- Add versionId to Mindmap model
ALTER TABLE "Mindmap" ADD COLUMN "version_id" INTEGER;

-- Add foreign key constraint separately
ALTER TABLE "Mindmap" ADD CONSTRAINT "Mindmap_version_id_fkey" 
  FOREIGN KEY ("version_id") REFERENCES "Version"("versionId") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "Mindmap_version_id_idx" ON "Mindmap"("version_id");
