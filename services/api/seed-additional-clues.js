const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedAdditionalClues() {
  try {
    console.log('🌱 Starting to seed additional clues...');

    // 40 Additional NYC Clues
    const nycClues = [
      // Manhattan - Upper East Side
      { identifyingName: "Metropolitan Museum of Art", anonymizedName: "Art Museum", latitude: 40.7794, longitude: -73.9632, text: "Find the grand staircase in this world-famous art museum.", hint: "Look for the iconic steps where many movies have been filmed.", gpsVerificationRadius: 20, requiresSelfie: true },
      { identifyingName: "Guggenheim Museum", anonymizedName: "Spiral Museum", latitude: 40.7830, longitude: -73.9590, text: "Discover the unique spiral architecture of this modern art museum.", hint: "The building itself is a work of art with a distinctive shape.", gpsVerificationRadius: 15, requiresSelfie: true },
      { identifyingName: "Central Park Zoo", anonymizedName: "Animal Park", latitude: 40.7681, longitude: -73.9719, text: "Visit the sea lions at this urban zoo in the heart of the park.", hint: "Listen for the barking sounds near the water.", gpsVerificationRadius: 25, requiresSelfie: true },
      { identifyingName: "Belvedere Castle", anonymizedName: "Park Castle", latitude: 40.7795, longitude: -73.9692, text: "Climb to the top of this Victorian castle for panoramic views.", hint: "It's the highest point in Central Park.", gpsVerificationRadius: 20, requiresSelfie: true },
      { identifyingName: "Strawberry Fields", anonymizedName: "Memorial Garden", latitude: 40.7756, longitude: -73.9762, text: "Pay tribute at this peaceful memorial garden dedicated to a music legend.", hint: "Look for the mosaic with the word 'Imagine'.", gpsVerificationRadius: 15, requiresSelfie: true },

      // Manhattan - Midtown
      { identifyingName: "Rockefeller Center", anonymizedName: "Art Deco Complex", latitude: 40.7587, longitude: -73.9787, text: "Find the famous ice skating rink and golden statue.", hint: "Look for the golden figure above the skating area.", gpsVerificationRadius: 30, requiresSelfie: true },
      { identifyingName: "St. Patrick's Cathedral", anonymizedName: "Gothic Cathedral", latitude: 40.7584, longitude: -73.9762, text: "Marvel at the stunning Gothic architecture of this historic cathedral.", hint: "It's the largest Gothic-style Catholic cathedral in the United States.", gpsVerificationRadius: 20, requiresSelfie: true },
      { identifyingName: "Museum of Modern Art", anonymizedName: "Modern Art Gallery", latitude: 40.7614, longitude: -73.9776, text: "Discover contemporary masterpieces in this world-renowned museum.", hint: "Look for the famous painting with melting clocks.", gpsVerificationRadius: 25, requiresSelfie: true },
      { identifyingName: "Carnegie Hall", anonymizedName: "Concert Venue", latitude: 40.7648, longitude: -73.9808, text: "Stand where the world's greatest musicians have performed.", hint: "This legendary venue has hosted performances for over 130 years.", gpsVerificationRadius: 15, requiresSelfie: true },
      { identifyingName: "Radio City Music Hall", anonymizedName: "Art Deco Theater", latitude: 40.7600, longitude: -73.9799, text: "Experience the grandeur of this iconic Art Deco theater.", hint: "Look for the famous Rockettes and the Great Stage.", gpsVerificationRadius: 20, requiresSelfie: true },

      // Manhattan - Lower Manhattan
      { identifyingName: "One World Trade Center", anonymizedName: "Freedom Tower", latitude: 40.7127, longitude: -74.0134, text: "Visit the tallest building in the Western Hemisphere.", hint: "This tower stands as a symbol of resilience and hope.", gpsVerificationRadius: 30, requiresSelfie: true },
      { identifyingName: "Trinity Church", anonymizedName: "Historic Church", latitude: 40.7081, longitude: -74.0121, text: "Explore this historic church that survived the Great Fire of 1776.", hint: "Look for the famous cemetery with notable graves.", gpsVerificationRadius: 20, requiresSelfie: true },
      { identifyingName: "Federal Hall", anonymizedName: "Historic Building", latitude: 40.7074, longitude: -74.0105, text: "Stand where George Washington was inaugurated as President.", hint: "This building witnessed the birth of American democracy.", gpsVerificationRadius: 15, requiresSelfie: true },
      { identifyingName: "Charging Bull", anonymizedName: "Bronze Statue", latitude: 40.7055, longitude: -74.0134, text: "Find the famous bronze bull that symbolizes Wall Street's power.", hint: "This statue represents the strength and resilience of the American people.", gpsVerificationRadius: 10, requiresSelfie: true },
      { identifyingName: "South Street Seaport", anonymizedName: "Historic Port", latitude: 40.7074, longitude: -74.0033, text: "Explore this historic port area with its cobblestone streets.", hint: "Look for the tall ships and maritime museum.", gpsVerificationRadius: 25, requiresSelfie: true },

      // Brooklyn
      { identifyingName: "Brooklyn Museum", anonymizedName: "Art Museum", latitude: 40.6712, longitude: -73.9638, text: "Discover one of the largest art museums in the United States.", hint: "This museum houses an extensive collection of Egyptian art.", gpsVerificationRadius: 30, requiresSelfie: true },
      { identifyingName: "Prospect Park", anonymizedName: "Urban Park", latitude: 40.6602, longitude: -73.9690, text: "Find the beautiful lake and boathouse in this expansive park.", hint: "This park was designed by the same architects as Central Park.", gpsVerificationRadius: 40, requiresSelfie: true },
      { identifyingName: "Coney Island Boardwalk", anonymizedName: "Historic Boardwalk", latitude: 40.5749, longitude: -73.9857, text: "Walk along this historic boardwalk and enjoy the ocean views.", hint: "Look for the famous amusement park and hot dog stands.", gpsVerificationRadius: 50, requiresSelfie: true },
      { identifyingName: "DUMBO", anonymizedName: "Historic District", latitude: 40.7033, longitude: -73.9881, text: "Explore this trendy neighborhood under the Manhattan Bridge.", hint: "This area is famous for its cobblestone streets and art galleries.", gpsVerificationRadius: 30, requiresSelfie: true },
      { identifyingName: "Brooklyn Heights Promenade", anonymizedName: "Scenic Walkway", latitude: 40.6962, longitude: -73.9969, text: "Enjoy stunning views of Manhattan from this elevated walkway.", hint: "This promenade offers one of the best views of the NYC skyline.", gpsVerificationRadius: 25, requiresSelfie: true },

      // Queens
      { identifyingName: "Flushing Meadows Park", anonymizedName: "World's Fair Park", latitude: 40.7505, longitude: -73.8444, text: "Visit the site of two World's Fairs and see the iconic Unisphere.", hint: "This park hosted the 1964-65 World's Fair.", gpsVerificationRadius: 40, requiresSelfie: true },
      { identifyingName: "Museum of the Moving Image", anonymizedName: "Film Museum", latitude: 40.7566, longitude: -73.8444, text: "Explore the history of film, television, and digital media.", hint: "This museum is dedicated to the art and technology of moving images.", gpsVerificationRadius: 20, requiresSelfie: true },
      { identifyingName: "Queens Botanical Garden", anonymizedName: "Botanical Garden", latitude: 40.7515, longitude: -73.8256, text: "Discover beautiful gardens and sustainable landscapes.", hint: "This garden focuses on environmental stewardship and education.", gpsVerificationRadius: 30, requiresSelfie: true },
      { identifyingName: "Astoria Park", anonymizedName: "Riverside Park", latitude: 40.7806, longitude: -73.9217, text: "Enjoy waterfront views and the largest public pool in NYC.", hint: "This park offers stunning views of the East River and Manhattan.", gpsVerificationRadius: 35, requiresSelfie: true },
      { identifyingName: "Socrates Sculpture Park", anonymizedName: "Outdoor Art Park", latitude: 40.7706, longitude: -73.9361, text: "Experience contemporary art in this outdoor sculpture park.", hint: "This park transforms a former landfill into a vibrant art space.", gpsVerificationRadius: 25, requiresSelfie: true },

      // Bronx
      { identifyingName: "Bronx Zoo", anonymizedName: "Wildlife Park", latitude: 40.8506, longitude: -73.8769, text: "Visit one of the largest metropolitan zoos in the world.", hint: "This zoo is home to over 4,000 animals representing 650 species.", gpsVerificationRadius: 50, requiresSelfie: true },
      { identifyingName: "New York Botanical Garden", anonymizedName: "Plant Garden", latitude: 40.8621, longitude: -73.8801, text: "Explore 250 acres of beautiful gardens and plant collections.", hint: "This garden features a historic glasshouse and native forest.", gpsVerificationRadius: 40, requiresSelfie: true },
      { identifyingName: "Yankee Stadium", anonymizedName: "Baseball Stadium", latitude: 40.8296, longitude: -73.9262, text: "Visit the home of the most successful team in baseball history.", hint: "This stadium is known as 'The House That Ruth Built'.", gpsVerificationRadius: 30, requiresSelfie: true },
      { identifyingName: "Arthur Avenue", anonymizedName: "Little Italy", latitude: 40.8569, longitude: -73.8844, text: "Experience authentic Italian culture and cuisine.", hint: "This area is known for its traditional Italian markets and restaurants.", gpsVerificationRadius: 25, requiresSelfie: true },
      { identifyingName: "Van Cortlandt Park", anonymizedName: "Large Park", latitude: 40.8976, longitude: -73.8979, text: "Explore the third largest park in New York City.", hint: "This park features a historic house and extensive hiking trails.", gpsVerificationRadius: 45, requiresSelfie: true },

      // Staten Island
      { identifyingName: "Staten Island Ferry", anonymizedName: "Ferry Terminal", latitude: 40.6415, longitude: -74.0776, text: "Take in the free ferry ride with spectacular views of the Statue of Liberty.", hint: "This ferry offers the best free view of the NYC skyline.", gpsVerificationRadius: 20, requiresSelfie: true },
      { identifyingName: "Snug Harbor Cultural Center", anonymizedName: "Cultural Center", latitude: 40.6453, longitude: -74.1031, text: "Discover this historic cultural center with beautiful gardens.", hint: "This center was once a home for retired sailors.", gpsVerificationRadius: 35, requiresSelfie: true },
      { identifyingName: "Fort Wadsworth", anonymizedName: "Historic Fort", latitude: 40.6064, longitude: -74.0561, text: "Explore this historic military fort with views of the Verrazano Bridge.", hint: "This fort has protected New York Harbor for over 200 years.", gpsVerificationRadius: 30, requiresSelfie: true },
      { identifyingName: "Conference House Park", anonymizedName: "Historic Park", latitude: 40.5032, longitude: -74.2519, text: "Visit the site of the 1776 peace conference during the Revolutionary War.", hint: "This is where the last attempt at peace was made before independence.", gpsVerificationRadius: 25, requiresSelfie: true },
      { identifyingName: "Staten Island Museum", anonymizedName: "Local Museum", latitude: 40.6415, longitude: -74.0776, text: "Learn about Staten Island's natural and cultural history.", hint: "This museum features exhibits on local history and natural science.", gpsVerificationRadius: 20, requiresSelfie: true },

      // Additional Manhattan locations
      { identifyingName: "High Line Park", anonymizedName: "Elevated Park", latitude: 40.7480, longitude: -74.0048, text: "Walk along this unique elevated park built on an old railway.", hint: "This park offers great views of the city and Hudson River.", gpsVerificationRadius: 30, requiresSelfie: true },
      { identifyingName: "Chelsea Market", anonymizedName: "Food Market", latitude: 40.7424, longitude: -74.0061, text: "Explore this famous food market in a converted factory building.", hint: "This market is housed in the former Nabisco factory.", gpsVerificationRadius: 25, requiresSelfie: true },
      { identifyingName: "Washington Square Park", anonymizedName: "Historic Square", latitude: 40.7308, longitude: -73.9973, text: "Visit this famous park with its iconic arch and fountain.", hint: "This park is the heart of Greenwich Village.", gpsVerificationRadius: 30, requiresSelfie: true },
      { identifyingName: "Union Square", anonymizedName: "Public Square", latitude: 40.7357, longitude: -73.9910, text: "Experience this vibrant public square with its farmers market.", hint: "This square is known for its political demonstrations and events.", gpsVerificationRadius: 25, requiresSelfie: true },
      { identifyingName: "Madison Square Park", anonymizedName: "Urban Park", latitude: 40.7411, longitude: -73.9897, text: "Relax in this peaceful park with views of the Flatiron Building.", hint: "This park is famous for its Shake Shack location.", gpsVerificationRadius: 20, requiresSelfie: true }
    ];

    // 50 Provo, UT Clues (25 on BYU campus, 25 around Provo)
    const provoClues = [
      // BYU Campus (25 clues)
      { identifyingName: "BYU Library", anonymizedName: "University Library", latitude: 40.2518, longitude: -111.6493, text: "Find the main library with its distinctive architecture and extensive collections.", hint: "This library is one of the largest academic libraries in the western United States.", gpsVerificationRadius: 30, requiresSelfie: true },
      { identifyingName: "BYU Museum of Art", anonymizedName: "Art Museum", latitude: 40.2508, longitude: -111.6508, text: "Discover contemporary and historical art in this beautiful museum.", hint: "This museum features rotating exhibitions and permanent collections.", gpsVerificationRadius: 25, requiresSelfie: true },
      { identifyingName: "BYU Marriott Center", anonymizedName: "Sports Arena", latitude: 40.2528, longitude: -111.6518, text: "Visit the home of BYU basketball and other major events.", hint: "This arena can seat over 19,000 people.", gpsVerificationRadius: 35, requiresSelfie: true },
      { identifyingName: "BYU LaVell Edwards Stadium", anonymizedName: "Football Stadium", latitude: 40.2558, longitude: -111.6548, text: "Stand where BYU football history is made.", hint: "This stadium is named after the legendary football coach.", gpsVerificationRadius: 40, requiresSelfie: true },
      { identifyingName: "BYU Wilkinson Student Center", anonymizedName: "Student Center", latitude: 40.2518, longitude: -111.6508, text: "Explore the heart of student life on campus.", hint: "This building houses dining, services, and student activities.", gpsVerificationRadius: 30, requiresSelfie: true },
      { identifyingName: "BYU Spencer W. Kimball Tower", anonymizedName: "Administration Building", latitude: 40.2508, longitude: -111.6498, text: "Find the main administration building with its distinctive tower.", hint: "This building is named after a former university president.", gpsVerificationRadius: 25, requiresSelfie: true },
      { identifyingName: "BYU JSB Building", anonymizedName: "Business School", latitude: 40.2528, longitude: -111.6508, text: "Visit the home of the Marriott School of Business.", hint: "This building houses one of the top business programs in the country.", gpsVerificationRadius: 30, requiresSelfie: true },
      { identifyingName: "BYU Life Sciences Building", anonymizedName: "Science Building", latitude: 40.2538, longitude: -111.6518, text: "Explore the cutting-edge research facilities in life sciences.", hint: "This building houses biology, chemistry, and other science departments.", gpsVerificationRadius: 25, requiresSelfie: true },
      { identifyingName: "BYU Engineering Building", anonymizedName: "Engineering School", latitude: 40.2548, longitude: -111.6528, text: "Discover the innovative engineering programs and labs.", hint: "This building is home to various engineering disciplines.", gpsVerificationRadius: 30, requiresSelfie: true },
      { identifyingName: "BYU Law School", anonymizedName: "Law Building", latitude: 40.2508, longitude: -111.6488, text: "Visit the prestigious J. Reuben Clark Law School.", hint: "This building houses one of the top law schools in the region.", gpsVerificationRadius: 25, requiresSelfie: true },
      { identifyingName: "BYU Fine Arts Building", anonymizedName: "Arts Building", latitude: 40.2518, longitude: -111.6518, text: "Experience the creative arts programs and performances.", hint: "This building houses music, theater, and visual arts programs.", gpsVerificationRadius: 25, requiresSelfie: true },
      { identifyingName: "BYU Education Building", anonymizedName: "Education School", latitude: 40.2528, longitude: -111.6498, text: "Learn about teacher education and educational research.", hint: "This building is home to the McKay School of Education.", gpsVerificationRadius: 25, requiresSelfie: true },
      { identifyingName: "BYU Computer Science Building", anonymizedName: "CS Building", latitude: 40.2538, longitude: -111.6508, text: "Explore the technology and computer science programs.", hint: "This building houses cutting-edge computer science research.", gpsVerificationRadius: 25, requiresSelfie: true },
      { identifyingName: "BYU Physical Education Building", anonymizedName: "PE Building", latitude: 40.2548, longitude: -111.6518, text: "Find the home of physical education and exercise science.", hint: "This building includes gyms, pools, and fitness facilities.", gpsVerificationRadius: 30, requiresSelfie: true },
      { identifyingName: "BYU Heritage Halls", anonymizedName: "Student Housing", latitude: 40.2508, longitude: -111.6528, text: "Visit the traditional student housing complex.", hint: "These halls provide a unique living-learning environment.", gpsVerificationRadius: 35, requiresSelfie: true },
      { identifyingName: "BYU Helaman Halls", anonymizedName: "Freshman Housing", latitude: 40.2558, longitude: -111.6538, text: "Explore the freshman residence halls and dining facilities.", hint: "This complex is designed specifically for first-year students.", gpsVerificationRadius: 40, requiresSelfie: true },
      { identifyingName: "BYU Wyview Park", anonymizedName: "Student Apartments", latitude: 40.2568, longitude: -111.6548, text: "Visit the student apartment complex with family housing.", hint: "This complex provides housing for married students and families.", gpsVerificationRadius: 35, requiresSelfie: true },
      { identifyingName: "BYU Cannon Center", anonymizedName: "Dining Hall", latitude: 40.2518, longitude: -111.6528, text: "Experience the main dining facility on campus.", hint: "This dining hall serves thousands of students daily.", gpsVerificationRadius: 25, requiresSelfie: true },
      { identifyingName: "BYU Bookstore", anonymizedName: "Campus Store", latitude: 40.2508, longitude: -111.6508, text: "Find textbooks, BYU merchandise, and campus supplies.", hint: "This store is the main source for academic materials.", gpsVerificationRadius: 20, requiresSelfie: true },
      { identifyingName: "BYU Testing Center", anonymizedName: "Exam Facility", latitude: 40.2528, longitude: -111.6518, text: "Visit the centralized testing facility for campus exams.", hint: "This center administers thousands of exams each semester.", gpsVerificationRadius: 25, requiresSelfie: true },
      { identifyingName: "BYU Information Technology Building", anonymizedName: "IT Building", latitude: 40.2538, longitude: -111.6508, text: "Explore the technology services and support center.", hint: "This building provides IT support for the entire campus.", gpsVerificationRadius: 25, requiresSelfie: true },
      { identifyingName: "BYU Conference Center", anonymizedName: "Event Center", latitude: 40.2508, longitude: -111.6498, text: "Visit the venue for major conferences and events.", hint: "This center hosts university-wide meetings and presentations.", gpsVerificationRadius: 30, requiresSelfie: true },
      { identifyingName: "BYU Museum of Peoples and Cultures", anonymizedName: "Anthropology Museum", latitude: 40.2518, longitude: -111.6508, text: "Discover artifacts and exhibits from cultures around the world.", hint: "This museum showcases archaeological and ethnographic collections.", gpsVerificationRadius: 20, requiresSelfie: true },
      { identifyingName: "BYU Monte L. Bean Life Science Museum", anonymizedName: "Natural History Museum", latitude: 40.2528, longitude: -111.6518, text: "Explore exhibits on wildlife, ecosystems, and natural history.", hint: "This museum features dioramas and interactive exhibits.", gpsVerificationRadius: 25, requiresSelfie: true },
      { identifyingName: "BYU Planetarium", anonymizedName: "Space Theater", latitude: 40.2538, longitude: -111.6508, text: "Experience the wonders of the universe in this immersive theater.", hint: "This planetarium offers shows about astronomy and space.", gpsVerificationRadius: 20, requiresSelfie: true },

      // Provo City (25 clues)
      { identifyingName: "Provo City Center Temple", anonymizedName: "Historic Temple", latitude: 40.2338, longitude: -111.6585, text: "Visit this beautiful temple that was rebuilt from a historic tabernacle.", hint: "This temple combines historic architecture with modern functionality.", gpsVerificationRadius: 30, requiresSelfie: true },
      { identifyingName: "Provo City Library", anonymizedName: "Public Library", latitude: 40.2338, longitude: -111.6585, text: "Explore this modern library with its unique architecture.", hint: "This library features a distinctive glass facade and modern design.", gpsVerificationRadius: 25, requiresSelfie: true },
      { identifyingName: "Provo City Hall", anonymizedName: "Government Building", latitude: 40.2338, longitude: -111.6585, text: "Visit the seat of Provo city government.", hint: "This building houses the mayor's office and city council chambers.", gpsVerificationRadius: 20, requiresSelfie: true },
      { identifyingName: "Provo Pioneer Memorial Park", anonymizedName: "Historic Park", latitude: 40.2338, longitude: -111.6585, text: "Learn about Provo's pioneer heritage in this memorial park.", hint: "This park commemorates the early settlers of Provo Valley.", gpsVerificationRadius: 25, requiresSelfie: true },
      { identifyingName: "Provo River Trail", anonymizedName: "Scenic Trail", latitude: 40.2338, longitude: -111.6585, text: "Walk or bike along this beautiful riverside trail.", hint: "This trail follows the Provo River through the city.", gpsVerificationRadius: 30, requiresSelfie: true },
      { identifyingName: "Provo Canyon", anonymizedName: "Mountain Canyon", latitude: 40.3500, longitude: -111.6000, text: "Explore this scenic canyon with waterfalls and hiking trails.", hint: "This canyon is famous for Bridal Veil Falls and outdoor recreation.", gpsVerificationRadius: 50, requiresSelfie: true },
      { identifyingName: "Bridal Veil Falls", anonymizedName: "Waterfall", latitude: 40.3500, longitude: -111.6000, text: "Marvel at this stunning 600-foot waterfall in Provo Canyon.", hint: "This waterfall is one of Utah's most photographed natural features.", gpsVerificationRadius: 30, requiresSelfie: true },
      { identifyingName: "Sundance Resort", anonymizedName: "Mountain Resort", latitude: 40.4000, longitude: -111.6000, text: "Visit Robert Redford's famous mountain resort and film festival venue.", hint: "This resort hosts the annual Sundance Film Festival.", gpsVerificationRadius: 40, requiresSelfie: true },
      { identifyingName: "Provo Towne Centre", anonymizedName: "Shopping Mall", latitude: 40.2338, longitude: -111.6585, text: "Shop and dine at Provo's premier shopping destination.", hint: "This mall features major retailers and restaurants.", gpsVerificationRadius: 35, requiresSelfie: true },
      { identifyingName: "Provo Municipal Airport", anonymizedName: "Local Airport", latitude: 40.2338, longitude: -111.6585, text: "Visit the local airport serving Provo and surrounding areas.", hint: "This airport provides regional air service.", gpsVerificationRadius: 40, requiresSelfie: true },
      { identifyingName: "Provo Recreation Center", anonymizedName: "Sports Complex", latitude: 40.2338, longitude: -111.6585, text: "Enjoy swimming, fitness, and recreational activities.", hint: "This center features pools, gyms, and sports courts.", gpsVerificationRadius: 30, requiresSelfie: true },
      { identifyingName: "Provo High School", anonymizedName: "Public High School", latitude: 40.2338, longitude: -111.6585, text: "Visit the main public high school in Provo.", hint: "This school serves the Provo School District.", gpsVerificationRadius: 25, requiresSelfie: true },
      { identifyingName: "Provo Tabernacle", anonymizedName: "Historic Building", latitude: 40.2338, longitude: -111.6585, text: "See the historic tabernacle that was converted into a temple.", hint: "This building has a rich history in Provo's religious community.", gpsVerificationRadius: 25, requiresSelfie: true },
      { identifyingName: "Provo Farmers Market", anonymizedName: "Local Market", latitude: 40.2338, longitude: -111.6585, text: "Experience local produce and crafts at the farmers market.", hint: "This market showcases local vendors and artisans.", gpsVerificationRadius: 30, requiresSelfie: true },
      { identifyingName: "Provo Arts Center", anonymizedName: "Cultural Center", latitude: 40.2338, longitude: -111.6585, text: "Enjoy performances and cultural events in downtown Provo.", hint: "This center hosts concerts, plays, and community events.", gpsVerificationRadius: 25, requiresSelfie: true },
      { identifyingName: "Provo Historic District", anonymizedName: "Historic Area", latitude: 40.2338, longitude: -111.6585, text: "Explore the historic downtown area with its preserved buildings.", hint: "This district features Victorian-era architecture.", gpsVerificationRadius: 35, requiresSelfie: true },
      { identifyingName: "Provo River", anonymizedName: "Local River", latitude: 40.2338, longitude: -111.6585, text: "Enjoy fishing, kayaking, or walking along the Provo River.", hint: "This river is popular for outdoor recreation.", gpsVerificationRadius: 40, requiresSelfie: true },
      { identifyingName: "Provo Canyon Road", anonymizedName: "Scenic Drive", latitude: 40.3500, longitude: -111.6000, text: "Take a scenic drive through this beautiful mountain canyon.", hint: "This road offers stunning views of mountains and waterfalls.", gpsVerificationRadius: 50, requiresSelfie: true },
      { identifyingName: "Provo Peak", anonymizedName: "Mountain Peak", latitude: 40.4000, longitude: -111.6000, text: "Hike to the summit of this prominent mountain peak.", hint: "This peak offers panoramic views of Utah Valley.", gpsVerificationRadius: 60, requiresSelfie: true },
      { identifyingName: "Provo Municipal Golf Course", anonymizedName: "Golf Course", latitude: 40.2338, longitude: -111.6585, text: "Play a round of golf at this scenic municipal course.", hint: "This course offers beautiful mountain views.", gpsVerificationRadius: 45, requiresSelfie: true },
      { identifyingName: "Provo Community Hospital", anonymizedName: "Medical Center", latitude: 40.2338, longitude: -111.6585, text: "Visit the main medical facility serving Provo and surrounding areas.", hint: "This hospital provides comprehensive healthcare services.", gpsVerificationRadius: 35, requiresSelfie: true },
      { identifyingName: "Provo Fire Station", anonymizedName: "Fire Department", latitude: 40.2338, longitude: -111.6585, text: "See the main fire station serving the Provo community.", hint: "This station houses the city's fire and emergency services.", gpsVerificationRadius: 25, requiresSelfie: true },
      { identifyingName: "Provo Police Department", anonymizedName: "Police Station", latitude: 40.2338, longitude: -111.6585, text: "Visit the headquarters of Provo's police department.", hint: "This building houses the city's law enforcement services.", gpsVerificationRadius: 25, requiresSelfie: true },
      { identifyingName: "Provo Post Office", anonymizedName: "Postal Service", latitude: 40.2338, longitude: -111.6585, text: "Visit the main post office serving Provo residents.", hint: "This facility provides postal services for the community.", gpsVerificationRadius: 20, requiresSelfie: true },
      { identifyingName: "Provo Cemetery", anonymizedName: "Historic Cemetery", latitude: 40.2338, longitude: -111.6585, text: "Explore this historic cemetery with graves dating back to pioneer times.", hint: "This cemetery contains the graves of many early Provo settlers.", gpsVerificationRadius: 30, requiresSelfie: true }
    ];

    // Insert NYC clues
    console.log('🗽 Inserting 40 additional NYC clues...');
    for (const clue of nycClues) {
      await prisma.clueLocation.create({
        data: clue
      });
    }

    // Insert Provo clues
    console.log('🏔️ Inserting 50 Provo clues (25 BYU campus, 25 Provo city)...');
    for (const clue of provoClues) {
      await prisma.clueLocation.create({
        data: clue
      });
    }

    console.log('✅ Successfully seeded additional clues!');
    console.log(`📊 Total clues added: ${nycClues.length + provoClues.length}`);
    console.log(`🗽 NYC clues: ${nycClues.length}`);
    console.log(`🏔️ Provo clues: ${provoClues.length} (${provoClues.filter(c => c.identifyingName.includes('BYU')).length} on BYU campus)`);

  } catch (error) {
    console.error('❌ Error seeding additional clues:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedAdditionalClues();
