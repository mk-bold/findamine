'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Users, 
  Search, 
  UserCheck, 
  User as UserIcon, 
  MoreHorizontal,
  UserPlus,
  UserMinus,
  Shield,
  Ban,
  CheckCircle,
  XCircle,
  Heart,
  UserX,
  Crown,
  Eye
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Player {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  gamerTag?: string;
}

interface PlayerConnection {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
  follower?: Player;
  following?: Player;
}

interface PlayerStats {
  totalGames: number;
  totalPoints: number;
  cluesFound: number;
  rank?: number;
}

export default function PlayersPage() {
  const { user } = useAuth();
  const [players, setPlayers] = useState<Player[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);
  const [minions, setMinions] = useState<PlayerConnection[]>([]);
  const [frenemies, setFrenemies] = useState<PlayerConnection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [activeTab, setActiveTab] = useState<'search' | 'minions' | 'frenemies'>('search');
  const [showPlayerActions, setShowPlayerActions] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchInitialData();
    }
  }, [user]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredPlayers([]);
      return;
    }

    const filtered = players.filter(player => 
      player.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (player.firstName && player.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (player.lastName && player.lastName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (player.gamerTag && player.gamerTag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredPlayers(filtered);
  }, [players, searchTerm]);

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      
      // For all users, load minions and frenemies
      await Promise.all([
        fetchMinions(),
        fetchFrenemies()
      ]);

      // For game managers and admins, also load all players
      if (user?.role === 'GAME_MANAGER' || user?.role === 'ADMIN') {
        await searchPlayers('');
      }
    } catch (error) {
      console.error('Failed to fetch initial data:', error);
      toast.error('Failed to load player data');
    } finally {
      setIsLoading(false);
    }
  };

  const searchPlayers = async (search: string) => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      params.append('limit', '50');
      params.append('offset', '0');

      const response = await fetch(`/api/player/search?${params}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to search players');
      }

      const data = await response.json();
      setPlayers(data.players || []);
    } catch (error) {
      console.error('Failed to search players:', error);
      toast.error('Failed to search players');
    }
  };

  const fetchMinions = async () => {
    try {
      const response = await fetch('/api/player/minions', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch minions');
      }

      const data = await response.json();
      setMinions(data);
    } catch (error) {
      console.error('Failed to fetch minions:', error);
      toast.error('Failed to load minions');
    }
  };

  const fetchFrenemies = async () => {
    try {
      const response = await fetch('/api/player/frenemies', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch frenemies');
      }

      const data = await response.json();
      setFrenemies(data);
    } catch (error) {
      console.error('Failed to fetch frenemies:', error);
      toast.error('Failed to load frenemies');
    }
  };

  const handleFollowPlayer = async (playerId: string) => {
    try {
      const response = await fetch('/api/player/social/follow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ followingId: playerId }),
      });

      if (!response.ok) {
        throw new Error('Failed to follow player');
      }

      toast.success('Player followed successfully');
      await fetchFrenemies();
    } catch (error) {
      console.error('Failed to follow player:', error);
      toast.error('Failed to follow player');
    }
  };

  const handleUnfollowPlayer = async (playerId: string) => {
    try {
      const response = await fetch(`/api/player/social/unfollow/${playerId}`, {
        method: 'PUT',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to unfollow player');
      }

      toast.success('Player unfollowed successfully');
      await fetchFrenemies();
    } catch (error) {
      console.error('Failed to unfollow player:', error);
      toast.error('Failed to unfollow player');
    }
  };

  const handleSuspendPlayer = async (gameId: string, playerId: string, reason?: string) => {
    try {
      const response = await fetch(`/api/player/games/${gameId}/players/${playerId}/suspend`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        throw new Error('Failed to suspend player');
      }

      toast.success('Player suspended successfully');
    } catch (error) {
      console.error('Failed to suspend player:', error);
      toast.error('Failed to suspend player');
    }
  };

  const handleActivatePlayer = async (gameId: string, playerId: string) => {
    try {
      const response = await fetch(`/api/player/games/${gameId}/players/${playerId}/activate`, {
        method: 'PUT',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to activate player');
      }

      toast.success('Player activated successfully');
    } catch (error) {
      console.error('Failed to activate player:', error);
      toast.error('Failed to activate player');
    }
  };

  const handleBlockPlayer = async (gameId: string, playerId: string, reason?: string) => {
    try {
      const response = await fetch(`/api/player/games/${gameId}/players/${playerId}/block`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        throw new Error('Failed to block player');
      }

      toast.success('Player blocked successfully');
    } catch (error) {
      console.error('Failed to block player:', error);
      toast.error('Failed to block player');
    }
  };

  const handleUnblockPlayer = async (gameId: string, playerId: string) => {
    try {
      const response = await fetch(`/api/player/games/${gameId}/players/${playerId}/unblock`, {
        method: 'PUT',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to unblock player');
      }

      toast.success('Player unblocked successfully');
    } catch (error) {
      console.error('Failed to unblock player:', error);
      toast.error('Failed to unblock player');
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Shield className="h-4 w-4" />;
      case 'GAME_MANAGER':
        return <UserCheck className="h-4 w-4" />;
      case 'PLAYER':
        return <UserIcon className="h-4 w-4" />;
      default:
        return <UserIcon className="h-4 w-4" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800';
      case 'GAME_MANAGER':
        return 'bg-yellow-100 text-yellow-800';
      case 'PLAYER':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlayerDisplayName = (player: Player) => {
    if (player.gamerTag) return player.gamerTag;
    if (player.firstName && player.lastName) return `${player.firstName} ${player.lastName}`;
    if (player.firstName) return player.firstName;
    return player.email.split('@')[0];
  };

  const renderPlayerCard = (player: Player) => (
    <div key={player.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
            <Users className="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">
              {getPlayerDisplayName(player)}
            </div>
            <div className="text-sm text-gray-500">{player.email}</div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(player.role)}`}>
            {getRoleIcon(player.role)}
            <span className="ml-1">{player.role}</span>
          </span>
          
          {user?.role !== 'PLAYER' && (
            <div className="relative">
              <button
                onClick={() => setShowPlayerActions(showPlayerActions === player.id ? null : player.id)}
                className="text-gray-400 hover:text-gray-600"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
              
              {showPlayerActions === player.id && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border">
                  <button
                    onClick={() => {
                      // This would open a modal to select game and perform action
                      toast.info('Select a game to perform player actions');
                      setShowPlayerActions(null);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Ban className="h-4 w-4 inline mr-2" />
                    Suspend from Game
                  </button>
                  <button
                    onClick={() => {
                      toast.info('Select a game to perform player actions');
                      setShowPlayerActions(null);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <CheckCircle className="h-4 w-4 inline mr-2" />
                    Activate in Game
                  </button>
                  <button
                    onClick={() => {
                      toast.info('Select a game to perform player actions');
                      setShowPlayerActions(null);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    <XCircle className="h-4 w-4 inline mr-2" />
                    Block from Game
                  </button>
                </div>
              )}
            </div>
          )}
          
          {user?.role === 'PLAYER' && player.id !== user.id && (
            <button
              onClick={() => handleFollowPlayer(player.id)}
              className="text-blue-600 hover:text-blue-900"
              title="Follow Player"
            >
              <UserPlus className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const renderConnectionCard = (connection: PlayerConnection, type: 'minion' | 'frenemy') => {
    const otherPlayer = type === 'minion' ? connection.follower : connection.following;
    if (!otherPlayer) return null;

    return (
      <div key={connection.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
              {type === 'minion' ? <Crown className="h-5 w-5 text-yellow-600" /> : <Heart className="h-5 w-5 text-red-600" />}
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">
                {getPlayerDisplayName(otherPlayer)}
              </div>
              <div className="text-sm text-gray-500">{otherPlayer.email}</div>
              <div className="text-xs text-gray-400">
                {type === 'minion' ? 'Following you' : 'You follow them'} • {new Date(connection.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(otherPlayer.role)}`}>
              {getRoleIcon(otherPlayer.role)}
              <span className="ml-1">{otherPlayer.role}</span>
            </span>
            
            {type === 'frenemy' && (
              <button
                onClick={() => handleUnfollowPlayer(otherPlayer.id)}
                className="text-red-600 hover:text-red-900"
                title="Unfollow Player"
              >
                <UserMinus className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Players</h1>
          <p className="mt-1 text-sm text-gray-500">
            {user?.role === 'PLAYER' 
              ? 'Manage your social connections and find other players'
              : 'Search and manage players across all games'
            }
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('search')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'search'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Search className="h-4 w-4 inline mr-2" />
            {user?.role === 'PLAYER' ? 'Find Players' : 'All Players'}
          </button>
          <button
            onClick={() => setActiveTab('minions')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'minions'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Crown className="h-4 w-4 inline mr-2" />
            Minions ({minions.length})
          </button>
          <button
            onClick={() => setActiveTab('frenemies')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'frenemies'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Heart className="h-4 w-4 inline mr-2" />
            Frenemies ({frenemies.length})
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'search' && (
        <div className="space-y-4">
          {/* Search */}
          <div className="flex items-center space-x-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search players by name or email..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    if (user?.role !== 'PLAYER') {
                      searchPlayers(e.target.value);
                    }
                  }}
                  className="input pl-10"
                />
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {filteredPlayers.length} players found
            </div>
          </div>

          {/* Search Results */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : filteredPlayers.length > 0 ? (
            <div className="grid gap-4">
              {filteredPlayers.map(renderPlayerCard)}
            </div>
          ) : searchTerm ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No players found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search terms.
              </p>
            </div>
          ) : (
            <div className="text-center py-12">
              <Search className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Search for Players</h3>
              <p className="mt-1 text-sm text-gray-500">
                {user?.role === 'PLAYER' 
                  ? 'Start typing to find other players and connect with them.'
                  : 'Start typing to search through all registered players.'
                }
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'minions' && (
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            Players you referred to your games ({minions.length})
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : minions.length > 0 ? (
            <div className="grid gap-4">
              {minions.map(connection => renderConnectionCard(connection, 'minion'))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Crown className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No Minions Yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                When other players follow you, they'll appear here as your minions.
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'frenemies' && (
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            Players you follow ({frenemies.length})
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : frenemies.length > 0 ? (
            <div className="grid gap-4">
              {frenemies.map(connection => renderConnectionCard(connection, 'frenemy'))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Heart className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No Frenemies Yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Find other players and follow them to build your network of frenemies.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}