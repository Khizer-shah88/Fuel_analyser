import { PrismaClient } from '@prisma/client';

async function diagnose() {
  const prisma = new PrismaClient();
  
  console.log('\n🔍 PUMP SYSTEM DIAGNOSTIC\n');
  
  try {
    // 1. Check if any pumps exist
    const pumps = await prisma.pump.findMany({
      include: {
        data: {
          orderBy: { timestamp: 'desc' },
          take: 5,
        },
      },
    });
    
    console.log(`📋 Total Pumps in Database: ${pumps.length}`);
    
    if (pumps.length === 0) {
      console.log('   ⚠️  NO PUMPS REGISTERED!\n');
    } else {
      pumps.forEach((pump) => {
        console.log(`\n   Pump ID: ${pump.pumpId}`);
        console.log(`   API Key: ${pump.apiKey.substring(0, 16)}...`);
        console.log(`   Station ID: ${pump.stationId || 'None'}`);
        console.log(`   Created: ${pump.createdAt.toISOString()}`);
        console.log(`   Transactions: ${pump.data.length}`);
        
        if (pump.data.length > 0) {
          pump.data.forEach((txn, i) => {
            console.log(`     ${i + 1}. ${txn.liters}L, ${txn.amount} PKR, Nozzle ${txn.nozzle} @ ${txn.timestamp}`);
          });
        }
      });
    }
    
    // 2. Check all transaction data
    const allTransactions = await prisma.pumpData.findMany({
      orderBy: { timestamp: 'desc' },
      take: 20,
    });
    
    console.log(`\n\n📊 Total Transactions: ${allTransactions.length}`);
    if (allTransactions.length > 0) {
      console.log('\n   Last 20 transactions:');
      allTransactions.forEach((txn, i) => {
        console.log(`     ${i + 1}. ${txn.pumpId}: ${txn.liters}L, ${txn.amount} PKR @ ${txn.timestamp}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

diagnose();