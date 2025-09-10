'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { adminAPI, gameMasterAPI, playerAPI } from '@/lib/api';
import { Users, Gamepad2, MapPin, Trophy, TrendingUp, Activity } from 'lucide-react';
import toast from 'react-hot-toast';

interface DashboardStats {
  totalUsers?: number;
  totalPlayers: number;
  activeUsers?: number;
  totalGames: number;
  activeGames: number;
  totalClues: number;
  availableClues?: number;
  forthcomingClues?: number;
  totalFindings: number;
  recentActivity: any[];
}

export default function ManagerDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalPlayers: 0,
    totalGames: 0,
    activeGames: 0,
    totalClues: 0,
    totalFindings: 0,
    recentActivity: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      // Only fetch data if user is authenticated and has a role
      if (!user || !user.role) {
        setIsLoading(false);
        return;
      }

      // Only allow access to ADMIN and GAME_MANAGER roles
      if (user.role !== 'ADMIN' && user.role !== 'GAME_MANAGER') {
        toast.error('Access denied. This page is only available to administrators and game managers.');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        console.log('🔍 Manager Dashboard: User role is:', user.role);
        
        if (user.role === 'ADMIN') {
          console.log('📊 Manager Dashboard: Fetching admin stats...');
          const adminStats = await adminAPI.getStats();
          console.log('📊 Manager Dashboard: Admin stats received:', adminStats);
          setStats(adminStats);
        } else if (user.role === 'GAME_MANAGER') {
          console.log('📊 Manager Dashboard: Fetching game master stats...');
          const gameMasterStats = await gameMasterAPI.getStats();
          console.log('📊 Manager Dashboard: Game master stats received:', gameMasterStats);
          setStats(gameMasterStats);
        }
      } catch (error: any) {
        console.error('Failed to fetch manager dashboard data:', error);
        
        // More specific error messages based on the error
        if (error.response?.status === 401) {
          toast.error('Authentication required. Please log in again.');
        } else if (error.response?.status === 403) {
          toast.error('Access denied. You may not have permission to view this data.');
        } else {
          toast.error('Failed to load dashboard data. Please try again later.');
        }
        
        // Set default stats on error
        setStats({
          totalPlayers: 0,
          totalGames: 0,
          activeGames: 0,
          totalClues: 0,
          totalFindings: 0,
          recentActivity: [],
        });
      } finally {
        setIsLoading(false);
      }
    };

    // Add a longer delay to ensure user is fully authenticated and cookie is set
    const timer = setTimeout(() => {
      fetchDashboardData();
    }, 1000);

    return () => clearTimeout(timer);
  }, [user]);

  // Show access denied for players
  if (user && user.role === 'PLAYER') {
    return (
      <div className="min-h-96 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">This page is only available to administrators and game managers.</p>
          <Link href="/dashboard" className="inline-flex items-center px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="card">
      <div className="card-body">
        <div className="flex items-center">
          <div className={`flex-shrink-0 p-3 rounded-md ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-semibold text-gray-900">
              {isLoading ? '...' : value}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const QuickActionCard = ({ title, description, icon: Icon, href, color }: any) => (
    <Link href={href} className="card hover:shadow-lg transition-shadow cursor-pointer block">
      <div className="card-body">
        <div className="flex items-center">
          <div className={`flex-shrink-0 p-3 rounded-md ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Management Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your games, players, and platform analytics.
          </p>
        </div>
        <div>
          <Link href="/dashboard" className="inline-flex items-center px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors">
            ← Back to Player Dashboard
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Players"
          value={stats.totalPlayers}
          icon={Users}
          color="bg-primary-500"
        />
        <StatCard
          title="Active Games"
          value={stats.activeGames}
          icon={Gamepad2}
          color="bg-success-500"
        />
        <StatCard
          title="Total Clues"
          value={stats.totalClues}
          icon={MapPin}
          color="bg-warning-500"
        />
        <StatCard
          title="Total Findings"
          value={stats.totalFindings}
          icon={Trophy}
          color="bg-danger-500"
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {user?.role === 'ADMIN' && (
            <>
              <QuickActionCard
                title="Manage Users"
                description="View, edit, and manage user accounts"
                icon={Users}
                href="/dashboard/users"
                color="bg-primary-500"
              />
              <QuickActionCard
                title="System Analytics"
                description="View platform-wide statistics and insights"
                icon={TrendingUp}
                href="/dashboard/analytics"
                color="bg-success-500"
              />
            </>
          )}
          
          {(user?.role === 'ADMIN' || user?.role === 'GAME_MANAGER') && (
            <>
              <QuickActionCard
                title="Create Game"
                description="Set up a new geo-caching adventure"
                icon={Gamepad2}
                href="/dashboard/games?action=create"
                color="bg-warning-500"
              />
              <QuickActionCard
                title="Add Clue Location"
                description="Create new clue locations for games"
                icon={MapPin}
                href="/dashboard/clue-locations"
                color="bg-danger-500"
              />
            </>
          )}

          <QuickActionCard
            title="View Leaderboards"
            description="Check player rankings and achievements"
            icon={Trophy}
            href="/dashboard/leaderboards"
            color="bg-primary-500"
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
        <div className="card">
          <div className="card-body">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : stats.recentActivity && stats.recentActivity.length > 0 ? (
              <div className="space-y-4">
                {stats.recentActivity.map((activity: any, index: number) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <Activity className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.description}</p>
                      <p className="text-sm text-gray-500">{activity.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Activity className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No recent activity</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating your first game or adding clue locations.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Role-specific Information */}
      {user?.role === 'ADMIN' && (
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Admin Overview</h2>
          <div className="card">
            <div className="card-body">
              <p className="text-sm text-gray-600">
                As an administrator, you have full access to manage users, games, and system settings. 
                You can promote users to game masters, monitor platform activity, and configure system-wide settings.
              </p>
            </div>
          </div>
        </div>
      )}

      {user?.role === 'GAME_MANAGER' && (
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Game Master Tools</h2>
          <div className="card">
            <div className="card-body">
              <p className="text-sm text-gray-600">
                As a game master, you can create and manage games, add clue locations, and monitor player progress. 
                Use the quick actions above to get started with your first game.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}