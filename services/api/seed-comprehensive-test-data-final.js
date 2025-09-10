const { PrismaClient } = require('@prisma/client');
const { faker } = require('@faker-js/faker');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive database seeding...');

  // Get existing games
  const games = await prisma.game.findMany({
    select: { id: true, name: true }
  });
  console.log(`📊 Found ${games.length} games to seed with players`);

  // Get all existing players
  const existingPlayers = await prisma.user.findMany({
    where: { role: 'PLAYER' },
    select: { id: true, email: true, firstName: true, lastName: true }
  });
  console.log(`👥 Found ${existingPlayers.length} existing players`);

  if (existingPlayers.length === 0) {
    console.log('❌ No players found in database. Please create some players first.');
    return;
  }

  // Get clues for each game
  const gameCluesMap = {};
  for (const game of games) {
    const clues = await prisma.gameClue.findMany({
      where: { gameId: game.id },
      select: { id: true, clueLocationId: true }
    });
    gameCluesMap[game.id] = clues;
    console.log(`🔍 Game "${game.name}" has ${clues.length} clues`);
  }

  let totalPlayerGameConnections = 0;
  let totalClueFindings = 0;
  let totalSocialConnections = 0;

  // Add 35 players to each game (or all available players if less than 35)
  console.log('🎮 Adding players to games...');
  for (const game of games) {
    const playersToAdd = existingPlayers.slice(0, Math.min(35, existingPlayers.length));
    
    for (const player of playersToAdd) {
      // Check if already participating
      const existing = await prisma.playerGame.findUnique({
        where: {
          userId_gameId: {
            userId: player.id,
            gameId: game.id
          }
        }
      });

      if (!existing) {
        await prisma.playerGame.create({
          data: {
            userId: player.id,
            gameId: game.id,
            joinedAt: faker.date.between({ 
              from: new Date('2024-01-01'), 
              to: new Date() 
            }),
            totalPoints: faker.number.int({ min: 0, max: 1000 }),
            privacyLevel: faker.helpers.arrayElement(['PRIVATE', 'MINIONS_ONLY', 'MINIONS_AND_FRENEMIES', 'PUBLIC'])
          }
        });
        totalPlayerGameConnections++;
      }
    }
  }

  // Create clue findings for players in games
  console.log('🔍 Creating clue findings...');
  const playerGameRelations = await prisma.playerGame.findMany({
    include: { user: true, game: true }
  });

  for (const relation of playerGameRelations) {
    const gameClues = gameCluesMap[relation.gameId] || [];
    if (gameClues.length === 0) continue;

    // Create 1-4 findings per player per game
    const findingsCount = faker.number.int({ min: 1, max: Math.min(4, gameClues.length) });
    const selectedClues = faker.helpers.arrayElements(gameClues, findingsCount);

    for (const clue of selectedClues) {
      // Check if already found
      const existing = await prisma.clueFinding.findUnique({
        where: {
          userId_gameClueId: {
            userId: relation.userId,
            gameClueId: clue.id
          }
        }
      });

      if (!existing) {
        await prisma.clueFinding.create({
          data: {
            userId: relation.userId,
            gameClueId: clue.id,
            foundAt: faker.date.between({ 
              from: relation.joinedAt, 
              to: new Date() 
            }),
            points: faker.number.int({ min: 10, max: 100 }),
            gpsLatitude: faker.location.latitude(),
            gpsLongitude: faker.location.longitude()
          }
        });
        totalClueFindings++;
      }
    }
  }

  // Create social connections (frenemy relationships)
  console.log('👫 Creating frenemy relationships...');
  for (const player of existingPlayers) {
    // Create 1-5 frenemy relationships per player
    const frenemyCount = faker.number.int({ min: 1, max: 5 });
    const potentialFrenemies = existingPlayers.filter(p => p.id !== player.id);
    
    if (potentialFrenemies.length > 0) {
      const selectedFrenemies = faker.helpers.arrayElements(
        potentialFrenemies, 
        Math.min(frenemyCount, potentialFrenemies.length)
      );

      for (const frenemy of selectedFrenemies) {
        // Check if connection already exists
        const existing = await prisma.socialConnection.findUnique({
          where: {
            followerId_followingId: {
              followerId: player.id,
              followingId: frenemy.id
            }
          }
        });

        if (!existing) {
          await prisma.socialConnection.create({
            data: {
              followerId: player.id,
              followingId: frenemy.id,
              isActive: true,
              createdAt: faker.date.between({ 
                from: new Date('2024-01-01'), 
                to: new Date() 
              })
            }
          });
          totalSocialConnections++;
        }
      }
    }
  }

  // Create some minion relationships
  console.log('👑 Creating referral/minion relationships...');
  for (const player of existingPlayers) {
    // Create 0-3 minion relationships per player
    const minionCount = faker.number.int({ min: 0, max: 3 });
    
    if (minionCount > 0) {
      const potentialMinions = existingPlayers.filter(p => p.id !== player.id);
      
      if (potentialMinions.length > 0) {
        const selectedMinions = faker.helpers.arrayElements(
          potentialMinions, 
          Math.min(minionCount, potentialMinions.length)
        );

        for (const minion of selectedMinions) {
          // Check if connection already exists
          const existing = await prisma.socialConnection.findUnique({
            where: {
              followerId_followingId: {
                followerId: minion.id,
                followingId: player.id
              }
            }
          });

          if (!existing) {
            await prisma.socialConnection.create({
              data: {
                followerId: minion.id,
                followingId: player.id,
                isActive: true,
                createdAt: faker.date.between({ 
                  from: new Date('2024-01-01'), 
                  to: new Date() 
                })
              }
            });
            totalSocialConnections++;
          }
        }
      }
    }
  }

  // Final statistics
  console.log('\n📊 Final statistics:');
  const totalUsers = await prisma.user.count();
  const totalPlayerGames = await prisma.playerGame.count();
  const totalFindings = await prisma.clueFinding.count();
  const totalConnections = await prisma.socialConnection.count();

  console.log(`👥 Total users: ${totalUsers}`);
  console.log(`🎮 Total player-game relationships: ${totalPlayerGames}`);
  console.log(`🔍 Total clue findings: ${totalFindings}`);
  console.log(`👫 Total social connections: ${totalConnections}`);

  console.log('\n✅ Comprehensive database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });