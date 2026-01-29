import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://fuel_admin:232323@localhost:5432/fueldb?schema=public';

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    const password = await bcrypt.hash('admin123', 10);

    const admin = await prisma.user.upsert({
      where: { email: 'admin@fuel.com' },
      update: { password, role: 'ADMIN' },
      create: {
        email: 'admin@fuel.com',
        password,
        role: 'ADMIN',
      },
    });

    console.log('✅ Admin user reset/created:');
    console.log(`Email: ${admin.email}`);
    console.log(`Password: admin123`);
    console.log(`Role: ${admin.role}`);
  } catch (error) {
    console.error('❌ Error creating/updating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();