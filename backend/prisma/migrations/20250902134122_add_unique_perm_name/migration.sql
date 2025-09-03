/*
  Warnings:

  - A unique constraint covering the columns `[permName]` on the table `Permission` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "PermissionScope" AS ENUM ('ANY', 'ORG', 'OWN');

-- CreateIndex
CREATE UNIQUE INDEX "Permission_permName_key" ON "Permission"("permName");
