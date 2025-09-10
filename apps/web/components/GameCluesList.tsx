'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, Clock, Plus, Edit, Trash2, Search, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import ClueSearchModal from './ClueSearchModal';
import CluesFindingModal from './CluesFindingModal';
import { formatUtcToLocal } from '../lib/timezone';

interface ClueLocation {
  id: string;
  identifyingName: string;
  anonymizedName: string;
  latitude: number;
  longitude: number;
  text: string;
  hint?: string;
  gpsVerificationRadius: number;
  requiresSelfie: boolean;
}

interface GameClue {
  id: string;
  gameId: string;
  clueLocationId: string;
  clueLocation: ClueLocation;
  customName?: string;
  customText?: string;
  customHint?: string;
  points: number;
  releaseTime?: string;
  isReleased: boolean;
  createdAt: string;
  updatedAt: string;
  _count: {
    findings: number;
  };
}

interface GameCluesListProps {
  gameId: string;
  gameCenterLat?: number;
  gameCenterLng?: number;
  gameStartDate?: string;
}

export default function GameCluesList({ gameId, gameCenterLat, gameCenterLng, gameStartDate }: GameCluesListProps) {
  const [clues, setClues] = useState<GameClue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [editingClue, setEditingClue] = useState<GameClue | null>(null);
  const [showFindingsModal, setShowFindingsModal] = useState(false);
  const [selectedClueForFindings, setSelectedClueForFindings] = useState<GameClue | null>(null);

  useEffect(() => {
    if (gameId) {
      fetchGameClues();
    }
  }, [gameId]);

  const fetchGameClues = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/game-master/games/${gameId}/clues`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setClues(data);
      } else {
        toast.error('Failed to fetch game clues');
      }
    } catch (error) {
      console.error('Error fetching game clues:', error);
      toast.error('Failed to fetch game clues');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return formatUtcToLocal(dateString, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return formatUtcToLocal(dateString, {
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  };

  const getDisplayName = (clue: GameClue) => {
    return clue.clueLocation.identifyingName;
  };

  const getDisplayText = (clue: GameClue) => {
    return clue.customText || clue.clueLocation.text;
  };

  const getDisplayHint = (clue: GameClue) => {
    return clue.customHint || clue.clueLocation.hint;
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    if (!lat1 || !lng1 || !lat2 || !lng2) return null;
    
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleDeleteClue = async (clue: GameClue) => {
    if (!confirm(`Are you sure you want to remove "${getDisplayName(clue)}" from this game?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/game-master/games/${gameId}/clues/${clue.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        toast.success('Clue removed from game successfully');
        fetchGameClues(); // Refresh the clues list
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.error || 'Failed to remove clue from game');
      }
    } catch (error) {
      console.error('Error removing clue from game:', error);
      toast.error('Failed to remove clue from game');
    }
  };

  if (isLoading) {
    return (
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <MapPin className="w-5 h-5 mr-2 text-blue-500" />
          Game Clues ({clues.length})
        </h3>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowSearchModal(true);
          }}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Clue
        </button>
      </div>

      {clues.length === 0 ? (
        <div className="text-center py-8">
          <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No clues yet</h4>
          <p className="text-gray-600 mb-4">
            Add clues to create your treasure hunt game.
          </p>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowSearchModal(true);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Clue
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {clues.map((clue, index) => {
            const distance = gameCenterLat && gameCenterLng 
              ? calculateDistance(gameCenterLat, gameCenterLng, clue.clueLocation.latitude, clue.clueLocation.longitude)
              : null;

            return (
              <div key={clue.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                        #{index + 1}
                      </span>
                      <h4 className="text-sm font-medium text-gray-900">
                        {getDisplayName(clue)}
                      </h4>
                      {clue.isReleased && (
                        <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Released
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {getDisplayText(clue)}
                    </p>
                    
                    <div className="flex items-center text-xs text-gray-500 space-x-4">
                      <div className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        <span>
                          {clue.clueLocation.latitude.toFixed(4)}, {clue.clueLocation.longitude.toFixed(4)}
                          {distance && ` (${distance.toFixed(1)} mi)`}
                        </span>
                      </div>
                      
                      {clue.releaseTime && (
                        <div className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          <span>Release: {formatDate(clue.releaseTime)} {formatTime(clue.releaseTime)}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center">
                        <span className="font-medium">{clue.points} pts</span>
                      </div>
                      
                      <div className="flex items-center">
                        {clue._count.findings > 0 ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setSelectedClueForFindings(clue);
                              setShowFindingsModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 underline flex items-center"
                          >
                            <span>{clue._count.findings} findings</span>
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </button>
                        ) : (
                          <span className="text-gray-500">{clue._count.findings} findings</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setEditingClue(clue);
                        setShowSearchModal(true);
                      }}
                      className="text-gray-400 hover:text-gray-600 p-1 rounded"
                      title="Edit Clue"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDeleteClue(clue);
                      }}
                      className="text-gray-400 hover:text-red-600 p-1 rounded"
                      title="Remove Clue"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ClueSearchModal
        isOpen={showSearchModal}
        onClose={() => {
          setShowSearchModal(false);
          setEditingClue(null);
        }}
        gameId={gameId}
        gameCenterLat={gameCenterLat}
        gameCenterLng={gameCenterLng}
        gameStartDate={gameStartDate}
        onClueAdded={fetchGameClues}
        editingClue={editingClue}
      />

      {selectedClueForFindings && (
        <CluesFindingModal
          isOpen={showFindingsModal}
          onClose={() => {
            setShowFindingsModal(false);
            setSelectedClueForFindings(null);
          }}
          clueLocationId={selectedClueForFindings.clueLocationId}
          gameId={gameId}
          clueName={getDisplayName(selectedClueForFindings)}
        />
      )}
    </div>
  );
}
