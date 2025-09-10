'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { playerAPI } from '@/lib/api';
import { Users, Gamepad2, MapPin, Trophy, Search, MessageCircle, UserPlus, Activity, Heart, Crown, Target } from 'lucide-react';
import toast from 'react-hot-toast';

interface PlayerDashboardStats {
  activeGames: number;
  totalFrenemies: number;
  totalMinions: number;
  totalCluesFound: number;
  availableCluesRemaining: number;
  recentFindings: any[];
  recentMessages: any[];
  favoritedFrenemies: any[];
  topMinions: any[];
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<PlayerDashboardStats>({
    activeGames: 0,
    totalFrenemies: 0,
    totalMinions: 0,
    totalCluesFound: 0,
    availableCluesRemaining: 0,
    recentFindings: [],
    recentMessages: [],
    favoritedFrenemies: [],
    topMinions: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      // Only fetch data if user is authenticated and has a role
      if (!user || !user.role) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        console.log('🔍 Player Dashboard: Fetching player stats...');
        
        // For now, use mock data until the API endpoints are implemented
        const playerStats = {
          activeGames: 2,
          totalFrenemies: 8,
          totalMinions: 3,
          totalCluesFound: 12,
          availableCluesRemaining: 45,
          recentFindings: [
            { id: 1, clueName: 'Historic Bell Tower', timestamp: '2 hours ago', points: 100 },
            { id: 2, clueName: 'Hidden Garden Statue', timestamp: '1 day ago', points: 85 },
            { id: 3, clueName: 'Secret Mural', timestamp: '3 days ago', points: 120 }
          ],
          recentMessages: [
            { id: 1, content: 'Found the hidden treasure near campus!', likes: 5, timestamp: '4 hours ago' },
            { id: 2, content: 'Anyone else struggling with the riverside clue?', likes: 2, timestamp: '1 day ago' },
            { id: 3, content: 'Great game everyone! Having so much fun.', likes: 8, timestamp: '2 days ago' }
          ],
          favoritedFrenemies: [
            { id: 1, name: 'Sarah Mitchell', avatar: null, points: 1250 },
            { id: 2, name: 'Alex Chen', avatar: null, points: 980 },
            { id: 3, name: 'Jordan Davis', avatar: null, points: 1100 }
          ],
          topMinions: [
            { id: 1, name: 'Emma Wilson', points: 850, rank: 1 },
            { id: 2, name: 'Michael Torres', points: 720, rank: 2 },
            { id: 3, name: 'Lisa Park', points: 650, rank: 3 }
          ]
        };
        
        console.log('📊 Player Dashboard: Player stats received:', playerStats);
        setStats(playerStats);
      } catch (error: any) {
        console.error('Failed to fetch player dashboard data:', error);
        
        // More specific error messages based on the error
        if (error.response?.status === 401) {
          toast.error('Authentication required. Please log in again.');
        } else if (error.response?.status === 403) {
          toast.error('Access denied. You may not have permission to view this data.');
        } else {
          toast.error('Failed to load dashboard data. Please try again later.');
        }
        
        // Set default stats on error
        setStats({
          activeGames: 0,
          totalFrenemies: 0,
          totalMinions: 0,
          totalCluesFound: 0,
          availableCluesRemaining: 0,
          recentFindings: [],
          recentMessages: [],
          favoritedFrenemies: [],
          topMinions: [],
        });
      } finally {
        setIsLoading(false);
      }
    };

    // Add a longer delay to ensure user is fully authenticated and cookie is set
    const timer = setTimeout(() => {
      fetchDashboardData();
    }, 1000);

    return () => clearTimeout(timer);
  }, [user]);

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="card">
      <div className="card-body">
        <div className="flex items-center">
          <div className={`flex-shrink-0 p-3 rounded-md ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-semibold text-gray-900">
              {isLoading ? '...' : value}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const QuickActionCard = ({ title, description, icon: Icon, href, color }: any) => (
    <Link href={href} className="card hover:shadow-lg transition-shadow cursor-pointer block">
      <div className="card-body">
        <div className="flex items-center">
          <div className={`flex-shrink-0 p-3 rounded-md ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.firstName || user?.email}!
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Ready for your next treasure hunting adventure?
          </p>
        </div>
        <div>
          <Link href="/dashboard/manager" className="inline-flex items-center px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors">
            Manager Dashboard →
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Active Games"
          value={stats.activeGames}
          icon={Gamepad2}
          color="bg-primary-500"
        />
        <StatCard
          title="Total Frenemies"
          value={stats.totalFrenemies}
          icon={Users}
          color="bg-success-500"
        />
        <StatCard
          title="Total Minions"
          value={stats.totalMinions}
          icon={Crown}
          color="bg-warning-500"
        />
        <StatCard
          title="Clues Found"
          value={stats.totalCluesFound}
          icon={Target}
          color="bg-purple-500"
        />
        <StatCard
          title="Available Clues"
          value={stats.availableCluesRemaining}
          icon={MapPin}
          color="bg-danger-500"
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <QuickActionCard
            title="Discover Games"
            description="Search for new games to join"
            icon={Search}
            href="/dashboard/games/discover"
            color="bg-primary-500"
          />
          <QuickActionCard
            title="Create Game"
            description="Start your own treasure hunt"
            icon={Gamepad2}
            href="/dashboard/games"
            color="bg-success-500"
          />
          <QuickActionCard
            title="My Clue Findings"
            description="View your discovered clues"
            icon={Target}
            href="/dashboard/clue-findings"
            color="bg-warning-500"
          />
          <QuickActionCard
            title="View Leaderboards"
            description="Check your ranking and achievements"
            icon={Trophy}
            href="/dashboard/leaderboards"
            color="bg-danger-500"
          />
          <QuickActionCard
            title="Find Frenemies"
            description="Connect with other players"
            icon={Users}
            href="/dashboard/players"
            color="bg-purple-500"
          />
          <QuickActionCard
            title="Invite Minions"
            description="Refer friends to join the game"
            icon={UserPlus}
            href="/dashboard/players?tab=invite"
            color="bg-indigo-500"
          />
          <QuickActionCard
            title="Messages & Chat"
            description="Read and post game messages"
            icon={MessageCircle}
            href="/dashboard/messages"
            color="bg-pink-500"
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Recent Findings */}
          <div className="card">
            <div className="card-body">
              <h3 className="text-base font-medium text-gray-900 mb-4 flex items-center">
                <Target className="h-5 w-5 mr-2 text-warning-500" />
                Recent Clue Findings
              </h3>
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : stats.recentFindings && stats.recentFindings.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentFindings.map((finding: any) => (
                    <div key={finding.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{finding.clueName}</p>
                        <p className="text-xs text-gray-500">{finding.timestamp}</p>
                      </div>
                      <span className="text-sm font-medium text-success-600">+{finding.points}pts</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No clue findings yet. Start exploring!</p>
              )}
            </div>
          </div>

          {/* Recent Messages */}
          <div className="card">
            <div className="card-body">
              <h3 className="text-base font-medium text-gray-900 mb-4 flex items-center">
                <MessageCircle className="h-5 w-5 mr-2 text-primary-500" />
                Recent Messages
              </h3>
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    </div>
                  ))}
                </div>
              ) : stats.recentMessages && stats.recentMessages.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentMessages.map((message: any) => (
                    <div key={message.id}>
                      <p className="text-sm text-gray-900">{message.content}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-gray-500">{message.timestamp}</p>
                        <div className="flex items-center">
                          <Heart className="h-3 w-3 text-red-500 mr-1" />
                          <span className="text-xs text-gray-500">{message.likes}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No messages yet. Join the conversation!</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Favorited Frenemies & Top Minions */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mt-6">
          {/* Favorited Frenemies */}
          <div className="card">
            <div className="card-body">
              <h3 className="text-base font-medium text-gray-900 mb-4 flex items-center">
                <Users className="h-5 w-5 mr-2 text-success-500" />
                Favorited Frenemies
              </h3>
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse flex items-center space-x-3">
                      <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : stats.favoritedFrenemies && stats.favoritedFrenemies.length > 0 ? (
                <div className="space-y-3">
                  {stats.favoritedFrenemies.map((frenemy: any) => (
                    <div key={frenemy.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 bg-success-100 rounded-full flex items-center justify-center">
                          <Users className="h-4 w-4 text-success-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{frenemy.name}</p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">{frenemy.points}pts</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No favorited frenemies yet. Connect with players!</p>
              )}
            </div>
          </div>

          {/* Top Minions */}
          <div className="card">
            <div className="card-body">
              <h3 className="text-base font-medium text-gray-900 mb-4 flex items-center">
                <Crown className="h-5 w-5 mr-2 text-warning-500" />
                Top Minions
              </h3>
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse flex items-center space-x-3">
                      <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : stats.topMinions && stats.topMinions.length > 0 ? (
                <div className="space-y-3">
                  {stats.topMinions.map((minion: any) => (
                    <div key={minion.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 bg-warning-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-warning-600">#{minion.rank}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{minion.name}</p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">{minion.points}pts</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No minions yet. Invite friends to play!</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Getting Started Tips */}
      {(!stats.activeGames || stats.activeGames === 0) && !isLoading && (
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Getting Started</h2>
          <div className="card">
            <div className="card-body">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <Search className="h-6 w-6 text-primary-500" />
                </div>
                <div>
                  <h3 className="text-base font-medium text-gray-900 mb-2">Welcome to Findamine!</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Start your treasure hunting adventure by discovering games in your area or create your own game for others to enjoy.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Link href="/dashboard/games/discover" className="inline-flex items-center px-3 py-1 text-xs font-medium text-primary-700 bg-primary-50 rounded-full hover:bg-primary-100">
                      Discover Games
                    </Link>
                    <Link href="/dashboard/games?action=create" className="inline-flex items-center px-3 py-1 text-xs font-medium text-success-700 bg-success-50 rounded-full hover:bg-success-100">
                      Create Game
                    </Link>
                    <Link href="/dashboard/players" className="inline-flex items-center px-3 py-1 text-xs font-medium text-purple-700 bg-purple-50 rounded-full hover:bg-purple-100">
                      Find Players
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 