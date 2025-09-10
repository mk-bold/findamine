'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Search, Filter, MapPin, Calendar, Users, DollarSign, Trophy } from 'lucide-react';
import toast from 'react-hot-toast';

interface Game {
  id: string;
  name: string;
  description: string;
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED';
  startDate: string;
  endDate: string | null;
  maxPlayers: number;
  gameCenterLat: number;
  gameCenterLng: number;
  gameCenterAddress: string;
  prizePool: number;
  entryFee: number;
  isPublic: boolean;
  createdAt: string;
  remainingSpots?: number | null;
  currentPlayers?: number;
  isJoined?: boolean;
  distance?: number;
}

export default function GamesPage() {
  const { user } = useAuth();
  const [games, setGames] = useState<Game[]>([]);
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ACTIVE');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [sortBy, setSortBy] = useState<string>('distance');

  useEffect(() => {
    fetchAvailableGames();
    getUserLocation();
  }, []);

  useEffect(() => {
    filterAndSortGames();
  }, [games, searchTerm, statusFilter, sortBy, userLocation]);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.log('Geolocation error:', error);
        }
      );
    }
  };

  const fetchAvailableGames = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/player/games/available', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setGames(data);
      } else {
        toast.error('Failed to fetch games');
      }
    } catch (error) {
      console.error('Error fetching games:', error);
      toast.error('Failed to fetch games');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const filterAndSortGames = () => {
    let filtered = games.filter(game => {
      const matchesSearch = game.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           game.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           game.gameCenterAddress.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || game.status === statusFilter;
      const isPublic = game.isPublic;
      
      return matchesSearch && matchesStatus && isPublic;
    });

    // Add distance calculations
    if (userLocation) {
      filtered = filtered.map(game => ({
        ...game,
        distance: calculateDistance(
          userLocation.lat,
          userLocation.lng,
          game.gameCenterLat,
          game.gameCenterLng
        )
      }));
    }

    // Sort games
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          if (!a.distance || !b.distance) return 0;
          return a.distance - b.distance;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'startDate':
          return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
        case 'spots':
          const aSpots = a.remainingSpots ?? Infinity;
          const bSpots = b.remainingSpots ?? Infinity;
          return bSpots - aSpots; // More spots first
        default:
          return 0;
      }
    });

    setFilteredGames(filtered);
  };

  const handleJoinGame = async (gameId: string) => {
    try {
      const response = await fetch(`/api/player/games/${gameId}/join`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        toast.success('Successfully joined the game!');
        fetchAvailableGames(); // Refresh the games list
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to join game');
      }
    } catch (error) {
      console.error('Error joining game:', error);
      toast.error('Failed to join game');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Log In</h1>
          <p className="text-gray-600">You need to be logged in to discover and join games.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Discover Games</h1>
          <p className="text-gray-600 mt-2">
            Find and join treasure hunt games in your area.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search games..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="ACTIVE">Active Games</option>
                <option value="ALL">All Games</option>
                <option value="DRAFT">Coming Soon</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="distance">Nearest First</option>
                <option value="name">Name A-Z</option>
                <option value="startDate">Start Date</option>
                <option value="spots">Most Spots</option>
              </select>
            </div>

            {/* Results Count */}
            <div className="flex items-center text-gray-600">
              <Filter className="h-4 w-4 mr-2" />
              {filteredGames.length} games found
            </div>
          </div>
        </div>

        {/* Games Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : filteredGames.length === 0 ? (
          <div className="text-center py-12">
            <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No games found</h3>
            <p className="text-gray-600">
              Try adjusting your search criteria or check back later for new games.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGames.map((game) => (
              <div key={game.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="p-6">
                  {/* Game Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{game.name}</h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        game.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                        game.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {game.status}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{game.description}</p>

                  {/* Game Details */}
                  <div className="space-y-2 mb-4">
                    {/* Location */}
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="truncate">{game.gameCenterAddress}</span>
                      {game.distance && (
                        <span className="ml-2 text-primary-600 font-medium">
                          ({game.distance.toFixed(1)} mi)
                        </span>
                      )}
                    </div>

                    {/* Date */}
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      Starts {formatDate(game.startDate)}
                    </div>

                    {/* Players */}
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-2 text-gray-400" />
                      {game.remainingSpots !== null ? (
                        <span className={`${
                          game.remainingSpots === 0 ? 'text-red-600 font-semibold' : 
                          game.remainingSpots <= 5 ? 'text-yellow-600 font-semibold' : 
                          'text-green-600'
                        }`}>
                          {game.remainingSpots === 0 ? 'Full' : `${game.remainingSpots} spots left`}
                        </span>
                      ) : (
                        <span>Unlimited spots</span>
                      )}
                    </div>

                    {/* Prize/Fee */}
                    {(game.prizePool > 0 || game.entryFee > 0) && (
                      <div className="flex items-center text-sm">
                        <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                        <div className="flex space-x-3">
                          {game.prizePool > 0 && (
                            <span className="text-green-600">Prize: {formatCurrency(game.prizePool)}</span>
                          )}
                          {game.entryFee > 0 && (
                            <span className="text-blue-600">Fee: {formatCurrency(game.entryFee)}</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <div className="pt-4 border-t border-gray-200">
                    {game.isJoined ? (
                      <div className="flex items-center justify-center py-2 text-green-600 font-medium">
                        <Trophy className="h-4 w-4 mr-2" />
                        Already Joined
                      </div>
                    ) : game.remainingSpots === 0 ? (
                      <button 
                        disabled 
                        className="w-full bg-gray-100 text-gray-400 px-4 py-2 rounded-md cursor-not-allowed"
                      >
                        Game Full
                      </button>
                    ) : game.status === 'ACTIVE' ? (
                      <button
                        onClick={() => handleJoinGame(game.id)}
                        className="w-full bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md transition-colors"
                      >
                        Join Game
                      </button>
                    ) : (
                      <button 
                        disabled 
                        className="w-full bg-gray-100 text-gray-500 px-4 py-2 rounded-md cursor-not-allowed"
                      >
                        Not Yet Active
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}