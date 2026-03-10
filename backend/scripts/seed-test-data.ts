import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { randomBytes } from 'crypto';
import 'dotenv/config';

/**
 * Test Data Seeder Script
 * 
 * Generates realistic pump transaction data for testing the dashboard and analytics
 * without requiring ESP-01 WiFi modules.
 * 
 * Usage:
 *   npm run seed-test-data
 * 
 * This script will:
 * 1. Create test pumps (PUMP-001, PUMP-002, PUMP-003) if they don't exist
 * 2. Generate transaction data for:
 *    - Today (spread across different hours)
 *    - Last 7 days (for weekly comparison)
 *    - Last 30 days (for monthly analytics)
 * 3. Include different fuel types (PETROL, DIESEL)
 * 4. Include different nozzles (1-4)
 * 5. Generate realistic amounts and liters
 */

const FUEL_TYPES = ['PETROL', 'DIESEL'] as const;
const NOZZLES = [1, 2, 3, 4];
const PUMPS = ['PUMP-001', 'PUMP-002', 'PUMP-003'];

// Price per liter (in your currency)
const PRICE_PER_LITER: Record<string, number> = {
  PETROL: 280, // ₹280 per liter
  DIESEL: 260, // ₹260 per liter
};

/**
 * Generate a random transaction amount between min and max liters
 */
function randomLiters(min: number, max: number): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
}

/**
 * Calculate amount based on liters and fuel type
 */
function calculateAmount(liters: number, fuelType: string): number {
  const price = PRICE_PER_LITER[fuelType] || 280;
  return parseFloat((liters * price).toFixed(2));
}

/**
 * Generate a random timestamp within a date range
 */
function randomTimestamp(start: Date, end: Date): Date {
  const startTime = start.getTime();
  const endTime = end.getTime();
  const randomTime = startTime + Math.random() * (endTime - startTime);
  return new Date(randomTime);
}

/**
 * Create test pumps if they don't exist
 */
async function ensureTestPumps(prisma: PrismaClient) {
  console.log('🔧 Checking/Creating test pumps...');
  
  for (const pumpId of PUMPS) {
    const existing = await prisma.pump.findUnique({
      where: { pumpId },
    });

    if (!existing) {
      const apiKey = randomBytes(32).toString('hex');
      await prisma.pump.create({
        data: {
          pumpId,
          apiKey,
        },
      });
      console.log(`  ✅ Created pump: ${pumpId} (API Key: ${apiKey.substring(0, 16)}...)`);
    } else {
      console.log(`  ℹ️  Pump already exists: ${pumpId}`);
    }
  }
}

/**
 * Generate transactions for a specific date range
 */
async function generateTransactions(
  prisma: PrismaClient,
  startDate: Date,
  endDate: Date,
  transactionsPerDay: number,
  description: string,
) {
  console.log(`\n📊 Generating ${description}...`);
  
  const pumps = await prisma.pump.findMany({
    where: { pumpId: { in: PUMPS } },
  });

  if (pumps.length === 0) {
    console.log('  ⚠️  No pumps found. Please run ensureTestPumps first.');
    return;
  }

  const transactions: Array<{
    pumpId: string;
    liters: number;
    amount: number;
    nozzle: number;
    fuelType: string;
    timestamp: Date;
  }> = [];

  // Calculate number of days
  const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const totalTransactions = daysDiff * transactionsPerDay;

  console.log(`  Generating ${totalTransactions} transactions from ${startDate.toISOString().slice(0, 10)} to ${endDate.toISOString().slice(0, 10)}...`);

  for (let i = 0; i < totalTransactions; i++) {
    const pump = pumps[Math.floor(Math.random() * pumps.length)];
    const fuelType = FUEL_TYPES[Math.floor(Math.random() * FUEL_TYPES.length)];
    const nozzle = NOZZLES[Math.floor(Math.random() * NOZZLES.length)];
    const liters = randomLiters(5, 50); // Between 5-50 liters per transaction
    const amount = calculateAmount(liters, fuelType);
    const timestamp = randomTimestamp(startDate, endDate);

    transactions.push({
      pumpId: pump.pumpId,
      liters,
      amount,
      nozzle,
      fuelType,
      timestamp,
    });
  }

  // Batch insert for performance
  const batchSize = 100;
  let inserted = 0;

  for (let i = 0; i < transactions.length; i += batchSize) {
    const batch = transactions.slice(i, i + batchSize);
    await prisma.pumpData.createMany({
      data: batch,
    });
    inserted += batch.length;
    process.stdout.write(`\r  Progress: ${inserted}/${totalTransactions} transactions inserted...`);
  }

  console.log(`\n  ✅ Inserted ${inserted} transactions`);
}

/**
 * Generate today's transactions (spread across hours)
 */
async function generateTodayTransactions(prisma: PrismaClient) {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const end = new Date(now);

  // More transactions during business hours (8 AM - 10 PM)
  // Generate 2-5 transactions per hour during peak, 0-1 during off-peak
  const transactions: Array<{
    pumpId: string;
    liters: number;
    amount: number;
    nozzle: number;
    fuelType: string;
    timestamp: Date;
  }> = [];

  const pumps = await prisma.pump.findMany({
    where: { pumpId: { in: PUMPS } },
  });

  for (let hour = 0; hour <= now.getHours(); hour++) {
    const hourStart = new Date(start);
    hourStart.setHours(hour, 0, 0, 0);
    const hourEnd = new Date(start);
    hourEnd.setHours(hour, 59, 59, 999);

    // Peak hours: 8 AM - 10 PM (more transactions)
    const isPeakHour = hour >= 8 && hour <= 22;
    const transactionsThisHour = isPeakHour
      ? Math.floor(Math.random() * 4) + 2 // 2-5 transactions
      : Math.floor(Math.random() * 2); // 0-1 transactions

    for (let t = 0; t < transactionsThisHour; t++) {
      const pump = pumps[Math.floor(Math.random() * pumps.length)];
      const fuelType = FUEL_TYPES[Math.floor(Math.random() * FUEL_TYPES.length)];
      const nozzle = NOZZLES[Math.floor(Math.random() * NOZZLES.length)];
      const liters = randomLiters(5, 50);
      const amount = calculateAmount(liters, fuelType);
      const timestamp = randomTimestamp(hourStart, hourEnd);

      transactions.push({
        pumpId: pump.pumpId,
        liters,
        amount,
        nozzle,
        fuelType,
        timestamp,
      });
    }
  }

  if (transactions.length > 0) {
    await prisma.pumpData.createMany({ data: transactions });
    console.log(`  ✅ Inserted ${transactions.length} transactions for today`);
  }
}

/**
 * Main seeding function
 */
async function seedTestData() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL is not set in .env');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: databaseUrl });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    await prisma.$connect();
    console.log('🚀 Starting test data seeding...\n');

    // Step 1: Create test pumps
    await ensureTestPumps(prisma);

    // Step 2: Generate today's transactions (hourly spread)
    await generateTodayTransactions(prisma);

    // Step 3: Generate last 7 days (for weekly comparison)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(23, 59, 59, 999);
    
    await generateTransactions(
      prisma,
      sevenDaysAgo,
      yesterday,
      15, // 15 transactions per day
      'Last 7 days (for weekly comparison)',
    );

    // Step 4: Generate last 30 days (for monthly analytics)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);
    const eightDaysAgo = new Date();
    eightDaysAgo.setDate(eightDaysAgo.getDate() - 8);
    eightDaysAgo.setHours(0, 0, 0, 0);

    await generateTransactions(
      prisma,
      thirtyDaysAgo,
      eightDaysAgo,
      10, // 10 transactions per day
      'Last 30 days (for monthly analytics)',
    );

    // Summary
    const totalData = await prisma.pumpData.count();
    const todayData = await prisma.pumpData.count({
      where: {
        timestamp: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    });

    console.log('\n' + '='.repeat(60));
    console.log('✅ Test data seeding completed!');
    console.log('='.repeat(60));
    console.log(`📊 Total transactions in database: ${totalData}`);
    console.log(`📅 Transactions for today: ${todayData}`);
    console.log('\n📝 Next steps:');
    console.log('   1. Start your backend: npm run start:dev');
    console.log('   2. Start your frontend: cd ../frontend && npm run dev');
    console.log('   3. Login and view the dashboard at http://localhost:3001');
    console.log('   4. Test all analytics endpoints:');
    console.log('      - GET /api/analytics/today');
    console.log('      - GET /api/analytics/monthly');
    console.log('      - GET /api/analytics/product-wise');
    console.log('      - GET /api/analytics/hourly');
    console.log('      - GET /api/analytics/weekly');
    console.log('\n💡 To clean up test data, run: npm run cleanup-seed-data');
  } catch (error) {
    console.error('\n❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedTestData();




