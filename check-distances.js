const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDistances() {
  try {
    // Get the game center coordinates
    const game = await prisma.game.findFirst({
      where: { name: 'Test Adventure Game' }
    });
    
    if (!game) {
      console.log('No game found');
      return;
    }
    
    console.log('Game Center:', game.gameCenterLat, game.gameCenterLng);
    console.log('Game Name:', game.name);
    console.log('');
    
    // Get all clues
    const clues = await prisma.clueLocation.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    
    console.log('Checking distances from game center to each clue:');
    console.log('================================================');
    
    clues.forEach((clue, index) => {
      const distance = calculateDistance(
        game.gameCenterLat, 
        game.gameCenterLng, 
        clue.latitude, 
        clue.longitude
      );
      
      console.log(`${index + 1}. ${clue.identifyingName}`);
      console.log(`   Clue Location: ${clue.latitude}, ${clue.longitude}`);
      console.log(`   Distance: ${distance.toFixed(2)} miles`);
      console.log(`   Within 3 miles: ${distance <= 3 ? 'YES' : 'NO'}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

checkDistances();
