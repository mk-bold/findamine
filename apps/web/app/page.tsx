'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { 
  MapPin, 
  Trophy, 
  Users, 
  Gamepad2, 
  Sparkles, 
  ArrowRight,
  Compass,
  Target,
  Award
} from 'lucide-react';

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Temporarily disable authentication check for testing
  // useEffect(() => {
  //   if (!isLoading && user) {
  //     router.push('/dashboard');
  //   }
  // }, [user, isLoading, router]);

  // // If user is logged in, show loading while redirecting
  // if (isLoading || user) {
  //   return (
  //     <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto"></div>
  //         <p className="mt-4 text-lg text-gray-600">Loading Findamine...</p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Banner */}
      <div className="relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src="/images/header-banner.png" 
            alt="Findamine Adventure Banner"
            className="w-full h-full object-cover"
          />
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                <Compass className="h-16 w-16 text-white" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Welcome to <span className="text-yellow-300">Findamine</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
              The ultimate location hunting adventure game that combines real-world exploration, 
              team and community building,om t and exciting rewards
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/register" 
                className="inline-flex items-center justify-center px-8 py-4 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-lg text-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
              >
                Start Your Adventure
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              
              <Link 
                href="/login" 
                className="inline-flex items-center justify-center px-8 py-4 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-lg text-lg transition-colors duration-200 backdrop-blur-sm border border-white/30"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Game Description */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What is Findamine?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Findamine is an innovative location-based game that transforms your city into an interactive 
              playground. Players solve clues, discover hidden locations, and compete for prizes while 
              building connections with fellow treasure hunters.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Real-World Adventure Meets Digital Gaming
              </h3>
              <p className="text-lg text-gray-600 mb-6">
                Step outside and explore your surroundings like never before. Each clue leads you to 
                real locations where you'll discover fascinating stories, hidden gems, and exciting 
                challenges that test your problem-solving skills.
              </p>
              <p className="text-lg text-gray-600">
                Whether you're a seasoned explorer or new to treasure hunting, Findamine offers 
                adventures for all skill levels. Use your smartphone to scan QR codes, take photos, 
                and unlock the secrets of your city.
              </p>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl p-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4 text-center">
                    <Target className="h-8 w-8 text-primary-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-700">Clue Solving</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center">
                    <MapPin className="h-8 w-8 text-primary-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-700">Location Discovery</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center">
                    <Users className="h-8 w-8 text-primary-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-700">Team Building</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center">
                    <Trophy className="h-8 w-8 text-primary-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-700">Prize Winning</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Features */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Play Findamine?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover the unique features that make Findamine the ultimate adventure gaming experience
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Gamepad2 className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Create Your Own Games</h3>
              <p className="text-gray-600">
                Design custom treasure hunts, set your own clues, and challenge friends with 
                personalized adventures
              </p>
            </div>

            <div className="text-center">
              <div className="bg-yellow-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Trophy className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Win Exciting Prizes</h3>
              <p className="text-gray-600">
                Compete for rewards, climb leaderboards, and earn recognition for your 
                treasure hunting skills
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Join Local Groups</h3>
              <p className="text-gray-600">
                Connect with fellow adventurers in your area, form teams, and share 
                the excitement of discovery
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Interactive Experience</h3>
              <p className="text-gray-600">
                Engage with other players, share discoveries, and build lasting 
                friendships through shared adventures
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get started with Findamine in just a few simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Create Account</h3>
              <p className="text-gray-600">
                Sign up with your email and choose a unique gamer tag to start your adventure
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Join Games</h3>
              <p className="text-gray-600">
                Browse available treasure hunts in your area and join the ones that interest you
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Start Hunting</h3>
              <p className="text-gray-600">
                Solve clues, visit locations, complete challenges, and compete for prizes
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Banner */}
      <div className="relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src="/images/footer-banner.png" 
            alt="Findamine Adventure Footer"
            className="w-full h-full object-cover"
          />
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
        
        <div className="relative py-20">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Start Your Adventure?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join thousands of treasure hunters already exploring their cities with Findamine
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/register" 
                className="inline-flex items-center justify-center px-8 py-4 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-lg text-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
              >
                <Award className="mr-2 h-5 w-5" />
                Get Started Free
              </Link>
              
              <Link 
                href="/login" 
                className="inline-flex items-center justify-center px-8 py-4 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-lg text-lg transition-colors duration-200 backdrop-blur-sm border border-white/30"
              >
                Sign In to Continue
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-6">
            <Compass className="h-8 w-8 text-primary-400" />
          </div>
          <p className="text-gray-400">
            © 2025 Findamine. The ultimate treasure hunting adventure game.
          </p>
        </div>
      </footer>
    </div>
  );
} 