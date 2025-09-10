'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { MapPin, Calendar, Trophy, Target, Eye, Filter, ChevronDown, ChevronUp, Search, Gamepad2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface ClueFinding {
  id: string;
  foundAt: string;
  pointsEarned: number;
  bonusPointsEarned: number;
  isFirstToFind: boolean;
  photo?: {
    id: string;
    filename: string;
    originalName: string;
  };
  clueLocation: {
    id: string;
    identifyingName: string;
    anonymizedName: string;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    basePoints: number;
    city: string;
    state: string;
    country: string;
    latitude: number;
    longitude: number;
  };
  playerGame: {
    id: string;
    game: {
      id: string;
      name: string;
      status: string;
    };
  };
}

interface FilterOptions {
  searchKeyword: string;
  gameId: string;
  difficulty: string;
  isFirstToFind: string;
  dateFrom: string;
  dateTo: string;
  sortBy: 'foundAt' | 'pointsEarned' | 'difficulty' | 'gameName';
  sortOrder: 'asc' | 'desc';
}

const defaultFilters: FilterOptions = {
  searchKeyword: '',
  gameId: '',
  difficulty: '',
  isFirstToFind: '',
  dateFrom: '',
  dateTo: '',
  sortBy: 'foundAt',
  sortOrder: 'desc',
};

export default function ClueFindingsPage() {
  const { user } = useAuth();
  const [findings, setFindings] = useState<ClueFinding[]>([]);
  const [filteredFindings, setFilteredFindings] = useState<ClueFinding[]>([]);
  const [games, setGames] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<FilterOptions>(defaultFilters);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchFindings();
    fetchGames();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [findings, filters]);

  const fetchFindings = async () => {
    try {
      // For now, using mock data since the API endpoint needs to be implemented
      const mockFindings: ClueFinding[] = [
        {
          id: '1',
          foundAt: '2024-01-15T10:30:00Z',
          pointsEarned: 100,
          bonusPointsEarned: 25,
          isFirstToFind: true,
          clueLocation: {
            id: 'cl1',
            identifyingName: 'Historic Bell Tower',
            anonymizedName: 'Historic Landmark #1',
            difficulty: 'MEDIUM',
            basePoints: 75,
            city: 'Provo',
            state: 'Utah',
            country: 'USA',
            latitude: 40.2338,
            longitude: -111.6585,
          },
          playerGame: {
            id: 'pg1',
            game: {
              id: 'g1',
              name: 'BYU Campus Adventure',
              status: 'ACTIVE',
            },
          },
        },
        {
          id: '2',
          foundAt: '2024-01-14T14:15:00Z',
          pointsEarned: 85,
          bonusPointsEarned: 0,
          isFirstToFind: false,
          clueLocation: {
            id: 'cl2',
            identifyingName: 'Hidden Garden Statue',
            anonymizedName: 'Secret Garden Point',
            difficulty: 'EASY',
            basePoints: 50,
            city: 'Provo',
            state: 'Utah',
            country: 'USA',
            latitude: 40.2501,
            longitude: -111.6493,
          },
          playerGame: {
            id: 'pg2',
            game: {
              id: 'g1',
              name: 'BYU Campus Adventure',
              status: 'ACTIVE',
            },
          },
        },
        {
          id: '3',
          foundAt: '2024-01-12T16:45:00Z',
          pointsEarned: 120,
          bonusPointsEarned: 45,
          isFirstToFind: true,
          clueLocation: {
            id: 'cl3',
            identifyingName: 'Secret Mural Downtown',
            anonymizedName: 'Urban Art Discovery',
            difficulty: 'HARD',
            basePoints: 100,
            city: 'Salt Lake City',
            state: 'Utah',
            country: 'USA',
            latitude: 40.7608,
            longitude: -111.8910,
          },
          playerGame: {
            id: 'pg3',
            game: {
              id: 'g2',
              name: 'Utah Valley Explorer',
              status: 'COMPLETED',
            },
          },
        },
      ];

      setFindings(mockFindings);
    } catch (error) {
      console.error('Error fetching findings:', error);
      toast.error('Failed to load clue findings');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGames = async () => {
    try {
      // Mock games data for filter dropdown
      setGames([
        { id: 'g1', name: 'BYU Campus Adventure' },
        { id: 'g2', name: 'Utah Valley Explorer' },
      ]);
    } catch (error) {
      console.error('Error fetching games:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...findings];

    // Search keyword filter
    if (filters.searchKeyword.trim()) {
      const keyword = filters.searchKeyword.toLowerCase();
      filtered = filtered.filter(finding =>
        finding.clueLocation.identifyingName.toLowerCase().includes(keyword) ||
        finding.clueLocation.anonymizedName.toLowerCase().includes(keyword) ||
        finding.playerGame.game.name.toLowerCase().includes(keyword) ||
        finding.clueLocation.city.toLowerCase().includes(keyword) ||
        finding.clueLocation.state.toLowerCase().includes(keyword)
      );
    }

    // Game filter
    if (filters.gameId) {
      filtered = filtered.filter(finding => finding.playerGame.game.id === filters.gameId);
    }

    // Difficulty filter
    if (filters.difficulty) {
      filtered = filtered.filter(finding => finding.clueLocation.difficulty === filters.difficulty);
    }

    // First to find filter
    if (filters.isFirstToFind === 'true') {
      filtered = filtered.filter(finding => finding.isFirstToFind);
    } else if (filters.isFirstToFind === 'false') {
      filtered = filtered.filter(finding => !finding.isFirstToFind);
    }

    // Date range filters
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      filtered = filtered.filter(finding => new Date(finding.foundAt) >= fromDate);
    }
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999); // End of day
      filtered = filtered.filter(finding => new Date(finding.foundAt) <= toDate);
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case 'foundAt':
          comparison = new Date(a.foundAt).getTime() - new Date(b.foundAt).getTime();
          break;
        case 'pointsEarned':
          comparison = a.pointsEarned - b.pointsEarned;
          break;
        case 'difficulty':
          const difficultyOrder = { EASY: 1, MEDIUM: 2, HARD: 3 };
          comparison = difficultyOrder[a.clueLocation.difficulty] - difficultyOrder[b.clueLocation.difficulty];
          break;
        case 'gameName':
          comparison = a.playerGame.game.name.localeCompare(b.playerGame.game.name);
          break;
        default:
          comparison = 0;
      }

      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredFindings(filtered);
  };

  const updateFilters = (updates: Partial<FilterOptions>) => {
    setFilters(prev => ({ ...prev, ...updates }));
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY':
        return 'bg-green-100 text-green-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'HARD':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalPoints = findings.reduce((sum, finding) => sum + finding.pointsEarned + finding.bonusPointsEarned, 0);
  const firstToFindCount = findings.filter(finding => finding.isFirstToFind).length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Clue Findings</h1>
            <p className="mt-1 text-sm text-gray-500">View all the clues you've discovered across your games.</p>
          </div>
        </div>
        
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
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
          <h1 className="text-2xl font-bold text-gray-900">My Clue Findings</h1>
          <p className="mt-1 text-sm text-gray-500">
            View all the clues you've discovered across your games.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-md bg-primary-500">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Clues Found</p>
                <p className="text-2xl font-semibold text-gray-900">{findings.length}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-md bg-success-500">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Points Earned</p>
                <p className="text-2xl font-semibold text-gray-900">{totalPoints.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-md bg-warning-500">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">First to Find</p>
                <p className="text-2xl font-semibold text-gray-900">{firstToFindCount}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-body">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Search & Filter</h3>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-3 py-1 text-sm text-primary-600 hover:text-primary-800"
            >
              <Filter className="h-4 w-4 mr-1" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
              {showFilters ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
            </button>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search clues, locations, or games..."
                  value={filters.searchKeyword}
                  onChange={(e) => updateFilters({ searchKeyword: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <select
              value={filters.sortBy}
              onChange={(e) => updateFilters({ sortBy: e.target.value as FilterOptions['sortBy'] })}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="foundAt">Sort by Date Found</option>
              <option value="pointsEarned">Sort by Points</option>
              <option value="difficulty">Sort by Difficulty</option>
              <option value="gameName">Sort by Game</option>
            </select>

            <select
              value={filters.sortOrder}
              onChange={(e) => updateFilters({ sortOrder: e.target.value as 'asc' | 'desc' })}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Game</label>
                <select
                  value={filters.gameId}
                  onChange={(e) => updateFilters({ gameId: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="">All Games</option>
                  {games.map(game => (
                    <option key={game.id} value={game.id}>{game.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                <select
                  value={filters.difficulty}
                  onChange={(e) => updateFilters({ difficulty: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="">All Difficulties</option>
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First to Find</label>
                <select
                  value={filters.isFirstToFind}
                  onChange={(e) => updateFilters({ isFirstToFind: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="">All Findings</option>
                  <option value="true">First to Find Only</option>
                  <option value="false">Not First to Find</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                <div className="flex gap-1">
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => updateFilters({ dateFrom: e.target.value })}
                    className="flex-1 border border-gray-300 rounded-md px-2 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => updateFilters({ dateTo: e.target.value })}
                    className="flex-1 border border-gray-300 rounded-md px-2 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>
          )}

          {Object.values(filters).some(value => value !== '' && value !== 'foundAt' && value !== 'desc') && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={resetFilters}
                className="text-sm text-red-600 hover:text-red-800 font-medium"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Findings List */}
      {filteredFindings.length === 0 ? (
        <div className="text-center py-12">
          <Target className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {findings.length === 0 ? 'No clues found yet' : 'No clues match your filters'}
          </h3>
          <p className="text-gray-600 mb-6">
            {findings.length === 0 
              ? "Start playing games to discover and collect clues!"
              : "Try adjusting your search criteria to find more clues."
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredFindings.map((finding) => (
            <div key={finding.id} className="card hover:shadow-md transition-shadow">
              <div className="card-body">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {finding.clueLocation.identifyingName}
                      </h3>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(finding.clueLocation.difficulty)}`}>
                        {finding.clueLocation.difficulty}
                      </span>
                      {finding.isFirstToFind && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <Trophy className="h-3 w-3 mr-1" />
                          First to Find!
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <Gamepad2 className="h-4 w-4 mr-2" />
                        {finding.playerGame.game.name}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        {finding.clueLocation.city}, {finding.clueLocation.state}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        {formatDate(finding.foundAt)}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center text-sm font-medium text-success-600">
                        <Trophy className="h-4 w-4 mr-1" />
                        {finding.pointsEarned} points
                      </div>
                      {finding.bonusPointsEarned > 0 && (
                        <div className="flex items-center text-sm font-medium text-warning-600">
                          <Trophy className="h-4 w-4 mr-1" />
                          +{finding.bonusPointsEarned} bonus
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="ml-4 flex-shrink-0">
                    <button
                      onClick={() => {
                        // TODO: Implement clue details modal or page
                        toast.info('Clue details coming soon!');
                      }}
                      className="inline-flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 hover:border-gray-400 rounded-md transition-colors"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}