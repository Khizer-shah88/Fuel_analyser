-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'ADMIN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Station" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Station_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pump" (
    "id" TEXT NOT NULL,
    "pumpId" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "stationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pump_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PumpData" (
    "id" TEXT NOT NULL,
    "pumpId" TEXT NOT NULL,
    "liters" DOUBLE PRECISION NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "nozzle" INTEGER NOT NULL,
    "fuelType" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PumpData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Pump_pumpId_key" ON "Pump"("pumpId");

-- CreateIndex
CREATE UNIQUE INDEX "Pump_apiKey_key" ON "Pump"("apiKey");

-- CreateIndex
CREATE INDEX "PumpData_pumpId_idx" ON "PumpData"("pumpId");

-- CreateIndex
CREATE INDEX "PumpData_timestamp_idx" ON "PumpData"("timestamp");

-- AddForeignKey
ALTER TABLE "Station" ADD CONSTRAINT "Station_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pump" ADD CONSTRAINT "Pump_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "Station"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PumpData" ADD CONSTRAINT "PumpData_pumpId_fkey" FOREIGN KEY ("pumpId") REFERENCES "Pump"("pumpId") ON DELETE CASCADE ON UPDATE CASCADE;
