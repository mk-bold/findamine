'use client';

import React from 'react';
import { Edit, Trash2, Eye, MapPin, Calendar, Users, DollarSign } from 'lucide-react';

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
}

interface GameListProps {
  games: Game[];
  isLoading: boolean;
  onEdit: (game: Game) => void;
  onDelete: (gameId: string) => void;
  userLocation?: { lat: number; lng: number };
}

// Utility function to calculate distance between two points using Haversine formula
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

export default function GameList({ games, isLoading, onEdit, onDelete, userLocation }: GameListProps) {

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'ongoing';
    const date = new Date(dateString);
    // Check if date is invalid or is Unix epoch (indicates null/undefined endDate)
    if (isNaN(date.getTime()) || date.getTime() === 0) return 'ongoing';
    return date.toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="text-gray-500">
          <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No games yet</h3>
          <p className="text-gray-600">
            Get started by creating your first treasure hunt game!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Games ({games.length})</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Game
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dates
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Remaining Spots
              </th>
              {userLocation && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Distance
                </th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Financial
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {games.map((game) => (
              <tr key={game.id} className="hover:bg-gray-50">
                {/* Game Info */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900">{game.name}</div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">
                      {game.description}
                    </div>
                    
                    {/* Location */}
                    <div className="mt-2">
                      <div className="flex items-center text-xs text-gray-400">
                        <MapPin className="h-3 w-3 mr-1" />
                        {game.gameCenterAddress || 'Location not set'}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Dates */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                    <div>
                      <div>Start: {formatDate(game.startDate)}</div>
                      <div>End: {formatDate(game.endDate)}</div>
                    </div>
                  </div>
                </td>

                {/* Remaining Spots */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1 text-gray-400" />
                    {game.remainingSpots !== null ? (
                      <span className={`${game.remainingSpots === 0 ? 'text-red-600 font-semibold' : game.remainingSpots <= 5 ? 'text-yellow-600 font-semibold' : 'text-green-600'}`}>
                        {game.remainingSpots === 0 ? 'Full' : `${game.remainingSpots} left`}
                      </span>
                    ) : (
                      <span className="text-gray-500">No limit</span>
                    )}
                  </div>
                </td>

                {/* Distance (only show if user location available) */}
                {userLocation && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                      {game.gameCenterLat && game.gameCenterLng ? (
                        <span>
                          {calculateDistance(
                            userLocation.lat,
                            userLocation.lng,
                            game.gameCenterLat,
                            game.gameCenterLng
                          ).toFixed(1)} mi
                        </span>
                      ) : (
                        <span className="text-gray-400">Unknown</span>
                      )}
                    </div>
                  </td>
                )}

                {/* Financial */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="space-y-1">
                    {game.prizePool > 0 && (
                      <div className="flex items-center">
                        <DollarSign className="h-3 w-3 mr-1 text-green-500" />
                        Prize: {formatCurrency(game.prizePool)}
                      </div>
                    )}
                    {game.entryFee > 0 && (
                      <div className="flex items-center">
                        <DollarSign className="h-3 w-3 mr-1 text-blue-500" />
                        Entry: {formatCurrency(game.entryFee)}
                      </div>
                    )}
                    {game.prizePool === 0 && game.entryFee === 0 && (
                      <span className="text-gray-400">Free</span>
                    )}
                  </div>
                </td>

                {/* Actions */}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onEdit(game)}
                      className="text-primary-600 hover:text-primary-900 p-1 rounded"
                      title="Edit Game"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(game.id)}
                      className="text-red-600 hover:text-red-900 p-1 rounded"
                      title="Delete Game"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
