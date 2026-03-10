// checkPump.ts
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ DATABASE_URL environment variable is not set');
  process.exit(1);
}

const pool = new Pool({ connectionString: databaseUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const apiKeyToCheck = "53260bd21d40a39d677529dfd55c7c5d99c7d66723291b18fb638e07027206e9";

  try {
    const pump = await prisma.pump.findUnique({
      where: {
        apiKey: apiKeyToCheck,
      },
    });

    if (pump) {
      console.log("✅ Pump found:");
      console.log(pump);
    } else {
      console.log("❌ Pump not found. API key may be wrong or not registered yet.");
    }
  } catch (error) {
    console.error("❌ Error querying the database:", error);
  } finally {
    await prisma.$disconnect().catch((err) => {
      console.error("Failed to disconnect Prisma Client:", err);
    });
    await pool.end();
  }
}

// Run the script
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
