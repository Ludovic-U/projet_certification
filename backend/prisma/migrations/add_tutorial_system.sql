-- CreateTable TutorialPage
CREATE TABLE "TutorialPage" (
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

-- CreateTable UserTutorialView
CREATE TABLE "UserTutorialView" (
    "viewId" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "tutorialId" INTEGER NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "UserTutorialView_pkey" PRIMARY KEY ("viewId")
);

-- CreateIndex
CREATE UNIQUE INDEX "TutorialPage_pageName_key" ON "TutorialPage"("pageName");

-- CreateIndex
CREATE UNIQUE INDEX "UserTutorialView_userId_tutorialId_key" ON "UserTutorialView"("userId", "tutorialId");

-- CreateIndex
CREATE INDEX "UserTutorialView_userId_idx" ON "UserTutorialView"("userId");

-- AddForeignKey
ALTER TABLE "UserTutorialView" ADD CONSTRAINT "UserTutorialView_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTutorialView" ADD CONSTRAINT "UserTutorialView_tutorialId_fkey" FOREIGN KEY ("tutorialId") REFERENCES "TutorialPage"("tutorialId") ON DELETE CASCADE ON UPDATE CASCADE;
