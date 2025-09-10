const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testRadius() {
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
    
    // Test 3-mile radius (old)
    const clues3Miles = await prisma.clueLocation.count({
      where: {
        AND: [
          { latitude: { gte: game.gameCenterLat - (3 / 69), lte: game.gameCenterLat + (3 / 69) } },
          { longitude: { gte: game.gameCenterLng - (3 / (69 * Math.cos(game.gameCenterLat * Math.PI / 180))), lte: game.gameCenterLng + (3 / (69 * Math.cos(game.gameCenterLat * Math.PI / 180))) } }
        ]
      }
    });
    
    // Test 5-mile radius (new)
    const clues5Miles = await prisma.clueLocation.count({
      where: {
        AND: [
          { latitude: { gte: game.gameCenterLat - (5 / 69), lte: game.gameCenterLat + (5 / 69) } },
          { longitude: { gte: game.gameCenterLng - (5 / (69 * Math.cos(game.gameCenterLat * Math.PI / 180))), lte: game.gameCenterLng + (5 / (69 * Math.cos(game.gameCenterLat * Math.PI / 180))) } }
        ]
      }
    });
    
    console.log('📊 Clues within 3 miles:', clues3Miles);
    console.log('📊 Clues within 5 miles:', clues5Miles);
    console.log('📈 Additional clues with 5-mile radius:', clues5Miles - clues3Miles);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testRadius();
