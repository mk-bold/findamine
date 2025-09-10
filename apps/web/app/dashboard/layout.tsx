'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCookieConsent } from '@/contexts/CookieConsentContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Users,
  Gamepad2,
  MapPin,
  Trophy,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
  Shield,
  UserCheck,
  Cookie,
  Search,
  Crown,
  MessageCircle,
  Target,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: string[];
}

interface NavSection {
  title: string;
  items: NavItem[];
}

// Player features - available to all users
const playerNavigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: Home, roles: ['ADMIN', 'GAME_MANAGER', 'PLAYER'] },
  { name: 'Games', href: '/dashboard/games/discover', icon: Search, roles: ['ADMIN', 'GAME_MANAGER', 'PLAYER'] },
  { name: 'My Clue Findings', href: '/dashboard/clue-findings', icon: Target, roles: ['ADMIN', 'GAME_MANAGER', 'PLAYER'] },
  { name: 'Players', href: '/dashboard/players', icon: UserCheck, roles: ['ADMIN', 'GAME_MANAGER', 'PLAYER'] },
  { name: 'Messages', href: '/dashboard/messages', icon: MessageCircle, roles: ['ADMIN', 'GAME_MANAGER', 'PLAYER'] },
  { name: 'Leaderboards', href: '/dashboard/leaderboards', icon: Trophy, roles: ['ADMIN', 'GAME_MANAGER', 'PLAYER'] },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings, roles: ['ADMIN', 'GAME_MANAGER', 'PLAYER'] },
];

// Management features - available to admins, game managers, and players who have created games
const managementNavigation: NavItem[] = [
  { name: 'Manager Dashboard', href: '/dashboard/manager', icon: Crown, roles: ['ADMIN', 'GAME_MANAGER'] },
  { name: 'Players', href: '/dashboard/users', icon: Users, roles: ['ADMIN', 'GAME_MANAGER'] },
  { name: 'Game Management', href: '/dashboard/games', icon: Gamepad2, roles: ['ADMIN', 'GAME_MANAGER'] },
  { name: 'Clue Locations', href: '/dashboard/clue-locations', icon: MapPin, roles: ['ADMIN', 'GAME_MANAGER'] },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3, roles: ['ADMIN', 'GAME_MANAGER'] },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout, isLoading } = useAuth();
  const { openSettings } = useCookieConsent();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [hasCreatedGames, setHasCreatedGames] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && !isLoading && !user) {
      router.push('/login');
    }
  }, [isClient, isLoading, user, router]);

  // Check if user has created games (for PLAYER role management access)
  useEffect(() => {
    const checkCreatedGames = async () => {
      if (user && user.role === 'PLAYER') {
        try {
          const response = await fetch('/api/games', {
            credentials: 'include',
          });
          if (response.ok) {
            const games = await response.json();
            setHasCreatedGames(games.length > 0);
          }
        } catch (error) {
          console.error('Error checking created games:', error);
        }
      }
    };

    if (user) {
      checkCreatedGames();
    }
  }, [user]);

  // Don't render anything until we're on the client and auth check is complete
  if (!isClient || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if user is not authenticated
  if (!user) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Filter navigation based on user role and permissions
  const getFilteredNavigation = (): NavSection[] => {
    const sections: NavSection[] = [];
    
    // Player section - always visible to all users
    const filteredPlayerNav = playerNavigation.filter(item => 
      item.roles.includes(user.role)
    );
    
    if (filteredPlayerNav.length > 0) {
      sections.push({
        title: 'Player',
        items: filteredPlayerNav
      });
    }
    
    // Management section - always show Game Management for all users, other management features require roles
    const canSeeManagement = user.role === 'ADMIN' || 
                            user.role === 'GAME_MANAGER' || 
                            user.role === 'PLAYER';
    
    if (canSeeManagement) {
      let filteredManagementNav = managementNavigation.filter(item => 
        item.roles.includes(user.role)
      );
      
      // For regular players, only show Game Management and Manager Dashboard (initially)
      // Other features only become available after they've created their first game
      if (user.role === 'PLAYER') {
        if (!hasCreatedGames) {
          // Before creating first game, only show Game Management and Manager Dashboard
          filteredManagementNav = managementNavigation.filter(item => 
            item.name === 'Game Management' || item.name === 'Manager Dashboard'
          );
        } else {
          // After creating games, show Game Management for sure
          const gameManagement = managementNavigation.find(item => item.name === 'Game Management');
          if (gameManagement && !filteredManagementNav.includes(gameManagement)) {
            filteredManagementNav.push(gameManagement);
          }
        }
      }
      
      if (filteredManagementNav.length > 0) {
        sections.push({
          title: 'Management',
          items: filteredManagementNav
        });
      }
    }
    
    return sections;
  };

  const navigationSections = getFilteredNavigation();

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-danger-100 text-danger-800';
      case 'GAME_MANAGER':
        return 'bg-warning-100 text-warning-800';
      case 'PLAYER':
        return 'bg-success-100 text-success-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-4">
            <h1 className="text-xl font-bold text-gray-900">Findamine</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 px-2 py-4 space-y-6">
            {navigationSections.map((section) => (
              <div key={section.title}>
                <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  {section.title}
                </h3>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                          isActive
                            ? 'bg-primary-100 text-primary-900'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <item.icon
                          className={`mr-3 h-5 w-5 ${
                            isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                          }`}
                        />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="flex h-16 items-center px-4">
            <h1 className="text-xl font-bold text-gray-900">Findamine</h1>
          </div>
          <nav className="flex-1 px-2 py-4 space-y-6">
            {navigationSections.map((section) => (
              <div key={section.title}>
                <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  {section.title}
                </h3>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                          isActive
                            ? 'bg-primary-100 text-primary-900'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <item.icon
                          className={`mr-3 h-5 w-5 ${
                            isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                          }`}
                        />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1"></div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* User info */}
              <div className="flex items-center gap-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {user.firstName && user.lastName 
                      ? `${user.firstName} ${user.lastName}`
                      : user.email
                    }
                  </p>
                  <div className="flex items-center gap-x-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                      {user.role === 'ADMIN' && <Shield className="h-3 w-3 mr-1" />}
                      {user.role === 'GAME_MANAGER' && <UserCheck className="h-3 w-3 mr-1" />}
                      {user.role}
                    </span>
                  </div>
                </div>
                <button
                  onClick={openSettings}
                  className="p-1 text-gray-400 hover:text-gray-500"
                  title="Cookie Settings"
                >
                  <Cookie className="h-5 w-5" />
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-x-2 text-sm text-gray-500 hover:text-gray-700"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 