-- DropForeignKey
ALTER TABLE "PumpData" DROP CONSTRAINT "PumpData_pumpId_fkey";

-- AddForeignKey
ALTER TABLE "PumpData" ADD CONSTRAINT "PumpData_pumpId_fkey" FOREIGN KEY ("pumpId") REFERENCES "Pump"("id") ON DELETE CASCADE ON UPDATE CASCADE;
