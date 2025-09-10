'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import GameSearch from '@/components/GameSearch';
import { MapPin, Calendar, Users, DollarSign, Trophy, Plus, Eye, ChevronRight } from 'lucide-react';
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
  rules: string;
  isPublic: boolean;
  gameCode?: string;
  createdAt: string;
  updatedAt: string;
  remainingSpots?: number | null;
  currentPlayers?: number;
  gamePhotos?: Array<{
    id: string;
    filename: string;
    originalName: string;
    description?: string;
    isGameCenter: boolean;
    isFavorited: boolean;
    order: number;
  }>;
  _count?: {
    playerGames: number;
  };
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function GameDiscoveryPage() {
  const { user } = useAuth();
  const [games, setGames] = useState<Game[]>([]);
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | undefined>();

  useEffect(() => {
    // Try to get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.log('Geolocation not available:', error);
          // Continue without location
        }
      );
    }

    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      setIsLoading(true);
      // Fetch public games that players can discover and join
      const response = await fetch('/api/games?public=true&active=true', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setGames(data);
      } else {
        toast.error('Failed to load games');
      }
    } catch (error) {
      console.error('Error fetching games:', error);
      toast.error('Failed to load games');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'ongoing';
    const date = new Date(dateString);
    if (isNaN(date.getTime()) || date.getTime() === 0) return 'ongoing';
    return date.toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const joinGame = async (gameId: string, gameCode?: string) => {
    try {
      const response = await fetch(`/api/games/${gameId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ gameCode }),
      });

      if (response.ok) {
        toast.success('Successfully joined the game!');
        // Refresh the games list to update remaining spots
        fetchGames();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to join game');
      }
    } catch (error) {
      console.error('Error joining game:', error);
      toast.error('Failed to join game');
    }
  };

  const handleJoinGame = (game: Game) => {
    if (game.remainingSpots === 0) {
      toast.error('This game is full');
      return;
    }

    if (!game.isPublic && !game.gameCode) {
      const code = prompt('Please enter the game code to join this private game:');
      if (code) {
        joinGame(game.id, code);
      }
    } else {
      joinGame(game.id);
    }
  };

  const GameCard = ({ game }: { game: Game }) => (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="card-body">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{game.name}</h3>
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{game.description}</p>
            
            {/* Game Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
              <div className="flex items-center text-sm text-gray-500">
                <MapPin className="h-4 w-4 mr-2" />
                <span className="truncate">{game.gameCenterAddress || 'Location TBD'}</span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-2" />
                <span>Starts {formatDate(game.startDate)}</span>
              </div>
              
              {userLocation && game.gameCenterLat && game.gameCenterLng && (
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>
                    {calculateDistance(
                      userLocation.lat,
                      userLocation.lng,
                      game.gameCenterLat,
                      game.gameCenterLng
                    ).toFixed(1)} mi away
                  </span>
                </div>
              )}
              
              <div className="flex items-center text-sm text-gray-500">
                <Users className="h-4 w-4 mr-2" />
                <span>
                  {game.remainingSpots !== null 
                    ? `${game.remainingSpots} spots left`
                    : 'Unlimited spots'
                  }
                </span>
              </div>
            </div>

            {/* Financial Info */}
            {(game.prizePool > 0 || game.entryFee > 0) && (
              <div className="flex flex-wrap gap-4 mb-4">
                {game.prizePool > 0 && (
                  <div className="flex items-center text-sm">
                    <Trophy className="h-4 w-4 mr-1 text-yellow-500" />
                    <span className="font-medium text-gray-900">
                      Prize: {formatCurrency(game.prizePool)}
                    </span>
                  </div>
                )}
                {game.entryFee > 0 && (
                  <div className="flex items-center text-sm">
                    <DollarSign className="h-4 w-4 mr-1 text-green-500" />
                    <span className="font-medium text-gray-900">
                      Entry: {formatCurrency(game.entryFee)}
                    </span>
                  </div>
                )}
                {game.prizePool === 0 && game.entryFee === 0 && (
                  <div className="flex items-center text-sm">
                    <span className="font-medium text-green-600">Free to play</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t border-gray-200">
          <button
            onClick={() => handleJoinGame(game)}
            disabled={game.remainingSpots === 0}
            className={`flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              game.remainingSpots === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-primary-600 text-white hover:bg-primary-700'
            }`}
          >
            <Plus className="h-4 w-4 mr-2" />
            {game.remainingSpots === 0 ? 'Full' : 'Join Game'}
          </button>
          <button
            onClick={() => {
              // TODO: Implement game details modal or page
              toast.info('Game details coming soon!');
            }}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Eye className="h-4 w-4 mr-2" />
            Details
          </button>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Discover Games</h1>
            <p className="mt-1 text-sm text-gray-500">
              Find and join treasure hunting adventures near you.
            </p>
          </div>
        </div>
        
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
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
          <h1 className="text-2xl font-bold text-gray-900">Discover Games</h1>
          <p className="mt-1 text-sm text-gray-500">
            Find and join treasure hunting adventures {userLocation ? 'near you' : 'around the world'}.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              // TODO: Navigate to create game flow
              toast.info('Game creation coming soon!');
            }}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Your Own
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      {games.length > 0 && (
        <GameSearch 
          games={games}
          onFilteredGamesChange={setFilteredGames}
          userLocation={userLocation}
        />
      )}

      {/* Games Grid */}
      {filteredGames.length === 0 && !isLoading ? (
        <div className="text-center py-12">
          <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No games found</h3>
          <p className="text-gray-600 mb-6">
            {games.length === 0 
              ? "There are no public games available right now. Be the first to create one!"
              : "Try adjusting your search filters to find more games."
            }
          </p>
          <button
            onClick={() => {
              // TODO: Navigate to create game flow
              toast.info('Game creation coming soon!');
            }}
            className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Your First Game
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGames.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      )}

      {/* Getting Started Tips */}
      {games.length === 0 && !isLoading && (
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-4">Getting Started with Findamine</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <MapPin className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-blue-900">Join Games Near You</h4>
                <p className="text-sm text-blue-700">
                  Discover treasure hunts and geo-caching adventures in your area.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <Plus className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-blue-900">Create Your Own</h4>
                <p className="text-sm text-blue-700">
                  Design unique treasure hunting experiences for others to enjoy.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-blue-900">Connect with Players</h4>
                <p className="text-sm text-blue-700">
                  Make friends and rivals as you compete for treasures and prizes.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <Trophy className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-blue-900">Win Prizes</h4>
                <p className="text-sm text-blue-700">
                  Compete for real money prizes and bragging rights in your community.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}