-- CreateTable
CREATE TABLE "public"."Todo" (
    "todoId" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "projectId" INTEGER NOT NULL,
    "assignedTo" INTEGER,
    "deadline" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Todo_pkey" PRIMARY KEY ("todoId")
);

-- AddForeignKey
ALTER TABLE "public"."Todo" ADD CONSTRAINT "Todo_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("projectId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Todo" ADD CONSTRAINT "Todo_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "public"."User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;
