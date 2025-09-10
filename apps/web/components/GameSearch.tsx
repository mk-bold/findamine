'use client';

import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, ChevronUp, Filter, X, MapPin, Calendar, DollarSign } from 'lucide-react';

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
  _count?: {
    playerGames: number;
  };
}

interface SearchFilters {
  keyword: string;
  searchFields: string[];
  sortBy: 'relevance' | 'startDate' | 'endDate' | 'distance' | 'popularity';
  sortOrder: 'asc' | 'desc';
  status: string[];
  prizePoolMin: string;
  prizePoolMax: string;
  entryFeeMin: string;
  entryFeeMax: string;
  maxPlayersMin: string;
  maxPlayersMax: string;
  isPublic: string;
  hasEndDate: string;
  startDateFrom: string;
  startDateTo: string;
  endDateFrom: string;
  endDateTo: string;
  clueLocationSearch: string;
  selectedClueLocationId: string;
}

interface GameSearchProps {
  games: Game[];
  onFilteredGamesChange: (filteredGames: Game[]) => void;
  userLocation?: { lat: number; lng: number };
}

const defaultFilters: SearchFilters = {
  keyword: '',
  searchFields: ['name', 'description', 'gameCenterAddress', 'rules'],
  sortBy: 'distance', // Default to distance if location available, fallback to popularity
  sortOrder: 'asc',
  status: [],
  prizePoolMin: '',
  prizePoolMax: '',
  entryFeeMin: '',
  entryFeeMax: '',
  maxPlayersMin: '',
  maxPlayersMax: '',
  isPublic: '',
  hasEndDate: '',
  startDateFrom: '',
  startDateTo: '',
  endDateFrom: '',
  endDateTo: '',
  clueLocationSearch: '',
  selectedClueLocationId: '',
};

const searchFieldOptions = [
  { value: 'name', label: 'Game Name' },
  { value: 'description', label: 'Description' },
  { value: 'gameCenterAddress', label: 'Location' },
  { value: 'rules', label: 'Rules' },
];

const sortOptions = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'startDate', label: 'Start Date' },
  { value: 'endDate', label: 'End Date' },
  { value: 'distance', label: 'Distance' },
  { value: 'popularity', label: 'Popularity' },
];

const statusOptions = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'PAUSED', label: 'Paused' },
  { value: 'COMPLETED', label: 'Completed' },
];

export default function GameSearch({ games, onFilteredGamesChange, userLocation }: GameSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>(defaultFilters);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [clueLocations, setClueLocations] = useState<any[]>([]);
  const [isLoadingClues, setIsLoadingClues] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Calculate distance between two points
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Search for clue locations
  const searchClueLocations = async (query: string) => {
    if (!query.trim()) {
      setClueLocations([]);
      return;
    }

    try {
      setIsLoadingClues(true);
      const response = await fetch(`/api/game-master/clue-locations?search=${encodeURIComponent(query)}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setClueLocations(data);
      }
    } catch (error) {
      console.error('Error searching clue locations:', error);
    } finally {
      setIsLoadingClues(false);
    }
  };

  // Get count of games that use a specific clue location
  const getClueLocationGameCount = async (clueLocationId: string) => {
    try {
      const response = await fetch(`/api/games/by-clue-location/${clueLocationId}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        return data.count || 0;
      } else {
        return 0;
      }
    } catch (error) {
      console.error('Error getting clue location game count:', error);
      return 0;
    }
  };

  // Filter and sort games based on current filters
  const filterAndSortGames = () => {
    let filteredGames = [...games];

    // Apply keyword search
    if (filters.keyword.trim()) {
      const keyword = filters.keyword.toLowerCase();
      filteredGames = filteredGames.filter(game => {
        return filters.searchFields.some(field => {
          const value = game[field as keyof Game];
          if (typeof value === 'string') {
            return value.toLowerCase().includes(keyword);
          }
          return false;
        });
      });
    }

    // Apply status filter
    if (filters.status.length > 0) {
      filteredGames = filteredGames.filter(game => filters.status.includes(game.status));
    }

    // Apply prize pool filter
    if (filters.prizePoolMin) {
      const min = parseFloat(filters.prizePoolMin);
      filteredGames = filteredGames.filter(game => game.prizePool >= min);
    }
    if (filters.prizePoolMax) {
      const max = parseFloat(filters.prizePoolMax);
      filteredGames = filteredGames.filter(game => game.prizePool <= max);
    }

    // Apply entry fee filter
    if (filters.entryFeeMin) {
      const min = parseFloat(filters.entryFeeMin);
      filteredGames = filteredGames.filter(game => game.entryFee >= min);
    }
    if (filters.entryFeeMax) {
      const max = parseFloat(filters.entryFeeMax);
      filteredGames = filteredGames.filter(game => game.entryFee <= max);
    }

    // Apply max players filter
    if (filters.maxPlayersMin) {
      const min = parseInt(filters.maxPlayersMin);
      filteredGames = filteredGames.filter(game => game.maxPlayers >= min);
    }
    if (filters.maxPlayersMax) {
      const max = parseInt(filters.maxPlayersMax);
      filteredGames = filteredGames.filter(game => game.maxPlayers <= max);
    }

    // Apply public/private filter
    if (filters.isPublic === 'true') {
      filteredGames = filteredGames.filter(game => game.isPublic);
    } else if (filters.isPublic === 'false') {
      filteredGames = filteredGames.filter(game => !game.isPublic);
    }

    // Apply end date filter
    if (filters.hasEndDate === 'true') {
      filteredGames = filteredGames.filter(game => game.endDate);
    } else if (filters.hasEndDate === 'false') {
      filteredGames = filteredGames.filter(game => !game.endDate);
    }

    // Apply start date range filter
    if (filters.startDateFrom) {
      const fromDate = new Date(filters.startDateFrom);
      filteredGames = filteredGames.filter(game => new Date(game.startDate) >= fromDate);
    }
    if (filters.startDateTo) {
      const toDate = new Date(filters.startDateTo);
      filteredGames = filteredGames.filter(game => new Date(game.startDate) <= toDate);
    }

    // Apply end date range filter
    if (filters.endDateFrom) {
      const fromDate = new Date(filters.endDateFrom);
      filteredGames = filteredGames.filter(game => game.endDate && new Date(game.endDate) >= fromDate);
    }
    if (filters.endDateTo) {
      const toDate = new Date(filters.endDateTo);
      filteredGames = filteredGames.filter(game => game.endDate && new Date(game.endDate) <= toDate);
    }

    // Sort games
    filteredGames.sort((a, b) => {
      let comparison = 0;

      switch (filters.sortBy) {
        case 'startDate':
          comparison = new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
          break;
        case 'endDate':
          const aEndDate = a.endDate ? new Date(a.endDate).getTime() : Infinity;
          const bEndDate = b.endDate ? new Date(b.endDate).getTime() : Infinity;
          comparison = aEndDate - bEndDate;
          break;
        case 'distance':
          if (userLocation) {
            const aDist = calculateDistance(userLocation.lat, userLocation.lng, a.gameCenterLat, a.gameCenterLng);
            const bDist = calculateDistance(userLocation.lat, userLocation.lng, b.gameCenterLat, b.gameCenterLng);
            comparison = aDist - bDist;
          } else {
            // Fall back to popularity if no location available
            const aPlayerCount = a._count?.playerGames || 0;
            const bPlayerCount = b._count?.playerGames || 0;
            comparison = bPlayerCount - aPlayerCount;
          }
          break;
        case 'popularity':
          const aPlayerCount = a._count?.playerGames || 0;
          const bPlayerCount = b._count?.playerGames || 0;
          comparison = bPlayerCount - aPlayerCount;
          break;
        case 'relevance':
        default:
          // For relevance, prioritize games that match more fields or have keyword in title
          if (filters.keyword.trim()) {
            const keyword = filters.keyword.toLowerCase();
            const aInTitle = a.name.toLowerCase().includes(keyword) ? 1 : 0;
            const bInTitle = b.name.toLowerCase().includes(keyword) ? 1 : 0;
            comparison = bInTitle - aInTitle;
          }
          break;
      }

      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    onFilteredGamesChange(filteredGames);
  };

  // Set default sort order based on location availability and update when location changes
  useEffect(() => {
    if (!hasInitialized) {
      if (!userLocation) {
        // If no location, default to popularity
        setFilters(prev => ({ ...prev, sortBy: 'popularity' }));
      }
      setHasInitialized(true);
    } else {
      // After initialization, update sort order when location availability changes
      setFilters(prev => {
        // If location becomes available and current sort is popularity, switch to distance
        if (userLocation && prev.sortBy === 'popularity') {
          return { ...prev, sortBy: 'distance' };
        }
        // If location becomes unavailable and current sort is distance, switch to popularity
        if (!userLocation && prev.sortBy === 'distance') {
          return { ...prev, sortBy: 'popularity' };
        }
        return prev;
      });
    }
  }, [userLocation, hasInitialized]);

  // Apply filters whenever they change
  useEffect(() => {
    filterAndSortGames();
  }, [filters, games, userLocation]);

  // Search clue locations when search term changes
  useEffect(() => {
    if (filters.clueLocationSearch && !filters.selectedClueLocationId) {
      const timeoutId = setTimeout(() => {
        searchClueLocations(filters.clueLocationSearch);
      }, 300);
      return () => clearTimeout(timeoutId);
    } else if (!filters.clueLocationSearch) {
      setClueLocations([]);
    }
  }, [filters.clueLocationSearch, filters.selectedClueLocationId]);


  const updateFilters = (updates: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...updates }));
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
    setClueLocations([]);
  };

  const toggleSearchField = (field: string) => {
    const newFields = filters.searchFields.includes(field)
      ? filters.searchFields.filter(f => f !== field)
      : [...filters.searchFields, field];
    updateFilters({ searchFields: newFields });
  };

  const toggleStatus = (status: string) => {
    const newStatuses = filters.status.includes(status)
      ? filters.status.filter(s => s !== status)
      : [...filters.status, status];
    updateFilters({ status: newStatuses });
  };

  const selectClueLocation = async (location: any) => {
    // Get the count of games using this clue location
    const gameCount = await getClueLocationGameCount(location.id);
    
    // Show an informational message instead of filtering
    alert(`${location.identifyingName} is used in ${gameCount} active/draft game${gameCount !== 1 ? 's' : ''}.`);
    
    // Clear the search and hide dropdown
    updateFilters({ 
      clueLocationSearch: '',
      selectedClueLocationId: ''
    });
    setClueLocations([]);
  };

  const hasActiveFilters = () => {
    return filters.keyword.trim() !== '' ||
           filters.status.length > 0 ||
           filters.prizePoolMin !== '' ||
           filters.prizePoolMax !== '' ||
           filters.entryFeeMin !== '' ||
           filters.entryFeeMax !== '' ||
           filters.maxPlayersMin !== '' ||
           filters.maxPlayersMax !== '' ||
           filters.isPublic !== '' ||
           filters.hasEndDate !== '' ||
           filters.clueLocationSearch !== '' ||
           filters.selectedClueLocationId !== '';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-6">
      {/* Basic Search */}
      <div className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Keyword Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search games..."
                value={filters.keyword}
                onChange={(e) => updateFilters({ keyword: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Sort Options */}
          <div className="flex gap-2">
            <select
              value={filters.sortBy}
              onChange={(e) => updateFilters({ sortBy: e.target.value as SearchFilters['sortBy'] })}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  Sort by {option.label}
                </option>
              ))}
            </select>

            <select
              value={filters.sortOrder}
              onChange={(e) => updateFilters({ sortOrder: e.target.value as 'asc' | 'desc' })}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>

          {/* Advanced Search Toggle */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center px-4 py-2 text-blue-600 hover:text-blue-800 font-medium"
          >
            <Filter className="h-4 w-4 mr-1" />
            Advanced Search
            {showAdvanced ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
          </button>
        </div>

        {/* Search Field Selection */}
        <div className="mt-3">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-600 py-1">Search in:</span>
            {searchFieldOptions.map(option => (
              <button
                key={option.value}
                onClick={() => toggleSearchField(option.value)}
                className={`px-2 py-1 rounded text-xs font-medium ${
                  filters.searchFields.includes(option.value)
                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                    : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Active Filters Indicator */}
        {hasActiveFilters() && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-sm text-gray-600">Active filters:</span>
            <button
              onClick={resetFilters}
              className="flex items-center px-2 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200"
            >
              <X className="h-3 w-3 mr-1" />
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Advanced Search */}
      {showAdvanced && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <h4 className="font-medium text-gray-900 mb-4">Advanced Search Options</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <div className="space-y-1">
                {statusOptions.map(option => (
                  <label key={option.value} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.status.includes(option.value)}
                      onChange={() => toggleStatus(option.value)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Prize Pool */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Prize Pool ($)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.prizePoolMin}
                  onChange={(e) => updateFilters({ prizePoolMin: e.target.value })}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.prizePoolMax}
                  onChange={(e) => updateFilters({ prizePoolMax: e.target.value })}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Entry Fee */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Entry Fee ($)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.entryFeeMin}
                  onChange={(e) => updateFilters({ entryFeeMin: e.target.value })}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.entryFeeMax}
                  onChange={(e) => updateFilters({ entryFeeMax: e.target.value })}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Max Players */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Players</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.maxPlayersMin}
                  onChange={(e) => updateFilters({ maxPlayersMin: e.target.value })}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPlayersMax}
                  onChange={(e) => updateFilters({ maxPlayersMax: e.target.value })}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Public/Private */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Visibility</label>
              <select
                value={filters.isPublic}
                onChange={(e) => updateFilters({ isPublic: e.target.value })}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All Games</option>
                <option value="true">Public Only</option>
                <option value="false">Private Only</option>
              </select>
            </div>

            {/* Has End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
              <select
                value={filters.hasEndDate}
                onChange={(e) => updateFilters({ hasEndDate: e.target.value })}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All Games</option>
                <option value="true">Fixed Duration</option>
                <option value="false">Ongoing</option>
              </select>
            </div>

            {/* Game Start Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Game Start Date</label>
              <div className="flex gap-2">
                <input
                  type="date"
                  placeholder="From"
                  value={filters.startDateFrom}
                  onChange={(e) => updateFilters({ startDateFrom: e.target.value })}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <input
                  type="date"
                  placeholder="To"
                  value={filters.startDateTo}
                  onChange={(e) => updateFilters({ startDateTo: e.target.value })}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Game End Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Game End Date</label>
              <div className="flex gap-2">
                <input
                  type="date"
                  placeholder="From"
                  value={filters.endDateFrom}
                  onChange={(e) => updateFilters({ endDateFrom: e.target.value })}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <input
                  type="date"
                  placeholder="To"
                  value={filters.endDateTo}
                  onChange={(e) => updateFilters({ endDateTo: e.target.value })}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Clue Location Search */}
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">Games with Clue Locations</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by city, state, or country..."
                  value={filters.clueLocationSearch}
                  onChange={(e) => updateFilters({ clueLocationSearch: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              {filters.selectedClueLocationId && (
                <div className="mt-2 flex items-center gap-2 text-sm">
                  <span className="text-green-600 font-medium">
                    Selected: {filters.clueLocationSearch}
                  </span>
                  <button
                    onClick={() => {
                      updateFilters({ selectedClueLocationId: '', clueLocationSearch: '' });
                      setClueLocations([]);
                    }}
                    className="text-red-600 hover:text-red-800 flex items-center gap-1"
                  >
                    <X className="h-3 w-3" />
                    Clear
                  </button>
                </div>
              )}
              {isLoadingClues && (
                <div className="mt-2 text-sm text-gray-500">Searching clue locations...</div>
              )}
              {clueLocations.length > 0 && !filters.selectedClueLocationId && (
                <div className="mt-2 max-h-32 overflow-y-auto border border-gray-200 rounded">
                  {clueLocations.slice(0, 10).map((location, index) => (
                    <button
                      key={index}
                      onClick={() => selectClueLocation(location)}
                      className="w-full px-3 py-2 hover:bg-gray-50 text-sm border-b border-gray-100 last:border-b-0 text-left focus:outline-none focus:bg-blue-50"
                    >
                      <div className="font-medium">{location.identifyingName}</div>
                      <div className="text-gray-500 text-xs">{location.anonymizedName}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}