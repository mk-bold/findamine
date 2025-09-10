const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    // Get all games with their player counts
    const games = await prisma.game.findMany({
      include: {
        _count: {
          select: {
            playerGames: true
          }
        },
        playerGames: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    });

    console.log('=== GAMES AND PLAYERS ===');
    games.forEach(game => {
      console.log(`\nGame: ${game.name} (ID: ${game.id})`);
      console.log(`  Max Players: ${game.maxPlayers}`);
      console.log(`  Current Players: ${game._count.playerGames}`);
      console.log(`  Players:`);
      
      if (game.playerGames.length === 0) {
        console.log(`    No players joined yet`);
      } else {
        game.playerGames.forEach(playerGame => {
          console.log(`    - ${playerGame.user.firstName} ${playerGame.user.lastName} (${playerGame.user.email})`);
        });
      }
      
      const remaining = game.maxPlayers > 0 ? Math.max(0, game.maxPlayers - game._count.playerGames) : null;
      console.log(`  Remaining Spots: ${remaining === null ? 'No limit' : remaining}`);
    });

    // Check total player count
    const totalPlayers = await prisma.user.count({
      where: {
        role: 'PLAYER'
      }
    });
    
    console.log(`\n=== SUMMARY ===`);
    console.log(`Total Games: ${games.length}`);
    console.log(`Total Players in System: ${totalPlayers}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
