-- CreateIndex
CREATE INDEX "PumpData_fuelType_idx" ON "PumpData"("fuelType");

-- CreateIndex
CREATE INDEX "PumpData_nozzle_idx" ON "PumpData"("nozzle");

-- CreateIndex
CREATE INDEX "PumpData_pumpId_timestamp_idx" ON "PumpData"("pumpId", "timestamp");

-- CreateIndex
CREATE INDEX "PumpData_timestamp_fuelType_idx" ON "PumpData"("timestamp", "fuelType");

-- CreateIndex
CREATE INDEX "PumpData_pumpId_fuelType_idx" ON "PumpData"("pumpId", "fuelType");
