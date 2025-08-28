import axios from 'axios';

// API base URL
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';

// Create axios instance with credentials support
const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // This enables cookies to be sent with requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for debugging and cookie consent
api.interceptors.request.use(
  (config) => {
    // Only log non-profile requests to reduce noise
    if (!config.url?.includes('/auth/profile')) {
      console.log('API: Request interceptor - URL:', config.url, 'Method:', config.method);
    }

    // Add cookie consent header if available
    if (typeof window !== 'undefined') {
      const consent = localStorage.getItem('cookie-consent');
      if (consent) {
        config.headers['X-Cookie-Consent'] = consent;
      }
    }

    // Note: We don't need to manually add Authorization header for web app
    // as cookies are automatically sent with withCredentials: true
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect to login for authenticated endpoints, not for profile checks
      // Profile checks returning 401 is expected for unauthenticated users
      const isProfileCheck = error.config?.url?.includes('/auth/profile');
      const isLoginEndpoint = error.config?.url?.includes('/auth/login');
      
      if (!isProfileCheck && !isLoginEndpoint) {
        // Token expired or invalid for authenticated endpoints
        localStorage.removeItem('authToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Types
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'ADMIN' | 'GAME_MASTER' | 'PLAYER';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Game {
  id: string;
  name: string;
  description?: string;
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
  startDate: string;
  endDate?: string;
  isOngoing: boolean;
  createdBy: string;
  creator: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ClueLocation {
  id: string;
  identifyingName: string;
  anonymizedName: string;
  latitude: number;
  longitude: number;
  text: string;
  hint?: string;
  gpsVerificationRadius: number;
  requiresSelfie: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GameClue {
  id: string;
  gameId: string;
  clueLocationId: string;
  customName?: string;
  customText?: string;
  customHint?: string;
  points: number;
  releaseTime?: string;
  isReleased: boolean;
  clueLocation: ClueLocation;
}

export interface PlayerGame {
  id: string;
  userId: string;
  gameId: string;
  isActive: boolean;
  joinedAt: string;
  leftAt?: string;
  totalPoints: number;
  privacyLevel: 'PRIVATE' | 'MINIONS_ONLY' | 'MINIONS_AND_FRENEMIES' | 'PUBLIC';
  user: User;
  game: Game;
}

export interface ClueFinding {
  id: string;
  userId: string;
  gameClueId: string;
  foundAt: string;
  gpsLatitude: number;
  gpsLongitude: number;
  selfiePhoto?: string;
  points: number;
  gameClue: GameClue;
}

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    console.log('API: Making login request to:', `${API_BASE}/auth/login`);
    console.log('API: Request payload:', { email, password });

    try {
      const response = await api.post('/auth/login', { email, password });
      console.log('API: Login response:', response.data);

                // Check if we can set necessary cookies (authentication)
          if (typeof window !== 'undefined') {
            const consent = localStorage.getItem('cookie-consent');
            if (consent) {
              try {
                const parsed = JSON.parse(consent);
                if (!parsed.preferences?.necessary) {
                  console.warn('API: Necessary cookies not allowed - authentication may not work properly');
                  // You could show a toast notification here to inform the user
                }
              } catch (error) {
                console.error('API: Failed to parse cookie consent:', error);
              }
            }
          }

      return response.data;
    } catch (error) {
      console.error('API: Login request failed:', error);
      throw error;
    }
  },

  register: async (email: string, password: string, firstName?: string, lastName?: string) => {
    const response = await api.post('/auth/register', { email, password, firstName, lastName });
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },


};

// Admin API
export const adminAPI = {
  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  getUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },

  getUser: async (id: string) => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },

  updateUser: async (id: string, data: Partial<User>) => {
    const response = await api.put(`/admin/users/${id}`, data);
    return response.data;
  },

  promoteUser: async (id: string, role: 'GAME_MASTER' | 'ADMIN') => {
    const response = await api.put(`/admin/users/${id}/promote`, { role });
    return response.data;
  },

  activateUser: async (id: string) => {
    const response = await api.put(`/admin/users/${id}/activate`);
    return response.data;
  },

  deactivateUser: async (id: string) => {
    const response = await api.put(`/admin/users/${id}/deactivate`);
    return response.data;
  },

  deleteUser: async (id: string) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },
};

// Game Master API
export const gameMasterAPI = {
  getStats: async () => {
    const response = await api.get('/game-master/stats');
    return response.data;
  },

  getFeatures: async () => {
    const response = await api.get('/game-master/features');
    return response.data;
  },

  createGame: async (gameData: Partial<Game>) => {
    const response = await api.post('/game-master/games', gameData);
    return response.data;
  },

  getGames: async (status?: string) => {
    const response = await api.get('/game-master/games', { params: { status } });
    return response.data;
  },

  getGame: async (id: string) => {
    const response = await api.get(`/game-master/games/${id}`);
    return response.data;
  },

  updateGame: async (id: string, gameData: Partial<Game>) => {
    const response = await api.put(`/game-master/games/${id}`, gameData);
    return response.data;
  },

  deleteGame: async (id: string) => {
    const response = await api.delete(`/game-master/games/${id}`);
    return response.data;
  },

  getGameStats: async (id: string) => {
    const response = await api.get(`/game-master/games/${id}/stats`);
    return response.data;
  },

  createClueLocation: async (clueData: Partial<ClueLocation>) => {
    const response = await api.post('/game-master/clue-locations', clueData);
    return response.data;
  },

  getClueLocations: async (search?: string, lat?: number, lng?: number, radius?: number) => {
    const response = await api.get('/game-master/clue-locations', {
      params: { search, lat, lng, radius }
    });
    return response.data;
  },

  getClueLocation: async (id: string) => {
    const response = await api.get(`/game-master/clue-locations/${id}`);
    return response.data;
  },

  updateClueLocation: async (id: string, clueData: Partial<ClueLocation>) => {
    const response = await api.put(`/game-master/clue-locations/${id}`, clueData);
    return response.data;
  },

  addClueToGame: async (gameId: string, clueData: Partial<GameClue>) => {
    const response = await api.post(`/game-master/games/${gameId}/clues`, clueData);
    return response.data;
  },

  getGameClues: async (gameId: string) => {
    const response = await api.get(`/game-master/games/${gameId}/clues`);
    return response.data;
  },

  updateGameClue: async (gameId: string, clueId: string, clueData: Partial<GameClue>) => {
    const response = await api.put(`/game-master/games/${gameId}/clues/${clueId}`, clueData);
    return response.data;
  },

  removeClueFromGame: async (gameId: string, clueId: string) => {
    const response = await api.delete(`/game-master/games/${gameId}/clues/${clueId}`);
    return response.data;
  },

  createPrize: async (gameId: string, prizeData: any) => {
    const response = await api.post(`/game-master/games/${gameId}/prizes`, prizeData);
    return response.data;
  },

  getGamePrizes: async (gameId: string) => {
    const response = await api.get(`/game-master/games/${gameId}/prizes`);
    return response.data;
  },

  addPlayerToGame: async (gameId: string, playerData: any) => {
    const response = await api.post(`/game-master/games/${gameId}/players`, playerData);
    return response.data;
  },

  batchAddPlayers: async (gameId: string, playersData: any) => {
    const response = await api.post(`/game-master/games/${gameId}/players/batch`, playersData);
    return response.data;
  },

  removePlayerFromGame: async (gameId: string, userId: string) => {
    const response = await api.put(`/game-master/games/${gameId}/players/${userId}/remove`);
    return response.data;
  },

  deleteChatPost: async (gameId: string, postId: string) => {
    const response = await api.delete(`/game-master/games/${gameId}/chat/${postId}`);
    return response.data;
  },
};

// Player API
export const playerAPI = {
  getAvailableGames: async () => {
    const response = await api.get('/player/games/available');
    return response.data;
  },

  joinGame: async (gameId: string) => {
    const response = await api.post(`/player/games/${gameId}/join`);
    return response.data;
  },

  leaveGame: async (gameId: string) => {
    const response = await api.put(`/player/games/${gameId}/leave`);
    return response.data;
  },

  getMyGames: async () => {
    const response = await api.get('/player/games/my');
    return response.data;
  },

  getAvailableClues: async (gameId: string) => {
    const response = await api.get(`/player/games/${gameId}/clues`);
    return response.data;
  },

  findClue: async (gameId: string, findData: any) => {
    const response = await api.post(`/player/games/${gameId}/clues/find`, findData);
    return response.data;
  },

  getMyFindings: async (gameId?: string) => {
    const response = await api.get('/player/clues/findings', {
      params: { gameId }
    });
    return response.data;
  },

  getMyProfile: async () => {
    const response = await api.get('/player/profile');
    return response.data;
  },

  updateProfile: async (profileData: any) => {
    const response = await api.put('/player/profile', profileData);
    return response.data;
  },

  getGameLeaderboard: async (gameId: string, limit: number = 50) => {
    const response = await api.get(`/player/leaderboard/game/${gameId}`, {
      params: { limit }
    });
    return response.data;
  },

  getGlobalLeaderboard: async (limit: number = 100) => {
    const response = await api.get('/player/leaderboard/global', {
      params: { limit }
    });
    return response.data;
  },

  followPlayer: async (followingId: string) => {
    const response = await api.post('/player/social/follow', { followingId });
    return response.data;
  },

  unfollowPlayer: async (followingId: string) => {
    const response = await api.put(`/player/social/unfollow/${followingId}`);
    return response.data;
  },

  getMyFollowers: async () => {
    const response = await api.get('/player/social/followers');
    return response.data;
  },

  getMyFollowing: async () => {
    const response = await api.get('/player/social/following');
    return response.data;
  },
};

export default api; 