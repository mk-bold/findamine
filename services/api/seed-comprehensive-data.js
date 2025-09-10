const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

// BYU Campus locations (25 locations around campus)
const byuCampusLocations = [
  {
    identifyingName: "Brigham Young Statue",
    anonymizedName: "Historic Campus Statue",
    latitude: 40.249089,
    longitude: -111.649233,
    text: "Find the statue of the university's founder standing proudly in the center of campus.",
    hint: "Look for the bronze figure with outstretched arm near the main campus walkway."
  },
  {
    identifyingName: "Harold B. Lee Library",
    anonymizedName: "Main Campus Library",
    latitude: 40.249686,
    longitude: -111.649040,
    text: "Locate the tallest building on campus, home to millions of books and resources.",
    hint: "This tower of knowledge can be seen from across the valley."
  },
  {
    identifyingName: "Wilkinson Student Center",
    anonymizedName: "Student Union Building",
    latitude: 40.250415,
    longitude: -111.652478,
    text: "Find the heart of student life where food, activities, and gatherings take place.",
    hint: "Students congregate here between classes for meals and socializing."
  },
  {
    identifyingName: "LaVell Edwards Stadium",
    anonymizedName: "Football Stadium",
    latitude: 40.253500,
    longitude: -111.652800,
    text: "Discover where Cougar football teams have played for decades.",
    hint: "The roar of the crowd echoes from this athletic venue on game days."
  },
  {
    identifyingName: "Marriott Center",
    anonymizedName: "Basketball Arena",
    latitude: 40.251878,
    longitude: -111.652122,
    text: "Find the dome-shaped building where basketball games create thunderous noise.",
    hint: "This rounded roof structure hosts sporting events and large gatherings."
  },
  {
    identifyingName: "Tanner Building",
    anonymizedName: "Business School",
    latitude: 40.249444,
    longitude: -111.651667,
    text: "Locate the building where future business leaders study commerce and economics.",
    hint: "This modern facility houses the school of management and business education."
  },
  {
    identifyingName: "Jesse Knight Building",
    anonymizedName: "Humanities Building",
    latitude: 40.248611,
    longitude: -111.650278,
    text: "Find where languages, literature, and liberal arts are taught.",
    hint: "Students of words and culture gather in this academic building."
  },
  {
    identifyingName: "Eyring Science Center",
    anonymizedName: "Science Laboratory Building",
    latitude: 40.248889,
    longitude: -111.648056,
    text: "Discover the building where scientific experiments and research take place.",
    hint: "Chemistry, biology, and physics labs fill this research facility."
  },
  {
    identifyingName: "Monte L. Bean Life Science Museum",
    anonymizedName: "Natural History Museum",
    latitude: 40.249722,
    longitude: -111.647222,
    text: "Find the building displaying nature's wonders and biological specimens.",
    hint: "Preserved animals and natural exhibits are housed in this educational space."
  },
  {
    identifyingName: "Helaman Halls",
    anonymizedName: "Freshman Dormitories",
    latitude: 40.253889,
    longitude: -111.649167,
    text: "Locate where first-year students begin their college journey.",
    hint: "These residence halls house new students adapting to university life."
  },
  {
    identifyingName: "Benson Science Building",
    anonymizedName: "Chemistry Building",
    latitude: 40.248333,
    longitude: -111.648889,
    text: "Find where chemical reactions and molecular studies take place.",
    hint: "The scent of scientific discovery fills this chemistry-focused facility."
  },
  {
    identifyingName: "Joseph F. Smith Building",
    anonymizedName: "Education Building",
    latitude: 40.251111,
    longitude: -111.651111,
    text: "Discover where future teachers learn the art of education.",
    hint: "This building prepares educators who will shape young minds."
  },
  {
    identifyingName: "Joseph Knight Building",
    anonymizedName: "Engineering Complex",
    latitude: 40.247500,
    longitude: -111.649444,
    text: "Find where innovative engineers solve tomorrow's problems.",
    hint: "Technology and engineering solutions are developed in this modern complex."
  },
  {
    identifyingName: "Conference Center",
    anonymizedName: "Large Assembly Hall",
    latitude: 40.252500,
    longitude: -111.653333,
    text: "Locate the venue for major university gatherings and ceremonies.",
    hint: "Important university events and conferences take place in this spacious hall."
  },
  {
    identifyingName: "Cannon Center",
    anonymizedName: "Student Dining Hall",
    latitude: 40.254167,
    longitude: -111.650556,
    text: "Find where residential students gather for daily meals.",
    hint: "The aroma of food and student conversations fill this dining facility."
  },
  {
    identifyingName: "Abraham Smoot Building",
    anonymizedName: "Administration Building",
    latitude: 40.250278,
    longitude: -111.650833,
    text: "Discover the building housing university administrative offices.",
    hint: "Important university decisions and student services are centered here."
  },
  {
    identifyingName: "Morris Center",
    anonymizedName: "Fine Arts Complex",
    latitude: 40.251944,
    longitude: -111.647778,
    text: "Find where creative arts and cultural performances come alive.",
    hint: "Music, theater, and artistic expression flourish in this cultural center."
  },
  {
    identifyingName: "Hinckley Alumni Center",
    anonymizedName: "Alumni Building",
    latitude: 40.247778,
    longitude: -111.651389,
    text: "Locate where graduates maintain connections to their alma mater.",
    hint: "Former students gather here to celebrate their university heritage."
  },
  {
    identifyingName: "Clyde Building",
    anonymizedName: "Engineering Research Facility",
    latitude: 40.246944,
    longitude: -111.650000,
    text: "Find the building dedicated to advanced engineering research.",
    hint: "Cutting-edge technological research and development happens here."
  },
  {
    identifyingName: "Richards Athletic Center",
    anonymizedName: "Indoor Sports Complex",
    latitude: 40.252222,
    longitude: -111.653889,
    text: "Discover the facility for indoor athletic training and activities.",
    hint: "Athletes train and compete in various indoor sports within these walls."
  },
  {
    identifyingName: "Museum of Art",
    anonymizedName: "Art Gallery",
    latitude: 40.250000,
    longitude: -111.648611,
    text: "Find where artistic masterpieces and cultural exhibits are displayed.",
    hint: "Visual arts and cultural treasures are preserved and showcased here."
  },
  {
    identifyingName: "Kimball Tower",
    anonymizedName: "Residential Tower",
    latitude: 40.253056,
    longitude: -111.648333,
    text: "Locate the tall residence hall housing upper-class students.",
    hint: "This vertical living space provides elevated views of campus and valley."
  },
  {
    identifyingName: "Spencer W. Kimball Tower",
    anonymizedName: "Academic Tower",
    latitude: 40.250556,
    longitude: -111.647500,
    text: "Find the tower dedicated to academic excellence and learning.",
    hint: "This prominent tower stands as a symbol of educational achievement."
  },
  {
    identifyingName: "BYU Bookstore",
    anonymizedName: "Campus Store",
    latitude: 40.251667,
    longitude: -111.651944,
    text: "Discover where students purchase textbooks and university merchandise.",
    hint: "Academic materials and school-spirited items are sold at this campus retailer."
  },
  {
    identifyingName: "Harris Fine Arts Center",
    anonymizedName: "Performing Arts Building",
    latitude: 40.251389,
    longitude: -111.647222,
    text: "Find where theatrical performances and musical concerts take place.",
    hint: "The stage comes alive with dramatic and musical performances in this venue."
  }
];

// Generate realistic player names
const firstNames = [
  'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Elijah', 'Sophia', 'Oliver', 'Charlotte', 'James',
  'Amelia', 'Benjamin', 'Isabella', 'Lucas', 'Mia', 'Henry', 'Evelyn', 'Alexander', 'Harper', 'Mason',
  'Camila', 'Michael', 'Gianna', 'Ethan', 'Abigail', 'Daniel', 'Luna', 'Jacob', 'Ella', 'Logan',
  'Elizabeth', 'Jackson', 'Sofia', 'Levi', 'Emily', 'Sebastian', 'Avery', 'Mateo', 'Mila', 'Jack',
  'Scarlett', 'Owen', 'Eleanor', 'Theodore', 'Madison', 'Aiden', 'Layla', 'Samuel', 'Penelope', 'Joseph'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
  'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts'
];

// Game-related conversation topics
const conversationTopics = [
  {
    topic: "clue_help",
    messages: [
      "Has anyone found the clue near the library yet?",
      "I'm stuck on the one about the bronze statue. Any hints?",
      "Check the west side of the building!",
      "Thanks! That helped a lot!",
      "The GPS verification is tricky on this one"
    ]
  },
  {
    topic: "game_strategy",
    messages: [
      "What's everyone's strategy for maximizing points?",
      "I'm focusing on the easier clues first",
      "Good idea! Building momentum is key",
      "The time bonuses really add up",
      "Has anyone figured out the point multiplier system?"
    ]
  },
  {
    topic: "location_discussion",
    messages: [
      "This campus is huge! So many places to explore",
      "I never knew about half these locations",
      "The historical facts in the clues are really interesting",
      "Learning so much about the area through this game",
      "Some of these spots have amazing views!"
    ]
  },
  {
    topic: "team_coordination",
    messages: [
      "Should we split up to cover more ground?",
      "Good idea! I'll take the north side",
      "I'll cover the athletic buildings",
      "Let's meet back here in an hour",
      "Don't forget to share your findings!"
    ]
  },
  {
    topic: "general_excitement",
    messages: [
      "This game is so much fun!",
      "I'm getting my steps in for sure!",
      "Great way to explore the area",
      "Love the competitive element",
      "Can't wait for the next game!"
    ]
  }
];

async function main() {
  console.log('🌱 Starting comprehensive database seeding...');

  try {
    // 1. Update gamemanager role and create admin
    console.log('📝 Updating user roles...');
    
    // Change gamemanager to GAME_MASTER role
    await prisma.user.update({
      where: { email: 'gamemanager@findamine.app' },
      data: { role: 'GAME_MASTER' }
    });

    // Create new admin account
    const hashedPassword = await bcrypt.hash('password123', 10);
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@findamine.app' },
      create: {
        email: 'admin@findamine.app',
        password: hashedPassword,
        firstName: 'System',
        lastName: 'Administrator',
        role: 'ADMIN',
        agreedToTerms: true,
        agreedToPrivacy: true,
        gamerTag: 'SysAdmin'
      },
      update: {
        role: 'ADMIN'
      }
    });

    console.log('✅ User roles updated successfully');

    // 2. Add BYU Campus clue locations
    console.log('🏫 Adding 25 BYU Campus clue locations...');
    
    const clueLocations = [];
    for (const location of byuCampusLocations) {
      const clueLocation = await prisma.clueLocation.create({
        data: {
          identifyingName: location.identifyingName,
          anonymizedName: location.anonymizedName,
          latitude: location.latitude,
          longitude: location.longitude,
          text: location.text,
          hint: location.hint,
          gpsVerificationRadius: 25.0 + Math.random() * 25.0, // 25-50 meters
          requiresSelfie: Math.random() > 0.3 // 70% require selfies
        }
      });
      clueLocations.push(clueLocation);
    }

    console.log('✅ Added 25 BYU Campus clue locations');

    // 3. Get existing games
    const byuGame = await prisma.game.findFirst({
      where: { name: 'BYU Campus' }
    });
    const nycGame = await prisma.game.findFirst({
      where: { name: 'NYC' }
    });

    if (!byuGame || !nycGame) {
      throw new Error('Required games not found. Please ensure BYU Campus and NYC games exist.');
    }

    // 4. Assign 10 random clue locations to BYU Campus game
    console.log('🎯 Assigning 10 clues to BYU Campus game...');
    
    // Shuffle clue locations and take first 10
    const shuffledLocations = clueLocations.sort(() => Math.random() - 0.5);
    const selectedLocations = shuffledLocations.slice(0, 10);

    for (let i = 0; i < selectedLocations.length; i++) {
      const location = selectedLocations[i];
      await prisma.gameClue.create({
        data: {
          gameId: byuGame.id,
          clueLocationId: location.id,
          points: 100 + Math.floor(Math.random() * 150), // 100-250 points
          releaseTime: new Date(Date.now() + i * 60000), // Stagger releases by 1 minute
          isReleased: true
        }
      });
    }

    console.log('✅ Assigned 10 clues to BYU Campus game');

    // 5. Generate 50 new players
    console.log('👥 Generating 50 new players...');
    
    const newPlayers = [];
    for (let i = 0; i < 50; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i + 1}@student.byu.edu`;
      const gamerTag = `${firstName}${lastName}${Math.floor(Math.random() * 999)}`;
      
      try {
        const player = await prisma.user.create({
          data: {
            email: email,
            password: hashedPassword,
            firstName: firstName,
            lastName: lastName,
            role: 'PLAYER',
            agreedToTerms: true,
            agreedToPrivacy: true,
            gamerTag: gamerTag,
            homeCity: ['Provo', 'Salt Lake City', 'Orem', 'Ogden', 'Logan'][Math.floor(Math.random() * 5)],
            country: 'USA',
            state: 'Utah',
            dateOfBirth: new Date(1995 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
          }
        });
        newPlayers.push(player);
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`⚠️ Skipping duplicate email: ${email}`);
        } else {
          throw error;
        }
      }
    }

    console.log(`✅ Generated ${newPlayers.length} new players`);

    // 6. Get all existing players
    const allPlayers = await prisma.user.findMany({
      where: { role: 'PLAYER' }
    });

    console.log(`📊 Total players in database: ${allPlayers.length}`);

    // 7. Connect players to games
    console.log('🎮 Connecting players to games...');
    
    // Shuffle all players
    const shuffledPlayers = allPlayers.sort(() => Math.random() - 0.5);
    
    // Connect first 35 to NYC game, next 35 to BYU game
    // Some will overlap if we have enough players
    const nycPlayers = shuffledPlayers.slice(0, Math.min(35, shuffledPlayers.length));
    const byuPlayers = shuffledPlayers.slice(Math.max(0, shuffledPlayers.length - 35));
    
    // Add NYC game players
    for (const player of nycPlayers) {
      try {
        await prisma.playerGame.create({
          data: {
            userId: player.id,
            gameId: nycGame.id,
            totalPoints: Math.floor(Math.random() * 1000),
            privacyLevel: ['PRIVATE', 'MINIONS_ONLY', 'PUBLIC'][Math.floor(Math.random() * 3)]
          }
        });
      } catch (error) {
        if (error.code !== 'P2002') throw error; // Ignore duplicate entries
      }
    }

    // Add BYU game players
    for (const player of byuPlayers) {
      try {
        await prisma.playerGame.create({
          data: {
            userId: player.id,
            gameId: byuGame.id,
            totalPoints: Math.floor(Math.random() * 1000),
            privacyLevel: ['PRIVATE', 'MINIONS_ONLY', 'PUBLIC'][Math.floor(Math.random() * 3)]
          }
        });
      } catch (error) {
        if (error.code !== 'P2002') throw error; // Ignore duplicate entries
      }
    }

    console.log(`✅ Connected ${nycPlayers.length} players to NYC game`);
    console.log(`✅ Connected ${byuPlayers.length} players to BYU Campus game`);

    // 8. Add clue findings for each player in each game
    console.log('🔍 Adding clue findings for players...');
    
    // Get game clues for each game
    const nycGameClues = await prisma.gameClue.findMany({
      where: { gameId: nycGame.id }
    });
    const byuGameClues = await prisma.gameClue.findMany({
      where: { gameId: byuGame.id }
    });

    // Add findings for NYC game players
    for (const player of nycPlayers) {
      const findingsCount = Math.floor(Math.random() * 10) + 1; // 1-10 findings
      const selectedClues = nycGameClues.sort(() => Math.random() - 0.5).slice(0, Math.min(findingsCount, nycGameClues.length));
      
      for (const gameClue of selectedClues) {
        const clueLocation = await prisma.clueLocation.findUnique({
          where: { id: gameClue.clueLocationId }
        });
        
        try {
          await prisma.clueFinding.create({
            data: {
              userId: player.id,
              gameClueId: gameClue.id,
              points: gameClue.points,
              gpsLatitude: clueLocation.latitude + (Math.random() - 0.5) * 0.0001, // Small GPS variation
              gpsLongitude: clueLocation.longitude + (Math.random() - 0.5) * 0.0001,
              selfiePhoto: Math.random() > 0.5 ? `selfie_${player.id}_${gameClue.id}.jpg` : null,
              shareFind: Math.random() > 0.7, // 30% share their finds
              sharePhoto: Math.random() > 0.8, // 20% share their photos
              foundAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Random time in last week
            }
          });
        } catch (error) {
          if (error.code !== 'P2002') throw error; // Ignore duplicate findings
        }
      }
    }

    // Add findings for BYU game players
    for (const player of byuPlayers) {
      const findingsCount = Math.floor(Math.random() * 10) + 1; // 1-10 findings
      const selectedClues = byuGameClues.sort(() => Math.random() - 0.5).slice(0, Math.min(findingsCount, byuGameClues.length));
      
      for (const gameClue of selectedClues) {
        const clueLocation = await prisma.clueLocation.findUnique({
          where: { id: gameClue.clueLocationId }
        });
        
        try {
          await prisma.clueFinding.create({
            data: {
              userId: player.id,
              gameClueId: gameClue.id,
              points: gameClue.points,
              gpsLatitude: clueLocation.latitude + (Math.random() - 0.5) * 0.0001,
              gpsLongitude: clueLocation.longitude + (Math.random() - 0.5) * 0.0001,
              selfiePhoto: Math.random() > 0.5 ? `selfie_${player.id}_${gameClue.id}.jpg` : null,
              shareFind: Math.random() > 0.7,
              sharePhoto: Math.random() > 0.8,
              foundAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
            }
          });
        } catch (error) {
          if (error.code !== 'P2002') throw error; // Ignore duplicate findings
        }
      }
    }

    console.log('✅ Added clue findings for all players');

    // 9. Generate chat conversations
    console.log('💬 Generating chat conversations...');
    
    // Generate conversations for NYC game
    const nycPlayerGames = await prisma.playerGame.findMany({
      where: { gameId: nycGame.id },
      include: { user: true }
    });

    // Generate conversations for BYU game
    const byuPlayerGames = await prisma.playerGame.findMany({
      where: { gameId: byuGame.id },
      include: { user: true }
    });

    // Generate NYC conversations
    for (let i = 0; i < 5; i++) { // 5 conversation chains
      const topic = conversationTopics[Math.floor(Math.random() * conversationTopics.length)];
      const participants = nycPlayerGames.sort(() => Math.random() - 0.5).slice(0, Math.random() * 4 + 2); // 2-5 participants
      
      for (let msgIndex = 0; msgIndex < topic.messages.length && msgIndex < participants.length; msgIndex++) {
        const participant = participants[msgIndex % participants.length];
        const baseTime = Date.now() - (Math.random() * 3 * 24 * 60 * 60 * 1000); // Last 3 days
        
        await prisma.chatPost.create({
          data: {
            gameId: nycGame.id,
            userId: participant.userId,
            content: topic.messages[msgIndex],
            createdAt: new Date(baseTime + msgIndex * 5 * 60 * 1000) // 5 minutes between messages
          }
        });
      }
    }

    // Generate BYU conversations
    for (let i = 0; i < 5; i++) { // 5 conversation chains
      const topic = conversationTopics[Math.floor(Math.random() * conversationTopics.length)];
      const participants = byuPlayerGames.sort(() => Math.random() - 0.5).slice(0, Math.random() * 4 + 2); // 2-5 participants
      
      for (let msgIndex = 0; msgIndex < topic.messages.length && msgIndex < participants.length; msgIndex++) {
        const participant = participants[msgIndex % participants.length];
        const baseTime = Date.now() - (Math.random() * 3 * 24 * 60 * 60 * 1000); // Last 3 days
        
        await prisma.chatPost.create({
          data: {
            gameId: byuGame.id,
            userId: participant.userId,
            content: topic.messages[msgIndex],
            createdAt: new Date(baseTime + msgIndex * 5 * 60 * 1000) // 5 minutes between messages
          }
        });
      }
    }

    console.log('✅ Generated chat conversations for both games');

    // 10. Update player game stats
    console.log('📊 Updating player statistics...');
    
    // Update total points for each player based on their findings
    const playerStats = await prisma.clueFinding.groupBy({
      by: ['userId'],
      _sum: {
        points: true
      }
    });

    for (const stat of playerStats) {
      // Update player games with correct total points
      await prisma.playerGame.updateMany({
        where: { userId: stat.userId },
        data: { totalPoints: stat._sum.points || 0 }
      });
    }

    console.log('✅ Updated player statistics');

    console.log('🎉 Comprehensive database seeding completed successfully!');
    console.log('\n📈 Summary:');
    console.log(`• 25 BYU Campus clue locations added`);
    console.log(`• 10 clues assigned to BYU Campus game`);
    console.log(`• ${newPlayers.length} new players generated`);
    console.log(`• ${nycPlayers.length} players connected to NYC game`);
    console.log(`• ${byuPlayers.length} players connected to BYU Campus game`);
    console.log(`• Clue findings generated for all players`);
    console.log(`• Chat conversations generated for both games`);
    console.log(`• User roles updated (gamemanager → GAME_MANAGER, new admin created)`);

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });