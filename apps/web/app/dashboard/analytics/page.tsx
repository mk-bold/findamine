'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Users,
  TrendingUp,
  Target,
  Trophy,
  Calendar,
  MapPin,
  Clock,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  Filter,
  Download,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface AnalyticsData {
  overview: {
    totalPlayers: number;
    activeGames: number;
    totalClues: number;
    totalFindings: number;
    conversionRate: number;
    averageGameDuration: number;
  };
  playerMetrics: {
    newRegistrations: { date: string; count: number }[];
    activeUsers: { date: string; count: number }[];
    retentionRate: number;
    averageSessionTime: number;
  };
  gameMetrics: {
    gamesCreated: { date: string; count: number }[];
    gamesCompleted: { date: string; count: number }[];
    averagePlayersPerGame: number;
    popularGameTypes: { type: string; count: number }[];
  };
  clueMetrics: {
    cluesFound: { date: string; count: number }[];
    averageCluesPerGame: number;
    difficultyDistribution: { difficulty: string; count: number }[];
    topPerformingClues: {
      id: string;
      name: string;
      findCount: number;
      averageTime: number;
    }[];
  };
  geographicData: {
    playersByRegion: { region: string; count: number }[];
    popularLocations: { location: string; gameCount: number }[];
  };
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('overview');

  useEffect(() => {
    fetchAnalytics();
  }, [selectedTimeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics?timeRange=${selectedTimeRange}`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      } else {
        // Mock data for development
        setAnalytics({
          overview: {
            totalPlayers: 1247,
            activeGames: 23,
            totalClues: 456,
            totalFindings: 3891,
            conversionRate: 68.5,
            averageGameDuration: 127,
          },
          playerMetrics: {
            newRegistrations: Array.from({ length: 30 }, (_, i) => ({
              date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              count: Math.floor(Math.random() * 20) + 5,
            })),
            activeUsers: Array.from({ length: 30 }, (_, i) => ({
              date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              count: Math.floor(Math.random() * 50) + 20,
            })),
            retentionRate: 72.3,
            averageSessionTime: 45.2,
          },
          gameMetrics: {
            gamesCreated: Array.from({ length: 30 }, (_, i) => ({
              date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              count: Math.floor(Math.random() * 8) + 1,
            })),
            gamesCompleted: Array.from({ length: 30 }, (_, i) => ({
              date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              count: Math.floor(Math.random() * 6) + 1,
            })),
            averagePlayersPerGame: 8.4,
            popularGameTypes: [
              { type: 'Urban Adventure', count: 45 },
              { type: 'Nature Quest', count: 32 },
              { type: 'Historical Hunt', count: 28 },
              { type: 'Photo Challenge', count: 23 },
              { type: 'Team Building', count: 18 },
            ],
          },
          clueMetrics: {
            cluesFound: Array.from({ length: 30 }, (_, i) => ({
              date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              count: Math.floor(Math.random() * 30) + 10,
            })),
            averageCluesPerGame: 12.7,
            difficultyDistribution: [
              { difficulty: 'Easy', count: 156 },
              { difficulty: 'Medium', count: 203 },
              { difficulty: 'Hard', count: 97 },
            ],
            topPerformingClues: [
              { id: '1', name: 'Downtown Clock Tower', findCount: 89, averageTime: 12.5 },
              { id: '2', name: 'Park Statue Mystery', findCount: 76, averageTime: 18.3 },
              { id: '3', name: 'Historic Bridge Photo', findCount: 71, averageTime: 15.7 },
              { id: '4', name: 'Street Art Hunt', findCount: 68, averageTime: 22.1 },
              { id: '5', name: 'Museum Entrance Code', findCount: 65, averageTime: 9.8 },
            ],
          },
          geographicData: {
            playersByRegion: [
              { region: 'North America', count: 542 },
              { region: 'Europe', count: 387 },
              { region: 'Asia Pacific', count: 231 },
              { region: 'South America', count: 87 },
            ],
            popularLocations: [
              { location: 'Downtown District', gameCount: 34 },
              { location: 'Central Park Area', gameCount: 28 },
              { location: 'Historic Quarter', gameCount: 23 },
              { location: 'University Campus', gameCount: 19 },
              { location: 'Waterfront', gameCount: 16 },
            ],
          },
        });
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    if (!analytics) return;
    
    const dataStr = JSON.stringify(analytics, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `findamine-analytics-${selectedTimeRange}-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success('Analytics data exported successfully');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Data Available</h3>
        <p className="text-gray-600">Analytics data will appear here once you have active games and players.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="mt-2 text-sm text-gray-700">
            Comprehensive insights into game performance and player engagement
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button
            onClick={fetchAnalytics}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={exportData}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Players</dt>
                  <dd className="text-lg font-medium text-gray-900">{analytics.overview.totalPlayers.toLocaleString()}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Activity className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Games</dt>
                  <dd className="text-lg font-medium text-gray-900">{analytics.overview.activeGames}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Target className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Clues</dt>
                  <dd className="text-lg font-medium text-gray-900">{analytics.overview.totalClues}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Trophy className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Findings</dt>
                  <dd className="text-lg font-medium text-gray-900">{analytics.overview.totalFindings.toLocaleString()}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-6 w-6 text-purple-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Conversion Rate</dt>
                  <dd className="text-lg font-medium text-gray-900">{analytics.overview.conversionRate}%</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-6 w-6 text-indigo-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Avg Game Time</dt>
                  <dd className="text-lg font-medium text-gray-900">{analytics.overview.averageGameDuration}min</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Player Growth Chart */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Player Growth</h3>
              <LineChart className="h-5 w-5 text-gray-400" />
            </div>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
              <p className="text-gray-500">Chart visualization would go here</p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">New Registrations</p>
                <p className="font-semibold">{analytics.playerMetrics.newRegistrations.reduce((sum, item) => sum + item.count, 0)}</p>
              </div>
              <div>
                <p className="text-gray-500">Retention Rate</p>
                <p className="font-semibold">{analytics.playerMetrics.retentionRate}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Game Activity Chart */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Game Activity</h3>
              <BarChart3 className="h-5 w-5 text-gray-400" />
            </div>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
              <p className="text-gray-500">Chart visualization would go here</p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Games Created</p>
                <p className="font-semibold">{analytics.gameMetrics.gamesCreated.reduce((sum, item) => sum + item.count, 0)}</p>
              </div>
              <div>
                <p className="text-gray-500">Avg Players/Game</p>
                <p className="font-semibold">{analytics.gameMetrics.averagePlayersPerGame}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Performing Clues */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Top Performing Clues</h3>
            <div className="space-y-3">
              {analytics.clueMetrics.topPerformingClues.slice(0, 5).map((clue, index) => (
                <div key={clue.id} className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      #{index + 1} {clue.name}
                    </p>
                    <p className="text-sm text-gray-500">{clue.findCount} finds · {clue.averageTime}min avg</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Popular Game Types */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Popular Game Types</h3>
            <div className="space-y-3">
              {analytics.gameMetrics.popularGameTypes.map((type, index) => (
                <div key={type.type} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">{type.type}</p>
                      <p className="text-sm text-gray-500">{type.count}</p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${(type.count / analytics.gameMetrics.popularGameTypes[0].count) * 100}%`
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Geographic Distribution */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Players by Region</h3>
            <div className="space-y-3">
              {analytics.geographicData.playersByRegion.map((region) => (
                <div key={region.region} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">{region.region}</p>
                      <p className="text-sm text-gray-500">{region.count}</p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{
                          width: `${(region.count / analytics.geographicData.playersByRegion[0].count) * 100}%`
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Popular Locations */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Popular Game Locations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {analytics.geographicData.popularLocations.map((location) => (
              <div key={location.location} className="text-center p-4 border rounded-lg">
                <MapPin className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">{location.location}</p>
                <p className="text-sm text-gray-500">{location.gameCount} games</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}