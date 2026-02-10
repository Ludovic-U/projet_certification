-- CreateTable
CREATE TABLE "public"."Financeur" (
    "financeurId" SERIAL NOT NULL,
    "FinanceurName" TEXT NOT NULL,

    CONSTRAINT "Financeur_pkey" PRIMARY KEY ("financeurId")
);

-- CreateTable
CREATE TABLE "public"."FinanceurProjet" (
    "projectId" INTEGER NOT NULL,
    "financeurId" INTEGER NOT NULL,
    "pourcentage" INTEGER NOT NULL,
    "montant" DECIMAL(65,30),

    CONSTRAINT "FinanceurProjet_pkey" PRIMARY KEY ("projectId","financeurId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Financeur_FinanceurName_key" ON "public"."Financeur"("FinanceurName");

-- AddForeignKey
ALTER TABLE "public"."FinanceurProjet" ADD CONSTRAINT "FinanceurProjet_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("projectId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FinanceurProjet" ADD CONSTRAINT "FinanceurProjet_financeurId_fkey" FOREIGN KEY ("financeurId") REFERENCES "public"."Financeur"("financeurId") ON DELETE RESTRICT ON UPDATE CASCADE;
