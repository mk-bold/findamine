'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Edit, Trash2, Eye, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import GameForm from '@/components/GameForm';
import GameList from '@/components/GameList';
import GameSearch from '@/components/GameSearch';

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
  }>;
}

export default function GamesPage() {
  const { user } = useAuth();
  const [games, setGames] = useState<Game[]>([]);
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | undefined>();

  useEffect(() => {
    if (user && (user.role === 'ADMIN' || user.role === 'GAME_MANAGER')) {
      fetchGames();
      getUserLocation();
    }
  }, [user]);

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

  const fetchGames = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/games', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setGames(data);
        setFilteredGames(data);
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

  const handleCreateGame = () => {
    setEditingGame(null);
    setShowForm(true);
  };

  const handleEditGame = async (game: Game) => {
    try {
      // Fetch fresh game data from the server to avoid stale cached data
      const response = await fetch(`/api/games/${game.id}`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const freshGameData = await response.json();
        setEditingGame(freshGameData);
        setShowForm(true);
      } else {
        toast.error('Failed to load game data');
        // Fallback to cached data if fetch fails
        setEditingGame(game);
        setShowForm(true);
      }
    } catch (error) {
      console.error('Error fetching fresh game data:', error);
      toast.error('Failed to load game data');
      // Fallback to cached data if fetch fails
      setEditingGame(game);
      setShowForm(true);
    }
  };

  const handleDeleteGame = async (gameId: string) => {
    if (!confirm('Are you sure you want to delete this game? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/games/${gameId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        toast.success('Game deleted successfully');
        fetchGames();
      } else {
        toast.error('Failed to delete game');
      }
    } catch (error) {
      console.error('Error deleting game:', error);
      toast.error('Failed to delete game');
    }
  };

  const handleFormSubmit = async (gameData: Partial<Game> & { photos?: File[] }) => {
    try {
      setIsFormLoading(true);
      // Filter out photos and existingPhotos (existingPhotos is only for frontend display)
      const { photos, existingPhotos, ...gameDataWithoutPhotos } = gameData;
      const url = editingGame ? `/api/games/${editingGame.id}` : '/api/games';
      const method = editingGame ? 'PUT' : 'POST';

      // Debug: Log what's being sent to the backend
      console.log('Sending game data to backend:', gameDataWithoutPhotos);
      
      // First, create/update the game
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(gameDataWithoutPhotos),
      });

      if (response.ok) {
        const savedGame = await response.json();
        const message = editingGame ? 'Game updated successfully' : 'Game created successfully';
        toast.success(message);

        // If there are photos to upload, upload them
        if (photos && photos.length > 0) {
          try {
            const photoFormData = new FormData();
            photoFormData.append('gameId', savedGame.id);
            
            photos.forEach((photo, index) => {
              photoFormData.append('photo', photo);
              photoFormData.append('description', (gameData as any).photoDescriptions?.[index] || '');
            });

            const photoResponse = await fetch('/api/games/upload-photos', {
              method: 'POST',
              credentials: 'include',
              body: photoFormData,
            });

            if (photoResponse.ok) {
              toast.success('Photos uploaded successfully');
            } else {
              toast.error('Game saved but failed to upload photos');
            }
          } catch (photoError) {
            console.error('Error uploading photos:', photoError);
            toast.error('Game saved but failed to upload photos');
          }
        }

        setShowForm(false);
        setEditingGame(null);
        fetchGames();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to save game');
      }
    } catch (error) {
      console.error('Error saving game:', error);
      toast.error('Failed to save game');
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingGame(null);
  };

  if (!user || (user.role !== 'ADMIN' && user.role !== 'GAME_MANAGER')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Game Management</h1>
          <p className="text-gray-600 mt-2">
            Create and manage treasure hunt games for players to enjoy.
          </p>
        </div>
        <button
          onClick={handleCreateGame}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Game
        </button>
      </div>

      {/* Game Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      {editingGame ? 'Edit Game' : 'Create New Game'}
                    </h3>
                    <GameForm
                      game={editingGame}
                      onSubmit={handleFormSubmit}
                      onCancel={handleFormCancel}
                      isLoading={isFormLoading}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <GameSearch
        games={games}
        onFilteredGamesChange={setFilteredGames}
        userLocation={userLocation}
      />

      {/* Game List */}
      <div className="bg-white shadow rounded-lg">
        <GameList
          games={filteredGames}
          isLoading={isLoading}
          onEdit={handleEditGame}
          onDelete={handleDeleteGame}
          userLocation={userLocation}
        />
      </div>
    </div>
  );
}
