const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Restoring comprehensive database...');

  // Create a hash for the password (password123)
  const passwordHash = await bcrypt.hash('password123', 12);

  // First, let's create more players from your original data
  const players = [
    { firstName: 'Alex', lastName: 'Johnson', email: 'alex.johnson@email.com', homeCity: 'New York' },
    { firstName: 'Sarah', lastName: 'Williams', email: 'sarah.williams@email.com', homeCity: 'Los Angeles' },
    { firstName: 'Mike', lastName: 'Brown', email: 'mike.brown@email.com', homeCity: 'Chicago' },
    { firstName: 'Emma', lastName: 'Davis', email: 'emma.davis@email.com', homeCity: 'Houston' },
    { firstName: 'James', lastName: 'Miller', email: 'james.miller@email.com', homeCity: 'Phoenix' },
    { firstName: 'Olivia', lastName: 'Wilson', email: 'olivia.wilson@email.com', homeCity: 'Philadelphia' },
    { firstName: 'William', lastName: 'Moore', email: 'william.moore@email.com', homeCity: 'San Antonio' },
    { firstName: 'Ava', lastName: 'Taylor', email: 'ava.taylor@email.com', homeCity: 'San Diego' },
    { firstName: 'Oliver', lastName: 'Anderson', email: 'oliver.anderson@email.com', homeCity: 'Dallas' },
    { firstName: 'Sophia', lastName: 'Thomas', email: 'sophia.thomas@email.com', homeCity: 'San Jose' },
    { firstName: 'Noah', lastName: 'Jackson', email: 'noah.jackson@email.com', homeCity: 'Austin' },
    { firstName: 'Isabella', lastName: 'White', email: 'isabella.white@email.com', homeCity: 'Jacksonville' },
  ];

  console.log('👥 Creating players...');
  for (let i = 0; i < players.length; i++) {
    const player = players[i];
    try {
      await prisma.user.create({
        data: {
          id: `player_${i + 10}`,
          email: player.email,
          password: passwordHash,
          firstName: player.firstName,
          lastName: player.lastName,
          role: 'PLAYER',
          homeCity: player.homeCity,
          agreedToTerms: true,
          agreedToPrivacy: true,
          isActive: true,
        }
      });
      console.log(`✅ Created player: ${player.firstName} ${player.lastName}`);
    } catch (error) {
      if (error.code === 'P2002') {
        console.log(`⚠️  Player ${player.email} already exists`);
      } else {
        console.error(`❌ Error creating ${player.firstName}:`, error.message);
      }
    }
  }

  // Create more games
  const newGames = [
    {
      id: 'game3',
      name: 'NYC Explorer',
      description: 'Discover the hidden gems of New York City',
      status: 'ACTIVE',
      startDate: new Date(),
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
    },
    {
      id: 'game4', 
      name: 'University Adventure',
      description: 'Explore the campus and surrounding areas',
      status: 'ACTIVE',
      startDate: new Date(),
      endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days
    }
  ];

  console.log('🎮 Creating additional games...');
  for (const game of newGames) {
    try {
      await prisma.game.create({
        data: {
          ...game,
          createdBy: 'test_user_123', // Your admin user
        }
      });
      console.log(`✅ Created game: ${game.name}`);
    } catch (error) {
      if (error.code === 'P2002') {
        console.log(`⚠️  Game ${game.name} already exists`);
      } else {
        console.error(`❌ Error creating ${game.name}:`, error.message);
      }
    }
  }

  // Get all players and games
  const allPlayers = await prisma.user.findMany({
    where: { role: 'PLAYER' }
  });
  const allGames = await prisma.game.findMany();
  
  console.log(`👥 Found ${allPlayers.length} players`);
  console.log(`🎮 Found ${allGames.length} games`);

  // Connect players to games
  console.log('🔗 Connecting players to games...');
  let connectionCount = 0;
  for (const game of allGames) {
    // Add 8-12 players to each game
    const playersForGame = allPlayers.slice(0, Math.min(12, allPlayers.length));
    
    for (const player of playersForGame) {
      try {
        await prisma.playerGame.create({
          data: {
            userId: player.id,
            gameId: game.id,
          }
        });
        connectionCount++;
      } catch (error) {
        // Ignore duplicate key errors
        if (error.code !== 'P2002') {
          console.error(`❌ Error connecting ${player.firstName} to ${game.name}:`, error.message);
        }
      }
    }
  }
  console.log(`✅ Created ${connectionCount} player-game connections`);

  // Connect more clues to games
  const allClues = await prisma.clueLocation.findMany();
  console.log(`🔍 Found ${allClues.length} clue locations`);
  
  console.log('🎯 Linking remaining clues to games...');
  let clueGameCount = 0;
  for (let i = 0; i < allGames.length && i < 4; i++) {
    const game = allGames[i];
    const cluesForGame = allClues.slice(i * 20, (i + 1) * 20); // 20 clues per game
    
    for (const clue of cluesForGame) {
      try {
        await prisma.gameClue.create({
          data: {
            id: `gc_${game.id}_${clue.id}`,
            gameId: game.id,
            clueLocationId: clue.id,
            isReleased: true,
            updatedAt: new Date(),
          }
        });
        clueGameCount++;
      } catch (error) {
        if (error.code !== 'P2002') {
          console.error(`❌ Error linking clue ${clue.identifyingName} to ${game.name}:`, error.message);
        }
      }
    }
  }
  console.log(`✅ Linked ${clueGameCount} clues to games`);

  // Create some clue findings
  const gameClues = await prisma.gameClue.findMany({
    include: { game: true, clueLocation: true }
  });
  
  console.log('🏆 Creating clue findings...');
  let findingCount = 0;
  for (let i = 0; i < Math.min(25, gameClues.length * 2); i++) {
    const gameClue = gameClues[i % gameClues.length];
    const player = allPlayers[i % allPlayers.length];
    
    try {
      await prisma.clueFinding.create({
        data: {
          id: `finding_${player.id}_${gameClue.id}`,
          userId: player.id,
          gameClueId: gameClue.id,
          points: 100,
          gpsLatitude: gameClue.clueLocation.latitude + (Math.random() - 0.5) * 0.0001,
          gpsLongitude: gameClue.clueLocation.longitude + (Math.random() - 0.5) * 0.0001,
          foundAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random time in last 7 days
        }
      });
      findingCount++;
    } catch (error) {
      if (error.code !== 'P2002') {
        console.error(`❌ Error creating finding:`, error.message);
      }
    }
  }
  console.log(`✅ Created ${findingCount} clue findings`);

  // Create some chat messages
  console.log('💬 Creating game chat messages...');
  const messages = [
    "Anyone found the library clue yet?",
    "That fountain puzzle was tricky!",
    "Great teamwork everyone!",
    "The clock tower hint was genius",
    "Just solved the statue riddle 🎉",
    "This game is addictive!",
    "Love the historical references",
    "Who's up for forming a team?",
    "The museum clue is challenging!",
    "Found it! The answer was right there all along"
  ];

  let chatCount = 0;
  for (const game of allGames) {
    for (let i = 0; i < 5; i++) {
      const player = allPlayers[i % allPlayers.length];
      const message = messages[i % messages.length];
      
      try {
        await prisma.chatPost.create({
          data: {
            id: `chat_${game.id}_${player.id}_${i}`,
            content: message,
            userId: player.id,
            gameId: game.id,
          }
        });
        chatCount++;
      } catch (error) {
        if (error.code !== 'P2002') {
          console.error(`❌ Error creating chat message:`, error.message);
        }
      }
    }
  }
  console.log(`✅ Created ${chatCount} chat messages`);

  // Final summary
  const finalStats = await Promise.all([
    prisma.user.count({ where: { role: 'PLAYER' } }),
    prisma.game.count(),
    prisma.clueLocation.count(),
    prisma.clueFinding.count(),
    prisma.chatPost.count(),
  ]);

  console.log('\n🎉 Database restoration complete!');
  console.log(`📊 Final Statistics:`);
  console.log(`   👥 Players: ${finalStats[0]}`);
  console.log(`   🎮 Games: ${finalStats[1]}`);
  console.log(`   🔍 Clue Locations: ${finalStats[2]}`);
  console.log(`   🏆 Clue Findings: ${finalStats[3]}`);
  console.log(`   💬 Chat Messages: ${finalStats[4]}`);
}

main()
  .catch((e) => {
    console.error('❌ Error during restoration:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });