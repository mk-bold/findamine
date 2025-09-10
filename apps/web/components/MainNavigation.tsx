'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Home, Search, Settings, LogOut } from 'lucide-react';

export default function MainNavigation() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  // Don't show navigation on dashboard pages (they have their own layout)
  // or on auth pages
  if (pathname.startsWith('/dashboard') || 
      pathname.startsWith('/login') || 
      pathname.startsWith('/register') ||
      pathname.startsWith('/verify')) {
    return null;
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and main navigation */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <div className="text-2xl font-bold text-primary-600">
                Findamine
              </div>
            </Link>

            {user && (
              <div className="flex items-center space-x-6">
                <Link 
                  href="/" 
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === '/' 
                      ? 'bg-primary-100 text-primary-700' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Home className="h-4 w-4" />
                  <span>Home</span>
                </Link>
                
                <Link 
                  href="/games" 
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === '/games' 
                      ? 'bg-primary-100 text-primary-700' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Search className="h-4 w-4" />
                  <span>Discover Games</span>
                </Link>

                {/* Show dashboard link for admin/GM users */}
                {(user.role === 'ADMIN' || user.role === 'GAME_MANAGER') && (
                  <Link 
                    href="/dashboard" 
                    className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* User menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-700">
                  {user.firstName} {user.lastName}
                </span>
                <button
                  onClick={logout}
                  className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/login"
                  className="text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}