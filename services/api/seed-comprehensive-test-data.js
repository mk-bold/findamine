const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

// Fake player data
const fakeUsers = [
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
  { firstName: 'Liam', lastName: 'Harris', email: 'liam.harris@email.com', homeCity: 'Fort Worth' },
  { firstName: 'Mia', lastName: 'Martin', email: 'mia.martin@email.com', homeCity: 'Columbus' },
  { firstName: 'Benjamin', lastName: 'Garcia', email: 'benjamin.garcia@email.com', homeCity: 'Charlotte' },
  { firstName: 'Charlotte', lastName: 'Rodriguez', email: 'charlotte.rodriguez@email.com', homeCity: 'San Francisco' },
  { firstName: 'Elijah', lastName: 'Lewis', email: 'elijah.lewis@email.com', homeCity: 'Indianapolis' },
  { firstName: 'Amelia', lastName: 'Lee', email: 'amelia.lee@email.com', homeCity: 'Seattle' },
  { firstName: 'Lucas', lastName: 'Walker', email: 'lucas.walker@email.com', homeCity: 'Denver' },
  { firstName: 'Harper', lastName: 'Hall', email: 'harper.hall@email.com', homeCity: 'Washington DC' },
  { firstName: 'Mason', lastName: 'Allen', email: 'mason.allen@email.com', homeCity: 'Boston' },
  { firstName: 'Evelyn', lastName: 'Young', email: 'evelyn.young@email.com', homeCity: 'El Paso' },
  { firstName: 'Logan', lastName: 'King', email: 'logan.king@email.com', homeCity: 'Detroit' },
  { firstName: 'Abigail', lastName: 'Wright', email: 'abigail.wright@email.com', homeCity: 'Nashville' },
  { firstName: 'Alexander', lastName: 'Lopez', email: 'alexander.lopez@email.com', homeCity: 'Memphis' },
  { firstName: 'Ella', lastName: 'Hill', email: 'ella.hill@email.com', homeCity: 'Portland' },
  { firstName: 'Michael', lastName: 'Scott', email: 'michael.scott@email.com', homeCity: 'Oklahoma City' },
  { firstName: 'Avery', lastName: 'Green', email: 'avery.green@email.com', homeCity: 'Las Vegas' },
  { firstName: 'Daniel', lastName: 'Adams', email: 'daniel.adams@email.com', homeCity: 'Louisville' },
  { firstName: 'Sofia', lastName: 'Baker', email: 'sofia.baker@email.com', homeCity: 'Baltimore' },
  { firstName: 'Matthew', lastName: 'Nelson', email: 'matthew.nelson@email.com', homeCity: 'Milwaukee' },
  { firstName: 'Camila', lastName: 'Carter', email: 'camila.carter@email.com', homeCity: 'Albuquerque' },
  { firstName: 'Jackson', lastName: 'Mitchell', email: 'jackson.mitchell@email.com', homeCity: 'Tucson' },
  { firstName: 'Layla', lastName: 'Perez', email: 'layla.perez@email.com', homeCity: 'Fresno' },
  { firstName: 'Sebastian', lastName: 'Roberts', email: 'sebastian.roberts@email.com', homeCity: 'Sacramento' },
  { firstName: 'Riley', lastName: 'Turner', email: 'riley.turner@email.com', homeCity: 'Long Beach' },
  { firstName: 'Jack', lastName: 'Phillips', email: 'jack.phillips@email.com', homeCity: 'Kansas City' },
  { firstName: 'Aria', lastName: 'Campbell', email: 'aria.campbell@email.com', homeCity: 'Mesa' },
  { firstName: 'Owen', lastName: 'Parker', email: 'owen.parker@email.com', homeCity: 'Atlanta' },
  { firstName: 'Scarlett', lastName: 'Evans', email: 'scarlett.evans@email.com', homeCity: 'Virginia Beach' },
  { firstName: 'Aiden', lastName: 'Edwards', email: 'aiden.edwards@email.com', homeCity: 'Omaha' },
  { firstName: 'Lily', lastName: 'Collins', email: 'lily.collins@email.com', homeCity: 'Colorado Springs' },
  { firstName: 'Luke', lastName: 'Stewart', email: 'luke.stewart@email.com', homeCity: 'Raleigh' },
  { firstName: 'Zoey', lastName: 'Sanchez', email: 'zoey.sanchez@email.com', homeCity: 'Miami' },
  { firstName: 'Gabriel', lastName: 'Morris', email: 'gabriel.morris@email.com', homeCity: 'Oakland' },
  { firstName: 'Nora', lastName: 'Reed', email: 'nora.reed@email.com', homeCity: 'Minneapolis' },
  { firstName: 'Carter', lastName: 'Cook', email: 'carter.cook@email.com', homeCity: 'Tulsa' },
  { firstName: 'Stella', lastName: 'Bailey', email: 'stella.bailey@email.com', homeCity: 'Cleveland' },
  { firstName: 'Wyatt', lastName: 'Rivera', email: 'wyatt.rivera@email.com', homeCity: 'Wichita' },
  { firstName: 'Aurora', lastName: 'Cooper', email: 'aurora.cooper@email.com', homeCity: 'Arlington' }
];

const statusMessages = [
  "Ready to find some clues! 🕵️",
  "Love exploring new places!",
  "Adventure seeker and puzzle solver",
  "Always up for a challenge",
  "Finding hidden treasures one clue at a time",
  "Explorer at heart ❤️",
  "Making memories through discovery",
  "The hunt never ends!",
  "Curiosity is my superpower",
  "Every clue tells a story"
];

const gameMessages = [
  "Anyone found the library clue yet?",
  "That fountain puzzle was tricky!",
  "Great teamwork everyone!",
  "The clock tower hint was genius",
  "Just solved the statue riddle 🎉",
  "This game is addictive!",
  "Love the historical references",
  "Who's up for teaming up?",
  "That was a clever hiding spot",
  "Amazing game design!",
  "The weather is perfect for hunting today",
  "Found 3 clues in one afternoon!",
  "The art museum challenge was my favorite",
  "Anyone else struggling with clue #7?",
  "Pro tip: check behind the monuments",
  "This city has so many hidden gems",
  "Best treasure hunt ever!",
  "The community here is awesome",
  "Just hit level 5! 🎊",
  "Thanks for the hints, team!"
];

function getRandomItems(array, count) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  console.log('🌱 Starting comprehensive database seeding...');

  // Get existing games
  const games = await prisma.game.findMany({
    include: {
      gameClues: {
        include: {
          clueLocation: true
        }
      }
    }
  });

  if (games.length < 2) {
    console.log('❌ Need at least 2 games in database. Please create games first.');
    return;
  }

  console.log(`📊 Found ${games.length} games to seed with players`);

  // Create 50 fake users
  console.log('👥 Creating 50 fake players...');
  const createdUsers = [];
  const hashedPassword = await bcrypt.hash('password123', 10);

  for (const userData of fakeUsers) {
    try {
      const user = await prisma.user.create({
        data: {
          ...userData,
          password: hashedPassword,
          role: 'PLAYER',
          isActive: true,
          statusMessage: statusMessages[Math.floor(Math.random() * statusMessages.length)],
          hobbies: getRandomItems(['Photography', 'History', 'Architecture', 'Walking', 'Puzzles', 'Travel', 'Art', 'Nature'], getRandomInt(2, 4)),
          favoritePlayZones: getRandomItems(['Downtown', 'Historic District', 'University Area', 'Parks', 'Museums', 'Waterfront'], getRandomInt(1, 3))
        }
      });
      createdUsers.push(user);
    } catch (error) {
      if (error.code === 'P2002') {
        console.log(`⚠️  User ${userData.email} already exists, skipping...`);
      } else {
        console.error(`❌ Error creating user ${userData.email}:`, error.message);
      }
    }
  }

  console.log(`✅ Created ${createdUsers.length} new players`);

  // Add players to games (35 players to each game, with overlap)
  console.log('🎮 Adding players to games...');
  
  for (const game of games) {
    // Get 35 random players for this game
    const gamePlayers = getRandomItems(createdUsers, 35);
    
    for (const player of gamePlayers) {
      try {
        await prisma.playerGame.create({
          data: {
            userId: player.id,
            gameId: game.id,
            joinedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
            isActive: true,
            privacyLevel: ['PUBLIC', 'FRIENDS_ONLY', 'PRIVATE'][Math.floor(Math.random() * 3)],
            totalPoints: 0 // Will be updated when we add clue findings
          }
        });
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`⚠️  Player ${player.firstName} already in game ${game.name}, skipping...`);
        } else {
          console.error(`❌ Error adding player to game:`, error.message);
        }
      }
    }
  }

  // Create clue findings for each player in each game
  console.log('🔍 Creating clue findings...');
  
  const playerGames = await prisma.playerGame.findMany({
    where: {
      userId: { in: createdUsers.map(u => u.id) }
    },
    include: {
      game: {
        include: {
          gameClues: true
        }
      }
    }
  });

  for (const playerGame of playerGames) {
    const numFindings = getRandomInt(1, 4);
    const gameClues = playerGame.game.gameClues;
    const selectedClues = getRandomItems(gameClues, Math.min(numFindings, gameClues.length));
    
    let totalPoints = 0;
    
    for (const gameClue of selectedClues) {
      try {
        const points = getRandomInt(10, 100);
        await prisma.clueFinding.create({
          data: {
            userId: playerGame.userId,
            gameClueId: gameClue.id,
            foundAt: new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000), // Random date within last 20 days
            gpsLatitude: 40.7128 + (Math.random() - 0.5) * 0.1, // Random coordinates around NYC
            gpsLongitude: -74.0060 + (Math.random() - 0.5) * 0.1,
            points: points,
            isVerified: Math.random() > 0.1 // 90% verified
          }
        });
        totalPoints += points;
      } catch (error) {
        console.error(`❌ Error creating clue finding:`, error.message);
      }
    }
    
    // Update player's total points
    await prisma.playerGame.update({
      where: { id: playerGame.id },
      data: { totalPoints }
    });
  }

  // Create social connections (frenemies - following relationships)
  console.log('👫 Creating frenemy relationships...');
  
  for (const user of createdUsers) {
    const numFrenemies = getRandomInt(1, 5);
    const potentialFrenemies = createdUsers.filter(u => u.id !== user.id);
    const selectedFrenemies = getRandomItems(potentialFrenemies, numFrenemies);
    
    for (const frenemy of selectedFrenemies) {
      try {
        await prisma.socialConnection.create({
          data: {
            followerId: user.id,
            followingId: frenemy.id,
            createdAt: new Date(Date.now() - Math.random() * 25 * 24 * 60 * 60 * 1000),
            isActive: true
          }
        });
      } catch (error) {
        if (error.code === 'P2002') {
          // Duplicate connection, skip
        } else {
          console.error(`❌ Error creating social connection:`, error.message);
        }
      }
    }
  }

  // Create referral relationships (minions)
  console.log('👑 Creating referral/minion relationships...');
  
  for (const user of createdUsers) {
    const numMinions = getRandomInt(0, 3);
    if (numMinions > 0) {
      const potentialMinions = createdUsers.filter(u => u.id !== user.id);
      const selectedMinions = getRandomItems(potentialMinions, numMinions);
      
      for (const minion of selectedMinions) {
        try {
          await prisma.referral.create({
            data: {
              referrerId: user.id,
              referredId: minion.id,
              referredEmail: minion.email,
              referredFirstName: minion.firstName,
              referredLastName: minion.lastName,
              createdAt: new Date(Date.now() - Math.random() * 35 * 24 * 60 * 60 * 1000),
              status: 'COMPLETED' // They successfully joined
            }
          });
        } catch (error) {
          if (error.code === 'P2002') {
            // Duplicate referral, skip
          } else {
            console.error(`❌ Error creating referral:`, error.message);
          }
        }
      }
    }
  }

  // Create game chat messages and conversations
  console.log('💬 Creating game chat conversations...');
  
  // First, let's check if there are any chat thread models
  try {
    // Get players for each game to create conversations
    for (const game of games) {
      const gamePlayersList = await prisma.playerGame.findMany({
        where: { 
          gameId: game.id,
          userId: { in: createdUsers.map(u => u.id) }
        },
        include: { user: true }
      });

      // Create several conversation threads per game
      const numThreads = getRandomInt(3, 6);
      
      for (let i = 0; i < numThreads; i++) {
        // Select random participants for this conversation
        const numParticipants = getRandomInt(3, 8);
        const threadParticipants = getRandomItems(gamePlayersList, numParticipants);
        
        // Create a series of related messages
        const numMessages = getRandomInt(5, 12);
        let previousMessageTime = new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000);
        
        for (let j = 0; j < numMessages; j++) {
          const sender = threadParticipants[Math.floor(Math.random() * threadParticipants.length)];
          const messageTime = new Date(previousMessageTime.getTime() + Math.random() * 2 * 60 * 60 * 1000); // 0-2 hours later
          
          // For this example, we'll just log what we would create since the exact chat schema isn't visible
          console.log(`📝 Would create message from ${sender.user.firstName}: "${gameMessages[Math.floor(Math.random() * gameMessages.length)]}" in game ${game.name}`);
          
          previousMessageTime = messageTime;
        }
      }
    }
  } catch (error) {
    console.log('ℹ️  Chat system not available, skipping chat messages');
  }

  console.log('📊 Final statistics:');
  
  // Print some statistics
  const totalUsers = await prisma.user.count();
  const totalPlayerGames = await prisma.playerGame.count();
  const totalClueFindings = await prisma.clueFinding.count();
  const totalSocialConnections = await prisma.socialConnection.count();
  const totalReferrals = await prisma.referral.count();
  
  console.log(`👥 Total users: ${totalUsers}`);
  console.log(`🎮 Total player-game relationships: ${totalPlayerGames}`);
  console.log(`🔍 Total clue findings: ${totalClueFindings}`);
  console.log(`👫 Total social connections: ${totalSocialConnections}`);
  console.log(`👑 Total referrals: ${totalReferrals}`);
  
  // Show some sample data
  console.log('\n🎯 Sample player with relationships:');
  const samplePlayer = createdUsers[0];
  const playerStats = await prisma.user.findUnique({
    where: { id: samplePlayer.id },
    include: {
      playerGames: {
        include: { game: { select: { name: true } } }
      },
      clueFindings: { select: { points: true } },
      following: { 
        include: { following: { select: { firstName: true, lastName: true } } }
      },
      followers: {
        include: { follower: { select: { firstName: true, lastName: true } } }
      },
      referrals: {
        include: { referred: { select: { firstName: true, lastName: true } } }
      }
    }
  });

  if (playerStats) {
    console.log(`📋 ${playerStats.firstName} ${playerStats.lastName}:`);
    console.log(`   🎮 Playing ${playerStats.playerGames.length} games: ${playerStats.playerGames.map(pg => pg.game.name).join(', ')}`);
    console.log(`   🔍 Found ${playerStats.clueFindings.length} clues (${playerStats.clueFindings.reduce((sum, cf) => sum + cf.points, 0)} total points)`);
    console.log(`   👫 Following ${playerStats.following.length} players: ${playerStats.following.slice(0, 3).map(f => f.following.firstName).join(', ')}${playerStats.following.length > 3 ? '...' : ''}`);
    console.log(`   👑 Has ${playerStats.followers.length} followers: ${playerStats.followers.slice(0, 3).map(f => f.follower.firstName).join(', ')}${playerStats.followers.length > 3 ? '...' : ''}`);
    console.log(`   🎯 Referred ${playerStats.referrals.length} players: ${playerStats.referrals.map(r => r.referred?.firstName || 'Unknown').join(', ')}`);
  }

  console.log('\n🎉 Database seeding completed successfully!');
  console.log('🔍 You can now test the player search features with rich data!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });