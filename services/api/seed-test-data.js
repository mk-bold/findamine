const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding test data...');

  // Get the first game (assuming there's only one)
  const game = await prisma.game.findFirst();
  if (!game) {
    console.error('❌ No game found in database. Please create a game first.');
    return;
  }

  console.log(`📋 Using game: ${game.name} (ID: ${game.id})`);

  // Get some clues from the game
  const gameClues = await prisma.gameClue.findMany({
    where: { gameId: game.id },
    include: { clueLocation: true },
    take: 10 // We'll use up to 10 clues
  });

  if (gameClues.length === 0) {
    console.error('❌ No clues found in the game. Please add some clues first.');
    return;
  }

  console.log(`🎯 Found ${gameClues.length} clues in the game`);

  // Sample player data
  const players = [
    {
      email: 'alice.johnson.test@example.com',
      gamerTag: 'alice_j_test',
      firstName: 'Alice',
      lastName: 'Johnson',
      password: '$2b$10$example.hash.for.testing', // Dummy hash
      dateOfBirth: new Date('1995-03-15')
    },
    {
      email: 'bob.smith.test@example.com',
      gamerTag: 'bob_smith_test',
      firstName: 'Bob',
      lastName: 'Smith',
      password: '$2b$10$example.hash.for.testing',
      dateOfBirth: new Date('1992-07-22')
    },
    {
      email: 'carol.davis.test@example.com',
      gamerTag: 'carol_d_test',
      firstName: 'Carol',
      lastName: 'Davis',
      password: '$2b$10$example.hash.for.testing',
      dateOfBirth: new Date('1988-11-08')
    },
    {
      email: 'david.wilson.test@example.com',
      gamerTag: 'david_w_test',
      firstName: 'David',
      lastName: 'Wilson',
      password: '$2b$10$example.hash.for.testing',
      dateOfBirth: new Date('1990-05-12')
    },
    {
      email: 'emma.brown.test@example.com',
      gamerTag: 'emma_b_test',
      firstName: 'Emma',
      lastName: 'Brown',
      password: '$2b$10$example.hash.for.testing',
      dateOfBirth: new Date('1993-09-30')
    },
    {
      email: 'frank.miller.test@example.com',
      gamerTag: 'frank_m_test',
      firstName: 'Frank',
      lastName: 'Miller',
      password: '$2b$10$example.hash.for.testing',
      dateOfBirth: new Date('1987-12-03')
    },
    {
      email: 'grace.taylor.test@example.com',
      gamerTag: 'grace_t_test',
      firstName: 'Grace',
      lastName: 'Taylor',
      password: '$2b$10$example.hash.for.testing',
      dateOfBirth: new Date('1991-04-18')
    },
    {
      email: 'henry.anderson.test@example.com',
      gamerTag: 'henry_a_test',
      firstName: 'Henry',
      lastName: 'Anderson',
      password: '$2b$10$example.hash.for.testing',
      dateOfBirth: new Date('1989-08-25')
    },
    {
      email: 'iris.thomas.test@example.com',
      gamerTag: 'iris_t_test',
      firstName: 'Iris',
      lastName: 'Thomas',
      password: '$2b$10$example.hash.for.testing',
      dateOfBirth: new Date('1994-01-14')
    },
    {
      email: 'jack.garcia.test@example.com',
      gamerTag: 'jack_g_test',
      firstName: 'Jack',
      lastName: 'Garcia',
      password: '$2b$10$example.hash.for.testing',
      dateOfBirth: new Date('1996-06-07')
    }
  ];

  // Get or create players
  console.log('👥 Getting players...');
  const createdPlayers = [];
  
  for (const playerData of players) {
    try {
      // Try to find existing player first
      let player = await prisma.user.findUnique({
        where: { email: playerData.email }
      });
      
      if (!player) {
        // Create new player if doesn't exist
        player = await prisma.user.create({
          data: {
            ...playerData,
            role: 'PLAYER',
            isActive: true
          }
        });
        console.log(`✅ Created player: ${player.gamerTag}`);
      } else {
        console.log(`✅ Found existing player: ${player.gamerTag}`);
      }
      
      createdPlayers.push(player);
    } catch (error) {
      console.log(`⚠️  Error with player ${playerData.gamerTag}: ${error.message}`);
    }
  }

  console.log(`👥 Working with ${createdPlayers.length} players`);

  // Create clue findings for each player (3 random findings per player)
  console.log('🎯 Creating clue findings...');
  let totalFindings = 0;

  for (const player of createdPlayers) {
    // Randomly select 3 clues for this player
    const shuffledClues = [...gameClues].sort(() => 0.5 - Math.random());
    const selectedClues = shuffledClues.slice(0, 3);

    for (const gameClue of selectedClues) {
      try {
        const finding = await prisma.clueFinding.create({
          data: {
            userId: player.id,
            gameClueId: gameClue.id,
            foundAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random time within last week
            points: gameClue.points,
            selfiePhoto: `https://example.com/selfies/${player.gamerTag}_${gameClue.id}.jpg`,
            gpsLatitude: gameClue.clueLocation.latitude + (Math.random() - 0.5) * 0.001, // Small random offset
            gpsLongitude: gameClue.clueLocation.longitude + (Math.random() - 0.5) * 0.001,
            shareFind: true,
            sharePhoto: true
          }
        });
        totalFindings++;
        console.log(`✅ Created finding for ${player.gamerTag} at ${gameClue.clueLocation.identifyingName}`);
      } catch (error) {
        console.log(`⚠️  Finding for ${player.gamerTag} at ${gameClue.clueLocation.identifyingName} might already exist, skipping...`);
      }
    }
  }

  console.log(`🎯 Created ${totalFindings} clue findings`);

  // Create chat posts for each player (2-5 posts per player)
  console.log('💬 Creating chat posts...');
  let totalPosts = 0;

  const sampleMessages = [
    "Just found the first clue! This is so exciting! 🎉",
    "Anyone else having trouble with clue #3? 🤔",
    "The view from this location is amazing! 📸",
    "I think I'm getting close to solving this puzzle...",
    "Great teamwork everyone! Let's keep going! 💪",
    "This game is so much fun! Can't wait for the next clue.",
    "Found it! The hint was really helpful.",
    "Anyone want to team up for the next challenge?",
    "The GPS coordinates led me right here! 🗺️",
    "This is harder than I thought, but I love the challenge!",
    "Just uploaded my selfie - hope it's good enough! 😄",
    "The historical significance of this location is incredible.",
    "I've been here before but never noticed this detail!",
    "The puzzle pieces are starting to come together...",
    "Thanks for the help in the chat earlier! 🙏",
    "This game is bringing out my inner detective! 🕵️",
    "The clues are getting more challenging - I love it!",
    "Found another one! The pattern is becoming clear.",
    "This location has such interesting history!",
    "Can't believe how much I'm learning about the city!",
    "The teamwork in this game is amazing! 🤝",
    "Just when I thought I was stuck, the hint saved me!",
    "The attention to detail in these clues is impressive.",
    "I'm getting better at reading maps thanks to this game!",
    "The community aspect of this game is fantastic!",
    "Each clue feels like a mini adventure! 🗺️",
    "The selfie requirement adds such a fun element!",
    "I'm learning so much about local landmarks!",
    "The point system is really motivating! 🏆",
    "This game is perfect for exploring the city!",
    "The clues are challenging but fair - great balance!",
    "I love how this game combines history and adventure!",
    "The GPS verification is so precise - impressive!",
    "Each finding feels like a real accomplishment! 🎯",
    "The game design is really well thought out!",
    "I'm getting addicted to these clue hunts! 😅",
    "The variety in clue types keeps it interesting!",
    "This is the most fun I've had exploring the city!",
    "The community chat makes it feel like a team effort!",
    "I can't wait to see what the next clue brings! 🔍"
  ];

  for (const player of createdPlayers) {
    // Random number of posts between 2 and 5
    const numPosts = Math.floor(Math.random() * 4) + 2;
    
    for (let i = 0; i < numPosts; i++) {
      try {
        const randomMessage = sampleMessages[Math.floor(Math.random() * sampleMessages.length)];
        const postTime = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000); // Random time within last week

        const post = await prisma.chatPost.create({
          data: {
            userId: player.id,
            gameId: game.id,
            content: randomMessage,
            createdAt: postTime,
            updatedAt: postTime
          }
        });
        totalPosts++;
        console.log(`✅ Created chat post for ${player.gamerTag}: "${randomMessage.substring(0, 50)}..."`);
      } catch (error) {
        console.log(`⚠️  Chat post for ${player.gamerTag} might have failed, skipping...`);
      }
    }
  }

  console.log(`💬 Created ${totalPosts} chat posts`);

  console.log('🎉 Test data seeding completed!');
  console.log(`📊 Summary:`);
  console.log(`   - Players: ${createdPlayers.length}`);
  console.log(`   - Clue Findings: ${totalFindings}`);
  console.log(`   - Chat Posts: ${totalPosts}`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding test data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
