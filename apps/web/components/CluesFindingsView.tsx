'use client';

import React, { useState, useEffect } from 'react';
import { X, MapPin, Calendar, User, Camera, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { ClueFindingsResponse, ClueFindingWithDetails } from '../types/clue-findings';
import { formatUtcToLocal } from '../lib/timezone';

interface CluesFindingsViewProps {
  clueLocationId: string;
  gameId: string;
  clueName: string;
  onClose: () => void;
}

export default function CluesFindingsView({ 
  clueLocationId, 
  gameId, 
  clueName, 
  onClose 
}: CluesFindingsViewProps) {
  const [data, setData] = useState<ClueFindingsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedFindings, setExpandedFindings] = useState<Set<string>>(new Set());
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);

  useEffect(() => {
    fetchClueFindingsData();
  }, [clueLocationId, gameId]);

  const fetchClueFindingsData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/clue-findings/${clueLocationId}?gameId=${gameId}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const findingsData = await response.json();
        setData(findingsData);
      } else {
        setError('Failed to load clue findings');
      }
    } catch (err) {
      console.error('Error fetching clue findings:', err);
      setError('Failed to load clue findings');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleExpanded = (findingId: string) => {
    const newExpanded = new Set(expandedFindings);
    if (newExpanded.has(findingId)) {
      newExpanded.delete(findingId);
    } else {
      newExpanded.add(findingId);
    }
    setExpandedFindings(newExpanded);
  };

  const formatDate = (dateString: string) => {
    return formatUtcToLocal(dateString, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return formatUtcToLocal(dateString, {
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    });
  };

  const formatDateTime = (dateString: string) => {
    return `${formatDate(dateString)} ${formatTime(dateString)}`;
  };

  const getDisplayName = (user: ClueFindingWithDetails['user']) => {
    if (user.gamerTag) return user.gamerTag;
    if (user.firstName) return user.firstName;
    return 'Anonymous Player';
  };

  const renderFindingCard = (finding: ClueFindingWithDetails, isCurrentGame = true) => {
    const isExpanded = expandedFindings.has(finding.id);
    const displayText = finding.gameClue.customText || finding.gameClue.clueLocation.text;
    const hasCustomText = !!finding.gameClue.customText;

    return (
      <div key={finding.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
        {/* Summary Row */}
        <div className="flex items-start space-x-4">
          {/* Thumbnail Photo */}
          <div className="flex-shrink-0">
            {finding.selfiePhoto && finding.sharePhoto ? (
              <img
                src={finding.selfiePhoto}
                alt="Finding photo"
                className="w-16 h-16 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setEnlargedImage(finding.selfiePhoto!)}
              />
            ) : (
              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                <Camera className="w-6 h-6 text-gray-400" />
              </div>
            )}
          </div>

          {/* Finding Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900 mb-1">
                  {data?.clueInfo.identifyingName}
                </h4>
                <p className="text-xs text-gray-500 mb-2">
                  {data?.clueInfo.anonymizedName}
                </p>

                {/* Address */}
                <div className="flex items-center text-xs text-gray-500 mb-2">
                  <MapPin className="w-3 h-3 mr-1" />
                  <span>{finding.address}</span>
                </div>

                {/* Basic Info */}
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    <span>{formatDate(finding.foundAt)}</span>
                  </div>
                  <div className="flex items-center">
                    <User className="w-3 h-3 mr-1" />
                    <span>{getDisplayName(finding.user)}</span>
                  </div>
                  <div className="font-medium text-blue-600">
                    {finding.points} pts
                  </div>
                  {!isCurrentGame && (
                    <div className="text-gray-400">
                      {finding.gameClue.game.name}
                    </div>
                  )}
                </div>
              </div>

              {/* View Details Button */}
              <button
                onClick={() => toggleExpanded(finding.id)}
                className="flex items-center text-xs text-blue-600 hover:text-blue-800 ml-4"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="w-4 h-4 mr-1" />
                    Hide Details
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 mr-1" />
                    View Details
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column */}
              <div className="space-y-3">
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-1">Finding Details</h5>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><span className="font-medium">Found:</span> {formatDateTime(finding.foundAt)}</p>
                    <p><span className="font-medium">Points Earned:</span> {finding.points}</p>
                    <p><span className="font-medium">GPS Coordinates:</span> {finding.gpsLatitude.toFixed(6)}, {finding.gpsLongitude.toFixed(6)}</p>
                  </div>
                </div>

                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-1">Privacy Settings</h5>
                  <div className="text-sm text-gray-600">
                    <p><span className="font-medium">Sharing Find:</span> {finding.shareFind ? 'Yes' : 'No'}</p>
                    <p><span className="font-medium">Sharing Photo:</span> {finding.sharePhoto ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-3">
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-1">Clue Information</h5>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><span className="font-medium">Clue Text:</span> {displayText}</p>
                    {hasCustomText && (
                      <p><span className="font-medium">Original Text:</span> {finding.gameClue.clueLocation.text}</p>
                    )}
                    <p><span className="font-medium">Location:</span> {finding.gameClue.clueLocation.identifyingName}</p>
                    <p><span className="font-medium">Coordinates:</span> {finding.gameClue.clueLocation.latitude.toFixed(6)}, {finding.gameClue.clueLocation.longitude.toFixed(6)}</p>
                    {finding.gameClue.clueLocation.hint && (
                      <p><span className="font-medium">Hint:</span> {finding.gameClue.customHint || finding.gameClue.clueLocation.hint}</p>
                    )}
                  </div>
                </div>

                {!isCurrentGame && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-1">Game Information</h5>
                    <div className="text-sm text-gray-600">
                      <p><span className="font-medium">Game:</span> {finding.gameClue.game.name}</p>
                      <p><span className="font-medium">Started:</span> {formatDate(finding.gameClue.game.startDate)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Large Photo Display */}
            {finding.selfiePhoto && finding.sharePhoto && (
              <div className="mt-4">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Photo</h5>
                <img
                  src={finding.selfiePhoto}
                  alt="Finding photo"
                  className="max-w-md max-h-64 object-contain rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setEnlargedImage(finding.selfiePhoto!)}
                />
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Error</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-red-600">{error}</p>
          <div className="mt-4 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Main Modal */}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Clue Findings: {clueName}
              </h3>
              {data && (
                <p className="text-sm text-gray-500 mt-1">
                  {data.totalCurrentGame} findings from current game • {data.totalAllGames} findings from all games
                </p>
              )}
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {data && (
              <div className="space-y-8">
                {/* Findings From This Game */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm mr-3">
                      {data.currentGameFindings.length}
                    </span>
                    Findings From This Game
                  </h4>
                  {data.currentGameFindings.length > 0 ? (
                    <div className="space-y-4">
                      {data.currentGameFindings.map((finding) => renderFindingCard(finding, true))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No findings yet for this clue in the current game.</p>
                    </div>
                  )}
                </div>

                {/* Findings From All Games */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm mr-3">
                      {data.allGamesFindings.length}
                    </span>
                    Findings From All Games (Last 2 Years)
                  </h4>
                  {data.allGamesFindings.length > 0 ? (
                    <div className="space-y-4">
                      {data.allGamesFindings.map((finding) => renderFindingCard(finding, false))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No findings for this clue location in other games over the last 2 years.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Enlargement Modal */}
      {enlargedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-60 p-4"
          onClick={() => setEnlargedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={enlargedImage}
              alt="Enlarged finding photo"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <button
              onClick={() => setEnlargedImage(null)}
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}