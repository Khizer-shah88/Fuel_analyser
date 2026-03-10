import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

/**
 * Cleanup Demo/Test Data Script
 * 
 * Removes all demo/test pumps and their transaction data from the database.
 * This prepares the system to receive real data from ESP-01 WiFi modules.
 * 
 * Usage:
 *   npm run cleanup-demo-data
 * 
 * This script will:
 * 1. Delete all transaction data from demo pumps (PUMP-001, PUMP-002, PUMP-003)
 * 2. Delete the demo pumps themselves
 * 3. Keep any real pumps that were registered via ESP-01 modules
 */

const DEMO_PUMPS = ['PUMP-001', 'PUMP-002', 'PUMP-003'];

async function cleanupDemoData() {
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
    console.log('🧹 Starting demo data cleanup...\n');

    // Step 1: Delete all transaction data from demo pumps
    console.log('📊 Deleting transaction data from demo pumps...');
    const deletedData = await prisma.pumpData.deleteMany({
      where: {
        pumpId: {
          in: DEMO_PUMPS,
        },
      },
    });
    console.log(`  ✅ Deleted ${deletedData.count} transaction records\n`);

    // Step 2: Delete demo pumps
    console.log('🔧 Deleting demo pumps...');
    let deletedPumps = 0;
    for (const pumpId of DEMO_PUMPS) {
      const deleted = await prisma.pump.deleteMany({
        where: { pumpId },
      });
      if (deleted.count > 0) {
        console.log(`  ✅ Deleted pump: ${pumpId}`);
        deletedPumps += deleted.count;
      } else {
        console.log(`  ℹ️  Pump not found: ${pumpId}`);
      }
    }

    // Step 3: Check for remaining pumps
    const remainingPumps = await prisma.pump.findMany({
      select: { pumpId: true },
    });

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ Demo data cleanup completed!');
    console.log('='.repeat(60));
    console.log(`🗑️  Deleted ${deletedPumps} demo pump(s)`);
    console.log(`🗑️  Deleted ${deletedData.count} transaction record(s)`);
    console.log(`\n📊 Remaining pumps in database: ${remainingPumps.length}`);
    
    if (remainingPumps.length > 0) {
      console.log('   Real pumps (from ESP-01 modules):');
      remainingPumps.forEach((pump) => {
        console.log(`     - ${pump.pumpId}`);
      });
    } else {
      console.log('   No pumps remaining. System is ready for ESP-01 module registration.');
    }

    console.log('\n📝 Next steps:');
    console.log('   1. Upload ESP-01 firmware to your modules');
    console.log('   2. ESP-01 modules will auto-register on first boot');
    console.log('   3. Real transaction data will appear in the dashboard');
    console.log('   4. Start backend: npm run start:dev');
    console.log('   5. Start frontend: cd ../frontend && npm run dev');
  } catch (error) {
    console.error('\n❌ Error during cleanup:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupDemoData();

