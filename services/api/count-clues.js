const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function countClues() {
  try {
    const total = await prisma.clueLocation.count();
    console.log('📊 Total clues in database:', total);
    
    // Count by region (approximate)
    const nycCount = await prisma.clueLocation.count({
      where: {
        latitude: { gte: 40.4, lte: 40.9 },
        longitude: { gte: -74.2, lte: -73.7 }
      }
    });
    
    const provoCount = await prisma.clueLocation.count({
      where: {
        latitude: { gte: 40.1, lte: 40.4 },
        longitude: { gte: -111.8, lte: -111.5 }
      }
    });
    
    console.log('🗽 NYC area clues:', nycCount);
    console.log('🏔️ Provo area clues:', provoCount);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

countClues();
