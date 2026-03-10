import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

async function viewAllPumps() {
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
    
    const pumps = await prisma.pump.findMany({
      include: {
        _count: {
          select: { data: true }
        }
      }
    });

    console.log('\n📊 All Pumps in Database:\n');
    
    if (pumps.length === 0) {
      console.log('✅ Database is clean - no pumps registered\n');
    } else {
      pumps.forEach((pump) => {
        console.log(`Pump ID: ${pump.pumpId}`);
        console.log(`  API Key: ${pump.apiKey.substring(0, 16)}...${pump.apiKey.substring(pump.apiKey.length - 8)}`);
        console.log(`  Station ID: ${pump.stationId || 'None'}`);
        console.log(`  Transactions: ${pump._count.data}`);
        console.log(`  Created: ${pump.createdAt.toISOString()}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

viewAllPumps();
