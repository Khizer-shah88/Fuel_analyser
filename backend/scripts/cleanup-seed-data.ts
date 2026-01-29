import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

/**
 * Script to clean up seed/test data from the database
 * This removes all pumps, stations, and pump data that were created for testing
 */
async function cleanupSeedData() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL is not set in .env');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: databaseUrl });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    await prisma.$connect();

    console.log('🧹 Starting cleanup of seed data...');

    // Delete all pump data (transactions)
    const deletedData = await prisma.pumpData.deleteMany({});
    console.log(`✅ Deleted ${deletedData.count} pump data records`);

    // Delete all pumps
    const deletedPumps = await prisma.pump.deleteMany({});
    console.log(`✅ Deleted ${deletedPumps.count} pumps`);

    // Delete all stations (this will cascade delete pumps if any remain)
    const deletedStations = await prisma.station.deleteMany({});
    console.log(`✅ Deleted ${deletedStations.count} stations`);

    console.log('✅ Cleanup completed! Database is now clean and ready for real pump data.');
    console.log('');
    console.log('📝 Next steps:');
    console.log('   1. Create stations and pumps manually via database or admin panel');
    console.log('   2. Configure your WiFi modules with the pump IDs and API keys');
    console.log('   3. Start sending real-time data from your pumps!');
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupSeedData();

