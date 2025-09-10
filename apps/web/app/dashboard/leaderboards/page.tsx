'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Trophy, Medal, Crown, Target, Users, Calendar, TrendingUp, Search, Filter, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

interface LeaderboardEntry {
  id: string;
  rank: number;
  player: {
    id: string;
    firstName?: string;
    lastName?: string;
    email: string;
    avatar?: string;
  };
  totalPoints: number;
  cluesFound: number;
  gamesWon: number;
  gamesPlayed: number;
  averageScore: number;
  firstToFindCount: number;
  isCurrentUser?: boolean;
}

interface Game {
  id: string;
  name: string;
  status: string;
}

type LeaderboardType = 'global' | 'game-specific';
type RankingCriteria = 'totalPoints' | 'cluesFound' | 'gamesWon' | 'averageScore' | 'firstToFind';
type TimePeriod = 'all-time' | 'monthly' | 'weekly';

export default function LeaderboardsPage() {
  const { user } = useAuth();
  const [leaderboardType, setLeaderboardType] = useState<LeaderboardType>('global');
  const [rankingCriteria, setRankingCriteria] = useState<RankingCriteria>('totalPoints');
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('all-time');
  const [selectedGameId, setSelectedGameId] = useState<string>('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null);

  useEffect(() => {
    fetchLeaderboardData();
    fetchGames();
  }, [leaderboardType, rankingCriteria, timePeriod, selectedGameId]);

  const fetchLeaderboardData = async () => {
    try {
      setIsLoading(true);
      
      // Mock leaderboard data - in real app this would be API calls
      const mockData: LeaderboardEntry[] = [
        {
          id: '1',
          rank: 1,
          player: { id: 'p1', firstName: 'Sarah', lastName: 'Mitchell', email: 'sarah@example.com' },
          totalPoints: 2450,
          cluesFound: 48,
          gamesWon: 8,
          gamesPlayed: 12,
          averageScore: 204.2,
          firstToFindCount: 12,
          isCurrentUser: false,
        },
        {
          id: '2',
          rank: 2,
          player: { id: 'p2', firstName: 'Alex', lastName: 'Chen', email: 'alex@example.com' },
          totalPoints: 2180,
          cluesFound: 42,
          gamesWon: 6,
          gamesPlayed: 15,
          averageScore: 145.3,
          firstToFindCount: 8,
          isCurrentUser: false,
        },
        {
          id: '3',
          rank: 3,
          player: { id: 'p3', firstName: 'Jordan', lastName: 'Davis', email: 'jordan@example.com' },
          totalPoints: 1950,
          cluesFound: 38,
          gamesWon: 5,
          gamesPlayed: 10,
          averageScore: 195.0,
          firstToFindCount: 15,
          isCurrentUser: false,
        },
        {
          id: '4',
          rank: 4,
          player: { id: 'p4', firstName: 'Emma', lastName: 'Wilson', email: 'emma@example.com' },
          totalPoints: 1825,
          cluesFound: 35,
          gamesWon: 4,
          gamesPlayed: 8,
          averageScore: 228.1,
          firstToFindCount: 6,
          isCurrentUser: false,
        },
        {
          id: '5',
          rank: 5,
          player: { id: 'p5', firstName: 'Michael', lastName: 'Torres', email: 'michael@example.com' },
          totalPoints: 1650,
          cluesFound: 32,
          gamesWon: 3,
          gamesPlayed: 9,
          averageScore: 183.3,
          firstToFindCount: 4,
          isCurrentUser: user?.id === 'p5',
        },
        {
          id: '6',
          rank: 6,
          player: { id: 'p6', firstName: 'Lisa', lastName: 'Park', email: 'lisa@example.com' },
          totalPoints: 1480,
          cluesFound: 28,
          gamesWon: 2,
          gamesPlayed: 7,
          averageScore: 211.4,
          firstToFindCount: 3,
          isCurrentUser: false,
        },
      ];

      // Find current user's ranking
      const currentUserEntry = mockData.find(entry => entry.isCurrentUser);
      if (currentUserEntry) {
        setUserRank(currentUserEntry);
      } else if (user) {
        // User not in top rankings - simulate their actual rank
        setUserRank({
          id: 'current',
          rank: 27,
          player: {
            id: user.id || 'current-user',
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email || 'user@example.com',
          },
          totalPoints: 850,
          cluesFound: 15,
          gamesWon: 1,
          gamesPlayed: 4,
          averageScore: 212.5,
          firstToFindCount: 2,
          isCurrentUser: true,
        });
      }

      setLeaderboardData(mockData);
    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
      toast.error('Failed to load leaderboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGames = async () => {
    try {
      // Mock games data
      setGames([
        { id: 'g1', name: 'BYU Campus Adventure', status: 'ACTIVE' },
        { id: 'g2', name: 'Utah Valley Explorer', status: 'ACTIVE' },
        { id: 'g3', name: 'Downtown Salt Lake Hunt', status: 'COMPLETED' },
      ]);
    } catch (error) {
      console.error('Error fetching games:', error);
    }
  };

  const filteredLeaderboard = leaderboardData.filter(entry => {
    if (!searchKeyword.trim()) return true;
    const keyword = searchKeyword.toLowerCase();
    const fullName = `${entry.player.firstName || ''} ${entry.player.lastName || ''}`.toLowerCase();
    return fullName.includes(keyword) || entry.player.email.toLowerCase().includes(keyword);
  });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Medal className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
    }
  };

  const getRankingValue = (entry: LeaderboardEntry) => {
    switch (rankingCriteria) {
      case 'totalPoints':
        return entry.totalPoints.toLocaleString();
      case 'cluesFound':
        return entry.cluesFound;
      case 'gamesWon':
        return entry.gamesWon;
      case 'averageScore':
        return entry.averageScore.toFixed(1);
      case 'firstToFind':
        return entry.firstToFindCount;
      default:
        return entry.totalPoints.toLocaleString();
    }
  };

  const getRankingLabel = () => {
    switch (rankingCriteria) {
      case 'totalPoints':
        return 'Total Points';
      case 'cluesFound':
        return 'Clues Found';
      case 'gamesWon':
        return 'Games Won';
      case 'averageScore':
        return 'Avg Score';
      case 'firstToFind':
        return 'First to Find';
      default:
        return 'Total Points';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Leaderboards</h1>
            <p className="mt-1 text-sm text-gray-500">See how you rank against other treasure hunters.</p>
          </div>
        </div>
        
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leaderboards</h1>
          <p className="mt-1 text-sm text-gray-500">
            See how you rank against other treasure hunters across all games.
          </p>
        </div>
      </div>

      {/* Current User Rank Card */}
      {userRank && (
        <div className="card">
          <div className="card-body">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Your Current Ranking</h3>
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-full">
                {getRankIcon(userRank.rank)}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-semibold text-gray-900">
                    {userRank.player.firstName && userRank.player.lastName 
                      ? `${userRank.player.firstName} ${userRank.player.lastName}`
                      : userRank.player.email
                    }
                  </span>
                  <span className="text-sm text-gray-500">(You)</span>
                </div>
                <div className="flex items-center space-x-6 mt-1 text-sm text-gray-600">
                  <span>Rank #{userRank.rank}</span>
                  <span>{getRankingValue(userRank)} {getRankingLabel()}</span>
                  <span>{userRank.cluesFound} clues found</span>
                  <span>{userRank.gamesWon}/{userRank.gamesPlayed} games won</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card">
        <div className="card-body">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search players..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Leaderboard Type */}
            <select
              value={leaderboardType}
              onChange={(e) => {
                setLeaderboardType(e.target.value as LeaderboardType);
                if (e.target.value === 'global') {
                  setSelectedGameId('');
                }
              }}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="global">Global Leaderboard</option>
              <option value="game-specific">Game-Specific</option>
            </select>

            {/* Game Selection */}
            {leaderboardType === 'game-specific' && (
              <select
                value={selectedGameId}
                onChange={(e) => setSelectedGameId(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select a Game</option>
                {games.map(game => (
                  <option key={game.id} value={game.id}>{game.name}</option>
                ))}
              </select>
            )}

            {/* Ranking Criteria */}
            <select
              value={rankingCriteria}
              onChange={(e) => setRankingCriteria(e.target.value as RankingCriteria)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="totalPoints">Total Points</option>
              <option value="cluesFound">Clues Found</option>
              <option value="gamesWon">Games Won</option>
              <option value="averageScore">Average Score</option>
              <option value="firstToFind">First to Find</option>
            </select>

            {/* Time Period */}
            <select
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value as TimePeriod)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all-time">All Time</option>
              <option value="monthly">This Month</option>
              <option value="weekly">This Week</option>
            </select>
          </div>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="card">
        <div className="card-body p-0">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              {leaderboardType === 'global' ? 'Global Rankings' : `${games.find(g => g.id === selectedGameId)?.name || 'Game'} Rankings`}
            </h3>
            <p className="text-sm text-gray-500">
              Ranked by {getRankingLabel().toLowerCase()} • {timePeriod.replace('-', ' ')}
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Player
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {getRankingLabel()}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clues Found
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Games Record
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    First to Find
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLeaderboard.map((entry) => (
                  <tr 
                    key={entry.id} 
                    className={`hover:bg-gray-50 ${entry.isCurrentUser ? 'bg-primary-50' : ''}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center w-12">
                        {getRankIcon(entry.rank)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-primary-700">
                            {entry.player.firstName ? entry.player.firstName[0] : entry.player.email[0].toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 flex items-center space-x-2">
                            <span>
                              {entry.player.firstName && entry.player.lastName 
                                ? `${entry.player.firstName} ${entry.player.lastName}`
                                : entry.player.email
                              }
                            </span>
                            {entry.isCurrentUser && (
                              <span className="text-xs text-primary-600 font-medium">(You)</span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">{entry.player.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {getRankingValue(entry)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-600">
                        <Target className="h-4 w-4 mr-1" />
                        {entry.cluesFound}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {entry.gamesWon}W - {entry.gamesPlayed - entry.gamesWon}L
                      </div>
                      <div className="text-xs text-gray-500">
                        ({entry.gamesPlayed} played)
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-600">
                        <Trophy className="h-4 w-4 mr-1 text-yellow-500" />
                        {entry.firstToFindCount}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="card-body text-center">
            <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <h4 className="text-lg font-semibold text-gray-900">Top Performer</h4>
            <p className="text-sm text-gray-600 mt-1">
              {leaderboardData[0]?.player.firstName} {leaderboardData[0]?.player.lastName}
            </p>
            <p className="text-xl font-bold text-primary-600 mt-2">
              {getRankingValue(leaderboardData[0])} {getRankingLabel()}
            </p>
          </div>
        </div>

        <div className="card">
          <div className="card-body text-center">
            <Users className="h-8 w-8 text-primary-500 mx-auto mb-2" />
            <h4 className="text-lg font-semibold text-gray-900">Total Players</h4>
            <p className="text-sm text-gray-600 mt-1">Active treasure hunters</p>
            <p className="text-xl font-bold text-primary-600 mt-2">
              {leaderboardData.length > 0 ? `${leaderboardData.length}+` : '0'}
            </p>
          </div>
        </div>

        <div className="card">
          <div className="card-body text-center">
            <TrendingUp className="h-8 w-8 text-success-500 mx-auto mb-2" />
            <h4 className="text-lg font-semibold text-gray-900">Your Progress</h4>
            <p className="text-sm text-gray-600 mt-1">Keep climbing!</p>
            <p className="text-xl font-bold text-success-600 mt-2">
              {userRank ? `#${userRank.rank}` : 'Unranked'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}