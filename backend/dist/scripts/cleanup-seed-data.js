"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const pg_1 = require("pg");
const adapter_pg_1 = require("@prisma/adapter-pg");
require("dotenv/config");
async function cleanupSeedData() {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
        console.error('DATABASE_URL is not set in .env');
        process.exit(1);
    }
    const pool = new pg_1.Pool({ connectionString: databaseUrl });
    const adapter = new adapter_pg_1.PrismaPg(pool);
    const prisma = new client_1.PrismaClient({ adapter });
    try {
        await prisma.$connect();
        console.log('🧹 Starting cleanup of seed data...');
        const deletedData = await prisma.pumpData.deleteMany({});
        console.log(`✅ Deleted ${deletedData.count} pump data records`);
        const deletedPumps = await prisma.pump.deleteMany({});
        console.log(`✅ Deleted ${deletedPumps.count} pumps`);
        const deletedStations = await prisma.station.deleteMany({});
        console.log(`✅ Deleted ${deletedStations.count} stations`);
        console.log('✅ Cleanup completed! Database is now clean and ready for real pump data.');
        console.log('');
        console.log('📝 Next steps:');
        console.log('   1. Create stations and pumps manually via database or admin panel');
        console.log('   2. Configure your WiFi modules with the pump IDs and API keys');
        console.log('   3. Start sending real-time data from your pumps!');
    }
    catch (error) {
        console.error('❌ Error during cleanup:', error);
        process.exit(1);
    }
    finally {
        await prisma.$disconnect();
    }
}
cleanupSeedData();
//# sourceMappingURL=cleanup-seed-data.js.map